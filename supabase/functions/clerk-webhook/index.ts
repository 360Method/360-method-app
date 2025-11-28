// Supabase Edge Function: clerk-webhook
// Syncs Clerk user events to the users table
//
// Clerk webhook events handled:
// - user.created: Create user in DB
// - user.updated: Update user in DB
// - user.deleted: Delete user from DB
//
// Setup:
// 1. Deploy this function to Supabase
// 2. Add CLERK_WEBHOOK_SECRET to Supabase secrets
// 3. Configure webhook in Clerk Dashboard pointing to:
//    https://your-project.supabase.co/functions/v1/clerk-webhook
// 4. Enable events: user.created, user.updated, user.deleted

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ClerkUserData {
  id: string;
  email_addresses?: Array<{
    email_address: string;
    id: string;
    verification?: { status: string };
  }>;
  primary_email_address_id?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  public_metadata?: {
    roles?: string[];
    active_role?: string;
    is_admin?: boolean;
    onboarding_completed?: boolean;
    onboarding_step?: string;
    [key: string]: unknown;
  };
  private_metadata?: Record<string, unknown>;
  created_at?: number;
  updated_at?: number;
  last_sign_in_at?: number;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
  object: string;
}

function getPrimaryEmail(userData: ClerkUserData): string | null {
  if (!userData.email_addresses || userData.email_addresses.length === 0) {
    return null;
  }

  // Find the primary email
  const primaryEmail = userData.email_addresses.find(
    (email) => email.id === userData.primary_email_address_id
  );

  // Return primary email, or first email as fallback
  return primaryEmail?.email_address || userData.email_addresses[0]?.email_address || null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the raw body and headers for verification
    const payload = await req.text();
    const headers = {
      "svix-id": req.headers.get("svix-id") || "",
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    };

    // Verify webhook signature
    const svix = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent;

    try {
      event = svix.verify(payload, headers) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, data } = event;
    console.log(`Processing Clerk webhook: ${type} for user ${data.id}`);

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = getPrimaryEmail(data);
        const metadata = data.public_metadata || {};

        const userData = {
          id: data.id,
          email,
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          profile_image_url: data.image_url || null,
          roles: metadata.roles || ["owner"],
          active_role: metadata.active_role || "owner",
          is_admin: metadata.is_admin || false,
          onboarding_completed: metadata.onboarding_completed || false,
          onboarding_step: metadata.onboarding_step || null,
          metadata: metadata,
          updated_at: new Date().toISOString(),
          last_sign_in_at: data.last_sign_in_at
            ? new Date(data.last_sign_in_at).toISOString()
            : null,
        };

        // For user.created, also set created_at
        if (type === "user.created") {
          Object.assign(userData, {
            created_at: data.created_at
              ? new Date(data.created_at).toISOString()
              : new Date().toISOString(),
          });
        }

        const { error } = await supabase
          .from("users")
          .upsert(userData, { onConflict: "id" });

        if (error) {
          console.error(`Failed to upsert user ${data.id}:`, error);
          return new Response(
            JSON.stringify({ error: "Failed to sync user", details: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Successfully synced user ${data.id} (${type})`);
        break;
      }

      case "user.deleted": {
        // Soft delete: We don't delete the user record, just mark it
        // This preserves referential integrity with properties, etc.
        // Alternatively, you could hard delete if you want to clean up

        const { error } = await supabase
          .from("users")
          .update({
            email: null, // Remove PII
            first_name: null,
            last_name: null,
            profile_image_url: null,
            metadata: { deleted: true, deleted_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        // If you prefer hard delete, uncomment this instead:
        // const { error } = await supabase
        //   .from("users")
        //   .delete()
        //   .eq("id", data.id);

        if (error) {
          console.error(`Failed to handle user deletion ${data.id}:`, error);
          return new Response(
            JSON.stringify({ error: "Failed to handle user deletion", details: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Successfully handled deletion for user ${data.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, event_type: type, user_id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Clerk webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
