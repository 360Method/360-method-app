import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const { canonical_property_id, address } = await req.json();

    if (!canonical_property_id) {
      return Response.json({ error: 'Missing canonical_property_id' }, { status: 400, headers: corsHeaders });
    }

    // Check if public data already exists
    const existingData = await helper.asServiceRole.entities.PublicPropertyData.filter({
      canonical_property_id
    });

    if (existingData && existingData.length > 0) {
      const existing = existingData[0] as any;
      // Check if data is recent (less than 30 days old)
      const lastRefresh = new Date(existing.last_refreshed_at || 0);
      const daysSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceRefresh < 30) {
        return Response.json({
          success: true,
          public_data_id: existing.id,
          is_cached: true,
          data: existing
        }, { headers: corsHeaders });
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

    let savedData: any;
    if (existingData && existingData.length > 0) {
      // Update existing
      savedData = await helper.asServiceRole.entities.PublicPropertyData.update(
        (existingData[0] as any).id,
        publicData
      );
    } else {
      // Create new
      savedData = await helper.asServiceRole.entities.PublicPropertyData.create(publicData);
    }

    return Response.json({
      success: true,
      public_data_id: savedData.id,
      is_cached: false,
      data: savedData,
      note: 'Public data API integration pending. Configure ATTOM or Estated API keys to enable automatic data enrichment.'
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching public property data:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
