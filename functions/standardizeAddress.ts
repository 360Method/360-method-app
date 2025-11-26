import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      raw_address, 
      street_number,
      street_name,
      street_suffix,
      unit_number,
      city,
      state,
      zip_code 
    } = await req.json();

    let parsedAddress;

    if (raw_address) {
      // Parse raw address string
      parsedAddress = parseRawAddress(raw_address);
    } else {
      // Use provided components
      parsedAddress = {
        street_number,
        street_name,
        street_suffix,
        unit_number,
        city,
        state,
        zip_code
      };
    }

    // Standardize components
    const standardized = standardizeComponents(parsedAddress);

    // Geocode via Google Maps if API key available
    let geocoded = null;
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (googleApiKey) {
      try {
        geocoded = await geocodeAddress(standardized, googleApiKey);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Generate unique identifiers
    const unique_address_key = generateUniqueAddressKey(standardized);
    const address_hash = generateAddressHash(unique_address_key);

    return Response.json({
      success: true,
      standardized: {
        ...standardized,
        ...(geocoded || {}),
        unique_address_key,
        address_hash
      }
    });
  } catch (error) {
    console.error('Error standardizing address:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseRawAddress(raw) {
  // Basic address parsing (can be enhanced)
  const parts = raw.trim().split(',').map(p => p.trim());
  
  if (parts.length < 3) {
    throw new Error('Invalid address format. Expected: Street, City, State ZIP');
  }

  const streetPart = parts[0];
  const city = parts[1];
  const stateZip = parts[2].split(' ').filter(p => p);

  const state = stateZip[0];
  const zip_code = stateZip[1];

  // Parse street
  const streetTokens = streetPart.split(' ');
  const street_number = streetTokens[0];
  const street_suffix = streetTokens[streetTokens.length - 1];
  const street_name = streetTokens.slice(1, -1).join(' ');

  return {
    street_number,
    street_name,
    street_suffix,
    unit_number: null,
    city,
    state,
    zip_code
  };
}

function standardizeComponents(address) {
  const suffixMap = {
    'avenue': 'Ave', 'ave': 'Ave', 'av': 'Ave',
    'street': 'St', 'st': 'St', 'str': 'St',
    'boulevard': 'Blvd', 'blvd': 'Blvd', 'boul': 'Blvd',
    'drive': 'Dr', 'dr': 'Dr', 'drv': 'Dr',
    'road': 'Rd', 'rd': 'Rd',
    'lane': 'Ln', 'ln': 'Ln',
    'court': 'Ct', 'ct': 'Ct',
    'circle': 'Cir', 'cir': 'Cir',
    'way': 'Way',
    'place': 'Pl', 'pl': 'Pl'
  };

  const directionalMap = {
    'north': 'N', 'south': 'S', 'east': 'E', 'west': 'W',
    'northeast': 'NE', 'northwest': 'NW', 'southeast': 'SE', 'southwest': 'SW'
  };

  const stateMap = {
    'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY',
    'pennsylvania': 'PA', 'illinois': 'IL', 'ohio': 'OH', 'georgia': 'GA',
    'north carolina': 'NC', 'michigan': 'MI', 'washington': 'WA'
    // Add more as needed
  };

  return {
    street_number: address.street_number?.trim(),
    street_name: toTitleCase(address.street_name?.trim() || ''),
    street_suffix: suffixMap[address.street_suffix?.toLowerCase()] || toTitleCase(address.street_suffix || ''),
    unit_number: address.unit_number?.trim() || null,
    city: toTitleCase(address.city?.trim() || ''),
    state: (stateMap[address.state?.toLowerCase()] || address.state?.toUpperCase() || '').substring(0, 2),
    zip_code: address.zip_code?.replace(/[^0-9]/g, '').substring(0, 5),
    formatted_address: null // Will be set by geocoding or constructed
  };
}

async function geocodeAddress(address, apiKey) {
  const addressString = `${address.street_number} ${address.street_name} ${address.street_suffix}, ${address.city}, ${address.state} ${address.zip_code}`;
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const result = data.results[0];
    
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      geo_precision: result.geometry.location_type.toLowerCase(),
      formatted_address: result.formatted_address,
      county: extractCounty(result.address_components),
      parcel_number: null // Not provided by Google
    };
  }

  return null;
}

function extractCounty(components) {
  const countyComponent = components.find(c => 
    c.types.includes('administrative_area_level_2')
  );
  return countyComponent?.long_name || null;
}

function generateUniqueAddressKey(address) {
  const parts = [
    address.street_number,
    address.street_name,
    address.street_suffix,
    address.unit_number,
    getCityAbbreviation(address.city),
    address.state,
    address.zip_code
  ];

  return parts
    .filter(p => p)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function generateAddressHash(uniqueKey) {
  return createHash('sha256').update(uniqueKey).digest('hex');
}

function getCityAbbreviation(city) {
  // Simple abbreviation - first 2-3 letters
  return city.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3);
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}