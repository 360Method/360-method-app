import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub Issues & Pull Requests
 * - List issues
 * - Create issue
 * - Update issue
 * - Close issue
 * - List PRs
 * - Create PR
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, number, data: issueData } = await req.json();
    
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
      case 'list':
        // List issues
        const state = issueData?.state || 'open';
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`, {
          headers
        });
        break;
        
      case 'get':
        // Get specific issue
        if (!number) {
          return Response.json({ error: 'issue number is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${number}`, {
          headers
        });
        break;
        
      case 'create':
        // Create new issue
        if (!issueData?.title) {
          return Response.json({ error: 'Issue title is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: issueData.title,
            body: issueData.body || '',
            labels: issueData.labels || [],
            assignees: issueData.assignees || []
          })
        });
        break;
        
      case 'update':
        // Update issue
        if (!number) {
          return Response.json({ error: 'issue number is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${number}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(issueData)
        });
        break;
        
      case 'close':
        // Close issue
        if (!number) {
          return Response.json({ error: 'issue number is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${number}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ state: 'closed' })
        });
        break;
        
      case 'list_prs':
        // List pull requests
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`, {
          headers
        });
        break;
        
      case 'create_pr':
        // Create pull request
        if (!issueData?.title || !issueData?.head || !issueData?.base) {
          return Response.json({ error: 'PR requires title, head, and base branch' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: issueData.title,
            body: issueData.body || '',
            head: issueData.head,
            base: issueData.base
          })
        });
        break;
        
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
    console.error('GitHub issues error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});