import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      job_type, 
      payload, 
      priority = 'normal', 
      queue = 'default', 
      scheduled_for = null,
      max_attempts = 3 
    } = await req.json();

    if (!job_type || !payload) {
      return Response.json({ error: 'Missing job_type or payload' }, { status: 400 });
    }

    const job = await base44.asServiceRole.entities.Job.create({
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
    });
  } catch (error) {
    console.error('Error queueing job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});