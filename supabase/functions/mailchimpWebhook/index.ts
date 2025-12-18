// Supabase Edge Function: mailchimpWebhook
// Receives webhook events from Mailchimp (unsubscribes, bounces, etc.)
//
// Setup in Mailchimp:
// 1. Go to Audience > Settings > Webhooks
// 2. Create webhook pointing to: https://your-project.supabase.co/functions/v1/mailchimpWebhook
// 3. Enable events: subscribes, unsubscribes, profile updates, cleaned addresses
//
// Required environment variables:
// - MAILCHIMP_WEBHOOK_SECRET: Optional secret for webhook verification
// - SUPABASE_URL: Your Supabase URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MailchimpWebhookPayload {
  type: string;
  fired_at: string;
  data: {
    id?: string;
    list_id?: string;
    email?: string;
    email_type?: string;
    ip_opt?: string;
    ip_signup?: string;
    reason?: string;
    merges?: Record<string, string>;
    action?: string;
    new_email?: string;
    old_email?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Mailchimp sends GET request for webhook verification
  if (req.method === "GET") {
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookSecret = Deno.env.get("MAILCHIMP_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: Verify webhook secret if configured
    if (webhookSecret) {
      const providedSecret = req.headers.get("x-mailchimp-signature") ||
        new URL(req.url).searchParams.get("secret");
      if (providedSecret !== webhookSecret) {
        console.error("Invalid webhook secret");
        return new Response(
          JSON.stringify({ error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse webhook payload
    // Mailchimp sends form-encoded data
    const contentType = req.headers.get("content-type") || "";
    let payload: MailchimpWebhookPayload;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = {
        type: formData.get("type") as string,
        fired_at: formData.get("fired_at") as string,
        data: {
          list_id: formData.get("data[list_id]") as string,
          email: formData.get("data[email]") as string,
          reason: formData.get("data[reason]") as string,
          action: formData.get("data[action]") as string,
        },
      };
    } else {
      payload = await req.json();
    }

    console.log(`Received Mailchimp webhook: ${payload.type}`, payload);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the event
    const { error: eventError } = await supabase
      .from("mailchimp_events")
      .insert({
        event_type: payload.type,
        email: payload.data?.email || "",
        list_id: payload.data?.list_id || "",
        payload: payload,
        processed: false,
      });

    if (eventError) {
      console.error("Failed to store webhook event:", eventError);
    }

    // Process event based on type
    const email = payload.data?.email;
    const listId = payload.data?.list_id;

    if (email && listId) {
      switch (payload.type) {
        case "unsubscribe":
          await supabase
            .from("mailchimp_contacts")
            .update({
              status: "unsubscribed",
              updated_at: new Date().toISOString(),
            })
            .eq("email", email)
            .eq("list_id", listId);
          console.log(`Marked ${email} as unsubscribed`);
          break;

        case "cleaned":
          await supabase
            .from("mailchimp_contacts")
            .update({
              status: "cleaned",
              updated_at: new Date().toISOString(),
            })
            .eq("email", email)
            .eq("list_id", listId);
          console.log(`Marked ${email} as cleaned (bounced)`);
          break;

        case "subscribe":
          await supabase
            .from("mailchimp_contacts")
            .update({
              status: "subscribed",
              updated_at: new Date().toISOString(),
            })
            .eq("email", email)
            .eq("list_id", listId);
          console.log(`Marked ${email} as subscribed`);
          break;

        case "profile":
          // Profile update - could sync merge fields back
          console.log(`Profile update for ${email}`);
          break;

        case "upemail":
          // Email address changed
          const oldEmail = payload.data?.old_email;
          const newEmail = payload.data?.new_email;
          if (oldEmail && newEmail) {
            await supabase
              .from("mailchimp_contacts")
              .update({
                email: newEmail,
                updated_at: new Date().toISOString(),
              })
              .eq("email", oldEmail)
              .eq("list_id", listId);
            console.log(`Updated email from ${oldEmail} to ${newEmail}`);
          }
          break;

        default:
          console.log(`Unhandled webhook type: ${payload.type}`);
      }
    }

    // Mark event as processed
    await supabase
      .from("mailchimp_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("email", email)
      .eq("event_type", payload.type)
      .is("processed", false);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("mailchimpWebhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
