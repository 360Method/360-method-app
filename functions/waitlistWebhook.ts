import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const method = req.method;

    // GET: Retrieve waitlist entries (for Zapier polling)
    if (method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const sinceDate = url.searchParams.get('since');
      
      let query = {};
      if (sinceDate) {
        query.created_date = { $gte: sinceDate };
      }

      const waitlistEntries = await base44.asServiceRole.entities.Waitlist.filter(
        query,
        '-created_date',
        limit
      );

      return Response.json({
        success: true,
        count: waitlistEntries.length,
        entries: waitlistEntries.map(entry => ({
          id: entry.id,
          first_name: entry.first_name,
          last_name: entry.last_name,
          email: entry.email,
          phone: entry.phone,
          zip_code: entry.zip_code,
          region: entry.region,
          property_type: entry.property_type,
          door_count: entry.door_count,
          service_tier: entry.service_tier,
          status: entry.status,
          notes: entry.notes,
          source: entry.source,
          marketing_consent: entry.marketing_consent,
          created_date: entry.created_date,
          updated_date: entry.updated_date
        }))
      });
    }

    // POST: Receive webhook notification for new entry
    if (method === 'POST') {
      const body = await req.json();
      const entryId = body.entry_id;

      if (!entryId) {
        return Response.json({
          success: false,
          error: 'entry_id is required'
        }, { status: 400 });
      }

      const entry = await base44.asServiceRole.entities.Waitlist.filter({ id: entryId });
      
      if (!entry || entry.length === 0) {
        return Response.json({
          success: false,
          error: 'Entry not found'
        }, { status: 404 });
      }

      const waitlistEntry = entry[0];

      return Response.json({
        success: true,
        entry: {
          id: waitlistEntry.id,
          first_name: waitlistEntry.first_name,
          last_name: waitlistEntry.last_name,
          email: waitlistEntry.email,
          phone: waitlistEntry.phone,
          zip_code: waitlistEntry.zip_code,
          region: waitlistEntry.region,
          property_type: waitlistEntry.property_type,
          door_count: waitlistEntry.door_count,
          service_tier: waitlistEntry.service_tier,
          status: waitlistEntry.status,
          notes: waitlistEntry.notes,
          source: waitlistEntry.source,
          marketing_consent: waitlistEntry.marketing_consent,
          consent_timestamp: waitlistEntry.consent_timestamp,
          created_date: waitlistEntry.created_date
        }
      });
    }

    return Response.json({
      success: false,
      error: 'Method not allowed. Use GET to fetch entries or POST to retrieve specific entry.'
    }, { status: 405 });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});