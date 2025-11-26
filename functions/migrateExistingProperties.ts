import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dry_run = true, limit = 10 } = await req.json();

    // Get existing properties
    const existingProperties = await base44.asServiceRole.entities.Property.list('-created_date', limit);

    const results = {
      total_processed: 0,
      canonical_created: 0,
      user_properties_created: 0,
      public_data_created: 0,
      errors: [],
      duplicates_found: []
    };

    for (const property of existingProperties) {
      try {
        results.total_processed++;

        // Skip if already migrated (has canonical_property_id field populated)
        if (property.canonical_property_id) {
          console.log(`Property ${property.id} already migrated`);
          continue;
        }

        // Build address from property data
        const addressInput = {
          street_number: property.street_address?.split(' ')[0],
          street_name: property.street_address?.split(' ').slice(1).join(' '),
          city: property.city,
          state: property.state,
          zip_code: property.zip_code
        };

        if (!addressInput.city || !addressInput.state) {
          results.errors.push({
            property_id: property.id,
            error: 'Missing required address fields'
          });
          continue;
        }

        if (dry_run) {
          console.log(`Would migrate property ${property.id}:`, addressInput);
          continue;
        }

        // Find or create canonical property
        const canonicalResult = await base44.asServiceRole.functions.invoke(
          'findOrCreateCanonicalProperty',
          addressInput
        );

        if (!canonicalResult.data?.success) {
          results.errors.push({
            property_id: property.id,
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
            property_id: property.id,
            canonical_property_id
          });
        }

        // Create UserProperty record
        const userProperty = await base44.asServiceRole.entities.UserProperty.create({
          canonical_property_id,
          user_id: property.created_by, // Assuming created_by is user_id
          display_name: property.address,
          property_status: 'active',
          ownership_type: property.property_use_type || 'primary_residence',
          acquisition_date: property.purchase_date,
          acquisition_price: property.purchase_price,
          current_estimated_value: property.current_value,
          monthly_rent: property.monthly_rent,
          management_type: property.property_manager ? 'property_manager' : 'self_managed',
          operator_id: property.operator_id,
          health_score: property.health_score || 0,
          baseline_completed: property.setup_completed || false,
          last_inspection_date: property.last_inspection_date,
          notes: null,
          photo_urls: [],
          tags: []
        });

        results.user_properties_created++;

        // Create PublicPropertyData from existing property data
        const publicData = await base44.asServiceRole.entities.PublicPropertyData.create({
          canonical_property_id,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          square_footage: property.square_footage,
          year_built: property.year_built,
          stories: parseStories(property.stories),
          property_type: mapPropertyType(property.property_type),
          data_source: 'migration',
          last_refreshed_at: new Date().toISOString()
        });

        results.public_data_created++;

        // Update original Property with canonical_property_id reference
        await base44.asServiceRole.entities.Property.update(property.id, {
          canonical_property_id,
          // Add migration_note to track this
          notes: (property.notes || '') + `\n[Migrated to new data architecture on ${new Date().toISOString()}]`
        });

      } catch (error) {
        results.errors.push({
          property_id: property.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      dry_run,
      results
    });
  } catch (error) {
    console.error('Error migrating properties:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseStories(storiesStr) {
  if (!storiesStr) return null;
  const match = storiesStr.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function mapPropertyType(type) {
  const typeMap = {
    'Single-Family Home': 'single_family',
    'Duplex': 'multi_family',
    'Triplex': 'multi_family',
    'Fourplex': 'multi_family',
    'Condo/Townhouse': 'condo',
    'Mobile/Manufactured Home': 'mobile'
  };
  return typeMap[type] || 'single_family';
}