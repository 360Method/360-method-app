import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const addressInput = await req.json();

    // Step 1: Standardize the address
    const standardizeResult = await base44.asServiceRole.functions.invoke(
      'standardizeAddress',
      addressInput
    );

    if (!standardizeResult.data?.success) {
      return Response.json({ 
        error: 'Failed to standardize address',
        details: standardizeResult.data 
      }, { status: 400 });
    }

    const standardized = standardizeResult.data.standardized;

    // Step 2: Check if canonical property exists by hash
    const existingProperties = await base44.asServiceRole.entities.CanonicalProperty.filter({
      address_hash: standardized.address_hash
    });

    if (existingProperties && existingProperties.length > 0) {
      // Property already exists
      return Response.json({
        success: true,
        canonical_property_id: existingProperties[0].id,
        is_new: false,
        property: existingProperties[0]
      });
    }

    // Step 3: Create new canonical property
    const newProperty = await base44.asServiceRole.entities.CanonicalProperty.create({
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
      await base44.asServiceRole.functions.invoke('fetchPublicPropertyData', {
        canonical_property_id: newProperty.id,
        address: standardized
      });
    } catch (error) {
      console.log('Could not fetch public data (API may not be configured):', error.message);
    }

    return Response.json({
      success: true,
      canonical_property_id: newProperty.id,
      is_new: true,
      property: newProperty
    });
  } catch (error) {
    console.error('Error finding or creating canonical property:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});