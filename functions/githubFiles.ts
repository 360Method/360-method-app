import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub File Operations
 * - Get file contents
 * - Create/update file
 * - Delete file
 * - Get directory contents
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, path, content, message, branch = 'main', sha } = await req.json();
    
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
      case 'get':
        // Get file contents
        if (!path) {
          return Response.json({ error: 'path is required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          // Decode base64 content
          if (data.content) {
            data.decoded_content = atob(data.content.replace(/\n/g, ''));
          }
          return Response.json({ success: true, data });
        }
        break;
        
      case 'list':
        // List directory contents
        const listPath = path || '';
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${listPath}?ref=${branch}`, {
          headers
        });
        break;
        
      case 'create':
      case 'update':
        // Create or update file
        if (!path || !content || !message) {
          return Response.json({ error: 'path, content, and message are required' }, { status: 400 });
        }
        
        // Encode content to base64
        const encodedContent = btoa(content);
        
        const updateBody = {
          message,
          content: encodedContent,
          branch
        };
        
        // For updates, sha is required
        if (sha) {
          updateBody.sha = sha;
        }
        
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateBody)
        });
        break;
        
      case 'delete':
        // Delete file
        if (!path || !message || !sha) {
          return Response.json({ error: 'path, message, and sha are required' }, { status: 400 });
        }
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({
            message,
            sha,
            branch
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
    console.error('GitHub files error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});