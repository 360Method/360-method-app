import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub Repository Operations
 * - List repositories
 * - Get repository details
 * - Create repository
 * - Update repository
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, data: repoData } = await req.json();
    
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
        // List user's repositories
        response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers
        });
        break;
        
      case 'get':
        // Get specific repository
        if (!owner || !repo) {
          return Response.json({ error: 'owner and repo are required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers
        });
        break;
        
      case 'create':
        // Create new repository
        if (!repoData?.name) {
          return Response.json({ error: 'Repository name is required' }, { status: 400 });
        }
        response = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: repoData.name,
            description: repoData.description || '',
            private: repoData.private || false,
            auto_init: repoData.auto_init || true
          })
        });
        break;
        
      case 'update':
        // Update repository
        if (!owner || !repo) {
          return Response.json({ error: 'owner and repo are required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(repoData)
        });
        break;
        
      case 'branches':
        // List branches
        if (!owner || !repo) {
          return Response.json({ error: 'owner and repo are required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
          headers
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
    console.error('GitHub repos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});