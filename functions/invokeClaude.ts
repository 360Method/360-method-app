import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    
    // Verify user is authenticated
    const user = await helper.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const { prompt, system, max_tokens = 1024 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      system: system || "You are a helpful assistant for property maintenance and management.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return Response.json({
      response: (message.content[0] as any).text,
      usage: message.usage
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Claude API Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to invoke Claude' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
