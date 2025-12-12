import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, response_json_schema } = body;

    console.log("Received request with prompt length:", prompt?.length || 0);

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    console.log("API key exists:", !!anthropicApiKey);
    console.log("API key length:", anthropicApiKey?.length || 0);

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the request body
    const requestBody: any = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    };

    // If JSON schema is provided, add system prompt
    if (response_json_schema) {
      requestBody.system = `You must respond with valid JSON that matches this schema: ${JSON.stringify(response_json_schema)}. Only output the JSON, no other text.`;
    }

    console.log("Calling Anthropic API...");

    // Call Anthropic API directly
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Anthropic response status:", anthropicResponse.status);

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicResponse.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicData = await anthropicResponse.json();
    console.log("Anthropic response received, content blocks:", anthropicData.content?.length || 0);

    // Extract text content
    let result = "";
    for (const block of anthropicData.content || []) {
      if (block.type === "text") {
        result += block.text;
      }
    }

    // If JSON schema was provided, parse the response as JSON
    if (response_json_schema) {
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify(parsed),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
      }
    }

    return new Response(
      JSON.stringify({ response: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in invokeClaude:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to invoke Claude", stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
