import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub Webhook Handler
 * Receives webhook events from GitHub (push, PR, issues, etc.)
 * 
 * Setup:
 * 1. Go to your GitHub repo settings -> Webhooks
 * 2. Add webhook URL: https://your-app.base44.com/api/githubWebhook
 * 3. Set Content-Type: application/json
 * 4. Select events to receive (push, pull_request, issues, etc.)
 * 5. Add webhook secret to GITHUB_WEBHOOK_SECRET env var for validation
 */
Deno.serve(async (req) => {
  try {
    // Get webhook signature for validation
    const signature = req.headers.get('X-Hub-Signature-256');
    const event = req.headers.get('X-GitHub-Event');
    const deliveryId = req.headers.get('X-GitHub-Delivery');
    
    const body = await req.text();
    const payload = JSON.parse(body);
    
    // Optional: Validate webhook signature
    const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(body)
      );
      const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    console.log(`GitHub webhook received: ${event} (${deliveryId})`);
    
    // Initialize Base44 with service role for webhook processing
    const base44 = createClientFromRequest(req);
    
    // Handle different event types
    switch (event) {
      case 'push':
        console.log(`Push to ${payload.repository.full_name}:`, {
          ref: payload.ref,
          commits: payload.commits.length,
          pusher: payload.pusher.name
        });
        
        // Example: Store webhook event
        await base44.asServiceRole.entities.WebhookEvent.create({
          source: 'github',
          event_type: 'push',
          repository: payload.repository.full_name,
          data: {
            ref: payload.ref,
            commits: payload.commits.length,
            pusher: payload.pusher.name,
            head_commit: payload.head_commit
          },
          delivery_id: deliveryId
        });
        break;
        
      case 'pull_request':
        console.log(`PR ${payload.action}:`, {
          repo: payload.repository.full_name,
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          state: payload.pull_request.state
        });
        
        await base44.asServiceRole.entities.WebhookEvent.create({
          source: 'github',
          event_type: 'pull_request',
          repository: payload.repository.full_name,
          data: {
            action: payload.action,
            pr_number: payload.pull_request.number,
            title: payload.pull_request.title,
            state: payload.pull_request.state,
            author: payload.pull_request.user.login
          },
          delivery_id: deliveryId
        });
        break;
        
      case 'issues':
        console.log(`Issue ${payload.action}:`, {
          repo: payload.repository.full_name,
          number: payload.issue.number,
          title: payload.issue.title
        });
        
        await base44.asServiceRole.entities.WebhookEvent.create({
          source: 'github',
          event_type: 'issues',
          repository: payload.repository.full_name,
          data: {
            action: payload.action,
            issue_number: payload.issue.number,
            title: payload.issue.title,
            state: payload.issue.state,
            author: payload.issue.user.login
          },
          delivery_id: deliveryId
        });
        break;
        
      case 'workflow_run':
        console.log(`Workflow ${payload.action}:`, {
          repo: payload.repository.full_name,
          workflow: payload.workflow.name,
          status: payload.workflow_run.status,
          conclusion: payload.workflow_run.conclusion
        });
        
        await base44.asServiceRole.entities.WebhookEvent.create({
          source: 'github',
          event_type: 'workflow_run',
          repository: payload.repository.full_name,
          data: {
            action: payload.action,
            workflow_name: payload.workflow.name,
            run_id: payload.workflow_run.id,
            status: payload.workflow_run.status,
            conclusion: payload.workflow_run.conclusion
          },
          delivery_id: deliveryId
        });
        break;
        
      default:
        console.log(`Unhandled event type: ${event}`);
        
        // Store all events generically
        await base44.asServiceRole.entities.WebhookEvent.create({
          source: 'github',
          event_type: event,
          repository: payload.repository?.full_name || 'unknown',
          data: payload,
          delivery_id: deliveryId
        });
    }
    
    // Return 200 to acknowledge receipt
    return Response.json({ success: true, message: 'Webhook received' });
    
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});