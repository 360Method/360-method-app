import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    
    const { 
      job_type, 
      payload, 
      priority = 'normal', 
      queue = 'default', 
      scheduled_for = null,
      max_attempts = 3 
    } = await req.json();

    if (!job_type || !payload) {
      return Response.json({ error: 'Missing job_type or payload' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const job = await helper.asServiceRole.entities.Job.create({
      job_type,
      status: 'pending',
      payload,
      priority,
      queue,
      scheduled_for: scheduled_for || new Date().toISOString(),
      attempts: 0,
      max_attempts
    });

    return Response.json({ 
      success: true, 
      job_id: job.id 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error queueing job:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
