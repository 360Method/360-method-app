// Supabase Edge Function: syncToMailchimp
// Syncs a single contact to Mailchimp via the Marketing API
//
// Required environment variables:
// - MAILCHIMP_API_KEY: Your Mailchimp API key
// - MAILCHIMP_SERVER: Your Mailchimp server prefix (e.g., "us21")
// - SUPABASE_URL: Your Supabase URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  email: string;
  listId?: string;
  mergeFields?: Record<string, string>;
  tags?: string[];
  status?: "subscribed" | "pending" | "unsubscribed" | "cleaned";
  sourceType?: "user" | "lead" | "notification_request";
  sourceId?: string;
}

// Generate MD5 hash of email for Mailchimp subscriber hash
function getSubscriberHash(email: string): string {
  const hash = createHash("md5");
  hash.update(email.toLowerCase());
  return hash.toString();
}

async function syncContactToMailchimp(
  apiKey: string,
  server: string,
  listId: string,
  contact: SyncRequest
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  const subscriberHash = getSubscriberHash(contact.email);
  const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;

  const body = {
    email_address: contact.email,
    status_if_new: contact.status || "subscribed",
    merge_fields: contact.mergeFields || {},
    tags: contact.tags || [],
  };

  try {
    const response = await fetch(url, {
      method: "PUT", // PUT for upsert behavior
      headers: {
        Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mailchimp API error:", data);
      return {
        success: false,
        error: data.detail || data.title || "Mailchimp API error",
      };
    }

    return {
      success: true,
      memberId: data.id,
    };
  } catch (error) {
    console.error("Mailchimp request failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const server = Deno.env.get("MAILCHIMP_SERVER");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !server) {
      console.error("Missing Mailchimp configuration");
      return new Response(
        JSON.stringify({ error: "Mailchimp not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: SyncRequest = await req.json();

    if (!body.email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get default list ID from settings if not provided
    let listId = body.listId;
    if (!listId) {
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "mailchimp_default_list_id")
        .single();

      listId = settings?.value;
    }

    if (!listId) {
      return new Response(
        JSON.stringify({ error: "Mailchimp list ID not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing contact ${body.email} to Mailchimp list ${listId}`);

    // Sync to Mailchimp
    const result = await syncContactToMailchimp(apiKey, server, listId, body);

    if (result.success) {
      // Update or insert tracking record
      const { error: dbError } = await supabase
        .from("mailchimp_contacts")
        .upsert(
          {
            source_type: body.sourceType || "user",
            source_id: body.sourceId,
            email: body.email,
            mailchimp_member_id: result.memberId,
            list_id: listId,
            status: "subscribed",
            tags: body.tags || [],
            merge_fields: body.mergeFields || {},
            last_synced_at: new Date().toISOString(),
            sync_error: null,
          },
          { onConflict: "email,list_id" }
        );

      if (dbError) {
        console.error("Failed to update tracking record:", dbError);
      }

      console.log(`Successfully synced ${body.email}`);
      return new Response(
        JSON.stringify({ success: true, memberId: result.memberId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Record sync failure
      await supabase
        .from("mailchimp_contacts")
        .upsert(
          {
            source_type: body.sourceType || "user",
            source_id: body.sourceId,
            email: body.email,
            list_id: listId,
            status: "failed",
            sync_error: result.error,
            sync_attempts: 1,
          },
          { onConflict: "email,list_id" }
        );

      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("syncToMailchimp error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
