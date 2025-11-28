import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const addressInput = await req.json();

    // Step 1: Standardize the address
    const standardizeResult = await helper.asServiceRole.functions.invoke(
      'standardizeAddress',
      addressInput
    );

    if (!standardizeResult.data?.success) {
      return Response.json({
        error: 'Failed to standardize address',
        details: standardizeResult.data
      }, { status: 400, headers: corsHeaders });
    }

    const standardized = standardizeResult.data.standardized;

    // Step 2: Check if canonical property exists by hash
    const existingProperties = await helper.asServiceRole.entities.CanonicalProperty.filter({
      address_hash: standardized.address_hash
    });

    if (existingProperties && existingProperties.length > 0) {
      // Property already exists
      return Response.json({
        success: true,
        canonical_property_id: (existingProperties[0] as any).id,
        is_new: false,
        property: existingProperties[0]
      }, { headers: corsHeaders });
    }

    // Step 3: Create new canonical property
    const newProperty = await helper.asServiceRole.entities.CanonicalProperty.create({
      unique_address_key: standardized.unique_address_key,
      address_hash: standardized.address_hash,
      street_number: standardized.street_number,
      street_name: standardized.street_name,
      street_suffix: standardized.street_suffix,
      unit_number: standardized.unit_number,
      city: standardized.city,
      state: standardized.state,
      zip_code: standardized.zip_code,
      county: standardized.county,
      latitude: standardized.latitude,
      longitude: standardized.longitude,
      geo_precision: standardized.geo_precision,
      formatted_address: standardized.formatted_address,
      last_geocoded_at: new Date().toISOString(),
      data_source: 'user_input'
    });

    // Step 4: Optionally fetch public data
    try {
      await helper.asServiceRole.functions.invoke('fetchPublicPropertyData', {
        canonical_property_id: (newProperty as any).id,
        address: standardized
      });
    } catch (error: any) {
      console.log('Could not fetch public data (API may not be configured):', error.message);
    }

    return Response.json({
      success: true,
      canonical_property_id: (newProperty as any).id,
      is_new: true,
      property: newProperty
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error finding or creating canonical property:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
