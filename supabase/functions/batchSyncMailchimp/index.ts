// Supabase Edge Function: batchSyncMailchimp
// Processes the Mailchimp sync queue in batches
//
// Can be called:
// - Manually via API for testing
// - Via Supabase scheduled jobs (pg_cron)
// - Via external cron service
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

interface QueueItem {
  id: string;
  action: "add" | "update" | "remove" | "tag";
  email: string;
  list_id: string;
  payload: {
    source_type?: string;
    source_id?: string;
    merge_fields?: Record<string, string>;
    tags?: string[];
  };
  attempts: number;
  max_attempts: number;
}

// Generate MD5 hash of email for Mailchimp subscriber hash
function getSubscriberHash(email: string): string {
  const hash = createHash("md5");
  hash.update(email.toLowerCase());
  return hash.toString();
}

async function processQueueItem(
  apiKey: string,
  server: string,
  item: QueueItem
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  const subscriberHash = getSubscriberHash(item.email);
  const baseUrl = `https://${server}.api.mailchimp.com/3.0/lists/${item.list_id}/members/${subscriberHash}`;
  const authHeader = `Basic ${btoa(`anystring:${apiKey}`)}`;

  try {
    switch (item.action) {
      case "add":
      case "update": {
        const body = {
          email_address: item.email,
          status_if_new: "subscribed",
          merge_fields: item.payload.merge_fields || {},
        };

        const response = await fetch(baseUrl, {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.detail || data.title };
        }

        // Handle tags separately if provided
        if (item.payload.tags && item.payload.tags.length > 0) {
          const tagsUrl = `${baseUrl}/tags`;
          const tagBody = {
            tags: item.payload.tags.map(tag => ({ name: tag, status: "active" })),
          };

          await fetch(tagsUrl, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tagBody),
          });
        }

        return { success: true, memberId: data.id };
      }

      case "remove": {
        const response = await fetch(baseUrl, {
          method: "DELETE",
          headers: { Authorization: authHeader },
        });

        if (!response.ok && response.status !== 404) {
          const data = await response.json();
          return { success: false, error: data.detail || data.title };
        }

        return { success: true };
      }

      case "tag": {
        if (!item.payload.tags || item.payload.tags.length === 0) {
          return { success: true }; // Nothing to do
        }

        const tagsUrl = `${baseUrl}/tags`;
        const tagBody = {
          tags: item.payload.tags.map(tag => ({ name: tag, status: "active" })),
        };

        const response = await fetch(tagsUrl, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tagBody),
        });

        if (!response.ok) {
          const data = await response.json();
          return { success: false, error: data.detail || data.title };
        }

        return { success: true };
      }

      default:
        return { success: false, error: `Unknown action: ${item.action}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
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

    // Parse optional batch size from request
    let batchSize = 50;
    try {
      const body = await req.json();
      if (body.batchSize && typeof body.batchSize === "number") {
        batchSize = Math.min(body.batchSize, 100); // Cap at 100
      }
    } catch {
      // No body or invalid JSON, use default
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending items from queue
    const { data: queueItems, error: fetchError } = await supabase
      .from("mailchimp_sync_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error("Failed to fetch queue items:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch queue" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      console.log("No pending items in queue");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending items" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${queueItems.length} queue items`);

    // Mark items as processing
    const itemIds = queueItems.map(item => item.id);
    await supabase
      .from("mailchimp_sync_queue")
      .update({ status: "processing" })
      .in("id", itemIds);

    // Process each item
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      retrying: 0,
    };

    for (const item of queueItems as QueueItem[]) {
      results.processed++;

      const result = await processQueueItem(apiKey, server, item);

      if (result.success) {
        // Mark as completed
        await supabase
          .from("mailchimp_sync_queue")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        // Update or create tracking record
        await supabase
          .from("mailchimp_contacts")
          .upsert(
            {
              source_type: item.payload.source_type || "user",
              source_id: item.payload.source_id,
              email: item.email,
              mailchimp_member_id: result.memberId,
              list_id: item.list_id,
              status: item.action === "remove" ? "unsubscribed" : "subscribed",
              tags: item.payload.tags || [],
              merge_fields: item.payload.merge_fields || {},
              last_synced_at: new Date().toISOString(),
              sync_error: null,
            },
            { onConflict: "email,list_id" }
          );

        results.succeeded++;
        console.log(`Successfully processed ${item.email}`);
      } else {
        const newAttempts = item.attempts + 1;

        if (newAttempts >= item.max_attempts) {
          // Mark as failed
          await supabase
            .from("mailchimp_sync_queue")
            .update({
              status: "failed",
              attempts: newAttempts,
              error_message: result.error,
              processed_at: new Date().toISOString(),
            })
            .eq("id", item.id);

          // Update tracking record with failure
          await supabase
            .from("mailchimp_contacts")
            .upsert(
              {
                source_type: item.payload.source_type || "user",
                source_id: item.payload.source_id,
                email: item.email,
                list_id: item.list_id,
                status: "failed",
                sync_error: result.error,
                sync_attempts: newAttempts,
              },
              { onConflict: "email,list_id" }
            );

          results.failed++;
          console.error(`Failed to process ${item.email} after ${newAttempts} attempts: ${result.error}`);
        } else {
          // Retry with exponential backoff
          const retryDelay = Math.pow(2, newAttempts) * 60 * 1000; // 2^attempts minutes
          const scheduledFor = new Date(Date.now() + retryDelay);

          await supabase
            .from("mailchimp_sync_queue")
            .update({
              status: "pending",
              attempts: newAttempts,
              error_message: result.error,
              scheduled_for: scheduledFor.toISOString(),
            })
            .eq("id", item.id);

          results.retrying++;
          console.log(`Will retry ${item.email} at ${scheduledFor.toISOString()}`);
        }
      }

      // Small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Batch complete: ${results.succeeded} succeeded, ${results.failed} failed, ${results.retrying} retrying`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("batchSyncMailchimp error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
