import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
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
      const canonicalResult = await base44.functions.invoke('findOrCreateCanonicalProperty', {
        raw_address
      });

      if (!canonicalResult.data?.success) {
        return Response.json({ 
          error: 'Failed to resolve canonical property',
          details: canonicalResult.data 
        }, { status: 400 });
      }

      finalCanonicalId = canonicalResult.data.canonical_property_id;
    }

    if (!finalCanonicalId) {
      return Response.json({ 
        error: 'Must provide either canonical_property_id or raw_address' 
      }, { status: 400 });
    }

    // Check if user already linked to this property
    const existingLink = await base44.entities.UserProperty.filter({
      canonical_property_id: finalCanonicalId,
      user_id: user.id
    });

    if (existingLink && existingLink.length > 0) {
      return Response.json({
        success: false,
        error: 'User already linked to this property',
        user_property_id: existingLink[0].id,
        property: existingLink[0]
      }, { status: 409 });
    }

    // Create user property link
    const userProperty = await base44.entities.UserProperty.create({
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
    const canonicalProperties = await base44.asServiceRole.entities.CanonicalProperty.filter({
      id: finalCanonicalId
    });
    
    const publicData = await base44.asServiceRole.entities.PublicPropertyData.filter({
      canonical_property_id: finalCanonicalId
    });

    return Response.json({
      success: true,
      user_property_id: userProperty.id,
      user_property: userProperty,
      canonical_property: canonicalProperties[0] || null,
      public_data: publicData[0] || null
    });
  } catch (error) {
    console.error('Error linking user to property:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});