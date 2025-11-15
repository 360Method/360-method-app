import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, system, max_tokens = 1024 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
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
      response: message.content[0].text,
      usage: message.usage
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to invoke Claude' 
    }, { status: 500 });
  }
});