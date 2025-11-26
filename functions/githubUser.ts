import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub User & Organization Data
 * - Get authenticated user
 * - Get user by username
 * - List organizations
 * - Get organization members
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, username, org } = await req.json();
    
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
      case 'me':
        // Get authenticated user
        response = await fetch('https://api.github.com/user', {
          headers
        });
        break;
        
      case 'get':
        // Get user by username
        if (!username) {
          return Response.json({ error: 'username is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/users/${username}`, {
          headers
        });
        break;
        
      case 'orgs':
        // List user's organizations
        response = await fetch('https://api.github.com/user/orgs', {
          headers
        });
        break;
        
      case 'org_members':
        // List organization members
        if (!org) {
          return Response.json({ error: 'org is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/orgs/${org}/members`, {
          headers
        });
        break;
        
      case 'org_repos':
        // List organization repositories
        if (!org) {
          return Response.json({ error: 'org is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, {
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
    console.error('GitHub user error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});