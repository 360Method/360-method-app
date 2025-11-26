import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { canonical_property_id, address } = await req.json();

    if (!canonical_property_id) {
      return Response.json({ error: 'Missing canonical_property_id' }, { status: 400 });
    }

    // Check if public data already exists
    const existingData = await base44.asServiceRole.entities.PublicPropertyData.filter({
      canonical_property_id
    });

    if (existingData && existingData.length > 0) {
      // Check if data is recent (less than 30 days old)
      const lastRefresh = new Date(existingData[0].last_refreshed_at || 0);
      const daysSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceRefresh < 30) {
        return Response.json({
          success: true,
          public_data_id: existingData[0].id,
          is_cached: true,
          data: existingData[0]
        });
      }
    }

    // TODO: Integrate with property data API when available
    // For now, create a stub record with basic data
    
    // Placeholder: In production, you would call:
    // - ATTOM API: https://api.gateway.attomdata.com/
    // - Estated API: https://apis.estated.com/
    // - Or other property data provider

    const publicData = {
      canonical_property_id,
      data_source: 'manual_stub',
      last_refreshed_at: new Date().toISOString()
    };

    let savedData;
    if (existingData && existingData.length > 0) {
      // Update existing
      savedData = await base44.asServiceRole.entities.PublicPropertyData.update(
        existingData[0].id,
        publicData
      );
    } else {
      // Create new
      savedData = await base44.asServiceRole.entities.PublicPropertyData.create(publicData);
    }

    return Response.json({
      success: true,
      public_data_id: savedData.id,
      is_cached: false,
      data: savedData,
      note: 'Public data API integration pending. Configure ATTOM or Estated API keys to enable automatic data enrichment.'
    });
  } catch (error) {
    console.error('Error fetching public property data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});