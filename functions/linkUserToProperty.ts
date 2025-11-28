import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const {
      canonical_property_id,
      raw_address,
      display_name,
      ownership_type,
      acquisition_date,
      acquisition_price,
      monthly_rent,
      management_type,
      operator_id,
      notes,
      tags
    } = await req.json();

    let finalCanonicalId = canonical_property_id;

    // If no canonical ID provided, find or create from address
    if (!finalCanonicalId && raw_address) {
      const canonicalResult = await helper.asServiceRole.functions.invoke('findOrCreateCanonicalProperty', {
        raw_address
      });

      if (!canonicalResult.data?.success) {
        return Response.json({
          error: 'Failed to resolve canonical property',
          details: canonicalResult.data
        }, { status: 400, headers: corsHeaders });
      }

      finalCanonicalId = canonicalResult.data.canonical_property_id;
    }

    if (!finalCanonicalId) {
      return Response.json({
        error: 'Must provide either canonical_property_id or raw_address'
      }, { status: 400, headers: corsHeaders });
    }

    // Check if user already linked to this property
    const existingLink = await helper.entities.UserProperty.filter({
      canonical_property_id: finalCanonicalId,
      user_id: user.id
    });

    if (existingLink && existingLink.length > 0) {
      return Response.json({
        success: false,
        error: 'User already linked to this property',
        user_property_id: (existingLink[0] as any).id,
        property: existingLink[0]
      }, { status: 409, headers: corsHeaders });
    }

    // Create user property link
    const userProperty = await helper.entities.UserProperty.create({
      canonical_property_id: finalCanonicalId,
      user_id: user.id,
      display_name,
      property_status: 'active',
      ownership_type,
      acquisition_date,
      acquisition_price,
      monthly_rent,
      management_type,
      operator_id,
      notes,
      tags: tags || [],
      photo_urls: [],
      health_score: 0,
      baseline_completed: false
    });

    // Get full property details for response
    const canonicalProperties = await helper.asServiceRole.entities.CanonicalProperty.filter({
      id: finalCanonicalId
    });

    const publicData = await helper.asServiceRole.entities.PublicPropertyData.filter({
      canonical_property_id: finalCanonicalId
    });

    return Response.json({
      success: true,
      user_property_id: (userProperty as any).id,
      user_property: userProperty,
      canonical_property: canonicalProperties[0] || null,
      public_data: publicData[0] || null
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error linking user to property:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
