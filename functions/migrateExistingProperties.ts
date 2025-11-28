import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    }

    const { dry_run = true, limit = 10 } = await req.json();

    // Get existing properties
    const existingProperties = await helper.asServiceRole.entities.Property.filter({});

    const results: any = {
      total_processed: 0,
      canonical_created: 0,
      user_properties_created: 0,
      public_data_created: 0,
      errors: [],
      duplicates_found: []
    };

    const propertiesToProcess = existingProperties.slice(0, limit);

    for (const property of propertiesToProcess) {
      try {
        const prop = property as any;
        results.total_processed++;

        // Skip if already migrated (has canonical_property_id field populated)
        if (prop.canonical_property_id) {
          console.log(`Property ${prop.id} already migrated`);
          continue;
        }

        // Build address from property data
        const addressInput = {
          street_number: prop.street_address?.split(' ')[0],
          street_name: prop.street_address?.split(' ').slice(1).join(' '),
          city: prop.city,
          state: prop.state,
          zip_code: prop.zip_code
        };

        if (!addressInput.city || !addressInput.state) {
          results.errors.push({
            property_id: prop.id,
            error: 'Missing required address fields'
          });
          continue;
        }

        if (dry_run) {
          console.log(`Would migrate property ${prop.id}:`, addressInput);
          continue;
        }

        // Find or create canonical property
        const canonicalResult = await helper.asServiceRole.functions.invoke(
          'findOrCreateCanonicalProperty',
          addressInput
        );

        if (!canonicalResult.data?.success) {
          results.errors.push({
            property_id: prop.id,
            error: 'Failed to create canonical property',
            details: canonicalResult.data
          });
          continue;
        }

        const canonical_property_id = canonicalResult.data.canonical_property_id;

        if (canonicalResult.data.is_new) {
          results.canonical_created++;
        } else {
          results.duplicates_found.push({
            property_id: prop.id,
            canonical_property_id
          });
        }

        // Create UserProperty record
        const userProperty = await helper.asServiceRole.entities.UserProperty.create({
          canonical_property_id,
          user_id: prop.created_by, // Assuming created_by is user_id
          display_name: prop.address,
          property_status: 'active',
          ownership_type: prop.property_use_type || 'primary_residence',
          acquisition_date: prop.purchase_date,
          acquisition_price: prop.purchase_price,
          current_estimated_value: prop.current_value,
          monthly_rent: prop.monthly_rent,
          management_type: prop.property_manager ? 'property_manager' : 'self_managed',
          operator_id: prop.operator_id,
          health_score: prop.health_score || 0,
          baseline_completed: prop.setup_completed || false,
          last_inspection_date: prop.last_inspection_date,
          notes: null,
          photo_urls: [],
          tags: []
        });

        results.user_properties_created++;

        // Create PublicPropertyData from existing property data
        const publicData = await helper.asServiceRole.entities.PublicPropertyData.create({
          canonical_property_id,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          square_footage: prop.square_footage,
          year_built: prop.year_built,
          stories: parseStories(prop.stories),
          property_type: mapPropertyType(prop.property_type),
          data_source: 'migration',
          last_refreshed_at: new Date().toISOString()
        });

        results.public_data_created++;

        // Update original Property with canonical_property_id reference
        await helper.asServiceRole.entities.Property.update(prop.id, {
          canonical_property_id,
          // Add migration_note to track this
          notes: (prop.notes || '') + `\n[Migrated to new data architecture on ${new Date().toISOString()}]`
        });

      } catch (error: any) {
        results.errors.push({
          property_id: (property as any).id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      dry_run,
      results
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error migrating properties:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

function parseStories(storiesStr: string | null) {
  if (!storiesStr) return null;
  const match = storiesStr.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function mapPropertyType(type: string) {
  const typeMap: Record<string, string> = {
    'Single-Family Home': 'single_family',
    'Duplex': 'multi_family',
    'Triplex': 'multi_family',
    'Fourplex': 'multi_family',
    'Condo/Townhouse': 'condo',
    'Mobile/Manufactured Home': 'mobile'
  };
  return typeMap[type] || 'single_family';
}
