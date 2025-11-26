import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub Actions
 * - List workflows
 * - Trigger workflow
 * - Get workflow runs
 * - Get workflow run status
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, workflow_id, run_id, inputs, ref = 'main' } = await req.json();
    
    if (!owner || !repo) {
      return Response.json({ error: 'owner and repo are required' }, { status: 400 });
    }
    
    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };

    let response;
    
    switch (action) {
      case 'list_workflows':
        // List workflows in repo
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
          headers
        });
        break;
        
      case 'trigger':
        // Trigger workflow dispatch
        if (!workflow_id) {
          return Response.json({ error: 'workflow_id is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ref,
            inputs: inputs || {}
          })
        });
        
        // GitHub returns 204 for successful dispatch
        if (response.status === 204) {
          return Response.json({ success: true, message: 'Workflow triggered successfully' });
        }
        break;
        
      case 'list_runs':
        // List workflow runs
        const params = workflow_id ? `workflow_id=${workflow_id}&` : '';
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?${params}per_page=50`, {
          headers
        });
        break;
        
      case 'get_run':
        // Get specific workflow run
        if (!run_id) {
          return Response.json({ error: 'run_id is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}`, {
          headers
        });
        break;
        
      case 'cancel_run':
        // Cancel workflow run
        if (!run_id) {
          return Response.json({ error: 'run_id is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/cancel`, {
          method: 'POST',
          headers
        });
        
        if (response.status === 202) {
          return Response.json({ success: true, message: 'Workflow run cancelled' });
        }
        break;
        
      case 'get_logs':
        // Get workflow run logs
        if (!run_id) {
          return Response.json({ error: 'run_id is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/logs`, {
          headers
        });
        
        // Logs are returned as zip file - return download URL
        return Response.json({ 
          success: true, 
          download_url: response.url 
        });
        
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: result.message || 'GitHub API error',
        details: result 
      }, { status: response.status });
    }

    return Response.json({ success: true, data: result });

  } catch (error) {
    console.error('GitHub Actions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});