import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Generic GitHub API wrapper
 * Handles authentication and makes requests to GitHub API
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, method = 'GET', body, params } = await req.json();
    
    if (!endpoint) {
      return Response.json({ error: 'endpoint is required' }, { status: 400 });
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Build URL with params
    let url = `https://api.github.com${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: data.message || 'GitHub API error',
        details: data 
      }, { status: response.status });
    }

    return Response.json({ success: true, data });

  } catch (error) {
    console.error('GitHub API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});