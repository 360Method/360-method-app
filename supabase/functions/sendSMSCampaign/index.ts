// Supabase Edge Function: sendSMSCampaign
// Queues and sends SMS campaign to selected audience
//
// Required environment variables:
// - TWILIO_ACCOUNT_SID: Twilio account SID
// - TWILIO_AUTH_TOKEN: Twilio auth token
// - TWILIO_PHONE_NUMBER: Twilio phone number to send from
// - SUPABASE_URL: Your Supabase URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
  action: "queue" | "send" | "process_queue";
  batchSize?: number;
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return phone;
}

// Replace template variables
function replaceTemplateVariables(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "gi"), value || "");
  }
  return result;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accountSid || !authToken || !fromNumber) {
      return new Response(
        JSON.stringify({ error: "Twilio not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CampaignRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.action === "process_queue") {
      // Process pending items from SMS queue
      const batchSize = Math.min(body.batchSize || 25, 50);

      const { data: queueItems, error: fetchError } = await supabase
        .from("sms_send_queue")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(batchSize);

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch queue" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!queueItems || queueItems.length === 0) {
        return new Response(
          JSON.stringify({ success: true, processed: 0, message: "No pending items" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as processing
      const itemIds = queueItems.map(item => item.id);
      await supabase
        .from("sms_send_queue")
        .update({ status: "processing" })
        .in("id", itemIds);

      const results = { processed: 0, succeeded: 0, failed: 0 };

      for (const item of queueItems) {
        results.processed++;

        // Send via Twilio
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", item.phone_number);
        formData.append("From", fromNumber);
        formData.append("Body", item.message_body);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          });

          const data = await response.json();

          if (response.ok) {
            // Success - update queue and record message
            await supabase
              .from("sms_send_queue")
              .update({ status: "completed", processed_at: new Date().toISOString() })
              .eq("id", item.id);

            await supabase
              .from("sms_messages")
              .insert({
                campaign_id: item.campaign_id,
                phone_number: item.phone_number,
                recipient_id: item.recipient_id,
                recipient_type: item.recipient_type,
                message_body: item.message_body,
                twilio_sid: data.sid,
                twilio_status: "queued",
                status: "sent",
                sent_at: new Date().toISOString(),
              });

            // Update campaign stats
            if (item.campaign_id) {
              await supabase.rpc("increment_campaign_sent", { campaign_id: item.campaign_id });
            }

            results.succeeded++;
          } else {
            // Failed
            const newAttempts = item.attempts + 1;
            if (newAttempts >= item.max_attempts) {
              await supabase
                .from("sms_send_queue")
                .update({
                  status: "failed",
                  attempts: newAttempts,
                  error_message: data.message || "Twilio error",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", item.id);

              // Update campaign failed count
              if (item.campaign_id) {
                await supabase.rpc("increment_campaign_failed", { campaign_id: item.campaign_id });
              }
            } else {
              // Retry later
              await supabase
                .from("sms_send_queue")
                .update({
                  status: "pending",
                  attempts: newAttempts,
                  error_message: data.message,
                  scheduled_for: new Date(Date.now() + 60000 * Math.pow(2, newAttempts)).toISOString(),
                })
                .eq("id", item.id);
            }
            results.failed++;
          }
        } catch (error) {
          results.failed++;
          console.error(`Error sending to ${item.phone_number}:`, error);
        }

        // Small delay between sends
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return new Response(
        JSON.stringify({ success: true, ...results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Queue campaign messages
    if (!body.campaignId) {
      return new Response(
        JSON.stringify({ error: "Campaign ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("sms_campaigns")
      .select("*")
      .eq("id", body.campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recipients based on audience filter
    const audienceFilter = campaign.audience_filter || {};
    let recipientQuery = supabase.from("users").select("id, email, first_name, phone");

    // Apply filters
    if (audienceFilter.role) {
      recipientQuery = recipientQuery.eq("active_role", audienceFilter.role);
    }
    if (audienceFilter.has_phone) {
      recipientQuery = recipientQuery.not("phone", "is", null);
    }

    const { data: recipients, error: recipientError } = await recipientQuery;

    if (recipientError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipients" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get opted-out numbers
    const { data: optOuts } = await supabase.from("sms_opt_outs").select("phone_number");
    const optedOutNumbers = new Set(optOuts?.map(o => o.phone_number) || []);

    // Filter recipients with valid phones who haven't opted out
    const validRecipients = (recipients || []).filter(r => {
      if (!r.phone) return false;
      const normalized = normalizePhoneNumber(r.phone);
      return !optedOutNumbers.has(normalized);
    });

    // Queue messages
    const queueItems = validRecipients.map(recipient => {
      const normalized = normalizePhoneNumber(recipient.phone);
      const messageBody = replaceTemplateVariables(campaign.message_template, {
        first_name: recipient.first_name || "there",
        email: recipient.email || "",
      });

      return {
        campaign_id: campaign.id,
        phone_number: normalized,
        message_body: messageBody,
        recipient_id: recipient.id,
        recipient_type: "user",
        priority: 5,
      };
    });

    if (queueItems.length > 0) {
      const { error: insertError } = await supabase
        .from("sms_send_queue")
        .insert(queueItems);

      if (insertError) {
        console.error("Failed to queue messages:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to queue messages" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update campaign status and recipient count
    await supabase
      .from("sms_campaigns")
      .update({
        status: body.action === "send" ? "sending" : "scheduled",
        total_recipients: queueItems.length,
        started_at: body.action === "send" ? new Date().toISOString() : null,
      })
      .eq("id", campaign.id);

    console.log(`Queued ${queueItems.length} messages for campaign ${campaign.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        queued: queueItems.length,
        skipped: validRecipients.length - queueItems.length,
        campaignId: campaign.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sendSMSCampaign error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
