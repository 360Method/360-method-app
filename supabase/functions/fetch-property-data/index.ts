// Supabase Edge Function: fetch-property-data
// Fetches property data from external APIs and stores in public_property_data table
//
// Usage:
// POST /functions/v1/fetch-property-data
// Body: { "address": "1112 Orizaba Ave, Long Beach, CA 90804" }
// or: { "streetAddress": "1112 Orizaba Ave", "city": "Long Beach", "state": "CA", "zipCode": "90804" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Address standardization function (mirrors the PostgreSQL function)
function standardizeAddress(streetAddress: string, city: string, state: string, zipCode: string): string {
  let standardized = [streetAddress, city, state, zipCode].join('').toLowerCase();

  // Remove non-alphanumeric
  standardized = standardized.replace(/[^a-z0-9]/g, '');

  // City abbreviations
  const cityAbbrevs: Record<string, string> = {
    'longbeach': 'lb', 'losangeles': 'la', 'sanfrancisco': 'sf',
    'sandiego': 'sd', 'newyork': 'ny', 'lasvegas': 'lv'
  };

  // Street abbreviations
  const streetAbbrevs: Record<string, string> = {
    'avenue': 'ave', 'street': 'st', 'boulevard': 'blvd', 'drive': 'dr',
    'road': 'rd', 'lane': 'ln', 'court': 'ct', 'place': 'pl', 'circle': 'cir'
  };

  Object.entries(cityAbbrevs).forEach(([full, abbrev]) => {
    standardized = standardized.replace(new RegExp(full, 'g'), abbrev);
  });

  Object.entries(streetAbbrevs).forEach(([full, abbrev]) => {
    standardized = standardized.replace(new RegExp(full, 'g'), abbrev);
  });

  return standardized;
}

// Parse a full address string into components
function parseAddress(fullAddress: string): { streetAddress: string; city: string; state: string; zipCode: string } {
  const parts = fullAddress.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    const streetAddress = parts[0];
    const city = parts[1];
    const stateZipMatch = parts[parts.length - 1].match(/([A-Z]{2})\s*(\d{5})?/i);

    return {
      streetAddress,
      city,
      state: stateZipMatch ? stateZipMatch[1].toUpperCase() : '',
      zipCode: stateZipMatch ? (stateZipMatch[2] || '') : ''
    };
  }

  // Fallback
  const zipMatch = fullAddress.match(/\d{5}/);
  const stateMatch = fullAddress.match(/\b([A-Z]{2})\b/);

  return {
    streetAddress: fullAddress,
    city: '',
    state: stateMatch ? stateMatch[1] : '',
    zipCode: zipMatch ? zipMatch[0] : ''
  };
}

// Fetch from Zillow API via RapidAPI
async function fetchZillowData(address: string, rapidApiKey: string): Promise<any> {
  const encodedAddress = encodeURIComponent(address);

  // Zillow API endpoint (via RapidAPI)
  const response = await fetch(
    `https://zillow-com1.p.rapidapi.com/property?address=${encodedAddress}`,
    {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zillow API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Alternative: Fetch from Realtor API via RapidAPI
async function fetchRealtorData(address: string, rapidApiKey: string): Promise<any> {
  const encodedAddress = encodeURIComponent(address);

  const response = await fetch(
    `https://realtor16.p.rapidapi.com/property?address=${encodedAddress}`,
    {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Realtor API error: ${response.status}`);
  }

  return await response.json();
}

// Transform Zillow API response to our schema
function transformZillowData(data: any, addressComponents: any): any {
  const { streetAddress, city, state, zipCode } = addressComponents;
  const standardizedId = standardizeAddress(streetAddress, city, state, zipCode);

  return {
    standardized_address_id: standardizedId,
    formatted_address: data.address?.streetAddress
      ? `${data.address.streetAddress}, ${data.address.city}, ${data.address.state} ${data.address.zipcode}`
      : `${streetAddress}, ${city}, ${state} ${zipCode}`,
    street_address: data.address?.streetAddress || streetAddress,
    city: data.address?.city || city,
    state: data.address?.state || state,
    zip_code: data.address?.zipcode || zipCode,
    county: data.county || null,

    // Property details
    bedrooms: data.bedrooms || null,
    bathrooms: data.bathrooms || null,
    square_footage: data.livingArea || data.livingAreaValue || null,
    lot_size_sqft: data.lotSize || data.lotAreaValue || null,
    year_built: data.yearBuilt || null,
    property_type: data.homeType || data.propertyType || null,
    stories: data.stories || null,
    garage_spaces: data.garageSpaces || null,
    pool: data.hasPool || false,

    // Valuation
    zestimate: data.zestimate || null,
    zestimate_low: data.zestimateLowPercent ? data.zestimate * (1 - data.zestimateLowPercent / 100) : null,
    zestimate_high: data.zestimateHighPercent ? data.zestimate * (1 + data.zestimateHighPercent / 100) : null,
    rent_zestimate: data.rentZestimate || null,
    tax_assessment: data.taxAssessedValue || null,
    tax_year: data.taxAssessedYear || null,

    // Sale history
    last_sale_price: data.lastSoldPrice || null,
    last_sale_date: data.lastSoldDate || null,

    // Source tracking
    data_source: 'zillow',
    zillow_id: data.zpid?.toString() || null,
    parcel_number: data.parcelId || null,

    last_updated: new Date().toISOString()
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");

    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({
          error: "RAPIDAPI_KEY not configured",
          message: "Please set RAPIDAPI_KEY in Supabase Edge Function secrets"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    let addressComponents: { streetAddress: string; city: string; state: string; zipCode: string };
    let fullAddress: string;

    if (body.address) {
      // Full address string provided
      fullAddress = body.address;
      addressComponents = parseAddress(body.address);
    } else if (body.streetAddress) {
      // Components provided
      addressComponents = {
        streetAddress: body.streetAddress,
        city: body.city || '',
        state: body.state || '',
        zipCode: body.zipCode || body.zip_code || ''
      };
      fullAddress = `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zipCode}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing address. Provide 'address' or 'streetAddress'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we already have recent data for this address
    const standardizedId = standardizeAddress(
      addressComponents.streetAddress,
      addressComponents.city,
      addressComponents.state,
      addressComponents.zipCode
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing data less than 30 days old
    const { data: existingData } = await supabase
      .from('public_property_data')
      .select('*')
      .eq('standardized_address_id', standardizedId)
      .single();

    if (existingData) {
      const lastUpdated = new Date(existingData.last_updated);
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 30 && !body.forceRefresh) {
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            data: existingData,
            message: `Using cached data from ${Math.floor(daysSinceUpdate)} days ago`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch from Zillow API
    console.log(`Fetching property data for: ${fullAddress}`);
    const zillowData = await fetchZillowData(fullAddress, rapidApiKey);

    if (!zillowData || zillowData.error) {
      return new Response(
        JSON.stringify({
          error: "Property not found",
          details: zillowData?.error || "No data returned from API"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform and store the data
    const transformedData = transformZillowData(zillowData, addressComponents);

    const { data: upsertedData, error: upsertError } = await supabase
      .from('public_property_data')
      .upsert(transformedData, { onConflict: 'standardized_address_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to store property data", details: upsertError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also update any properties that match this standardized_address_id
    // to ensure they have the latest public data linked
    await supabase
      .from('properties')
      .update({ standardized_address_id: standardizedId })
      .eq('standardized_address_id', standardizedId);

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        data: upsertedData,
        message: "Property data fetched and stored successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
