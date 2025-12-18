// Supabase Edge Function: twilioWebhook
// Receives webhook callbacks from Twilio for:
// - Delivery status updates (delivered, failed, etc.)
// - Inbound SMS (STOP keywords for opt-out)
//
// Setup in Twilio:
// 1. Go to Phone Numbers > Manage > Your Number
// 2. Set "A Message Comes In" webhook to: https://your-project.supabase.co/functions/v1/twilioWebhook
// 3. Set "Status Callback" in your send requests or messaging service
//
// Required environment variables:
// - TWILIO_AUTH_TOKEN: For request validation
// - SUPABASE_URL: Your Supabase URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// STOP keywords for TCPA compliance
const OPT_OUT_KEYWORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Twilio sends GET for webhook verification
  if (req.method === "GET") {
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse Twilio form data
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value.toString();
    }

    console.log("Twilio webhook received:", payload);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is an inbound message (potential opt-out)
    if (payload.Body && payload.From) {
      const messageBody = payload.Body.trim().toUpperCase();
      const fromNumber = payload.From;

      console.log(`Inbound SMS from ${fromNumber}: "${messageBody}"`);

      // Check for opt-out keywords
      if (OPT_OUT_KEYWORDS.includes(messageBody)) {
        console.log(`Opt-out received from ${fromNumber}`);

        // Add to opt-out list
        const { error: optOutError } = await supabase
          .from("sms_opt_outs")
          .upsert(
            {
              phone_number: fromNumber,
              opt_out_method: "keyword",
              opt_out_keyword: messageBody,
            },
            { onConflict: "phone_number" }
          );

        if (optOutError) {
          console.error("Failed to record opt-out:", optOutError);
        } else {
          console.log(`Successfully recorded opt-out for ${fromNumber}`);
        }

        // Twilio expects TwiML response for inbound messages
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been unsubscribed from 360 Method messages. Reply START to resubscribe.</Message>
</Response>`;

        return new Response(twiml, {
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        });
      }

      // Check for opt-in keyword (START)
      if (messageBody === "START" || messageBody === "YES" || messageBody === "UNSTOP") {
        console.log(`Opt-in request from ${fromNumber}`);

        // Remove from opt-out list
        await supabase
          .from("sms_opt_outs")
          .delete()
          .eq("phone_number", fromNumber);

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been resubscribed to 360 Method messages. Reply STOP to unsubscribe.</Message>
</Response>`;

        return new Response(twiml, {
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        });
      }

      // Handle HELP keyword
      if (messageBody === "HELP" || messageBody === "INFO") {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>360 Method home maintenance app. Reply STOP to opt out or visit 360method.com for help.</Message>
</Response>`;

        return new Response(twiml, {
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        });
      }
    }

    // Handle delivery status callback
    if (payload.MessageSid && payload.MessageStatus) {
      const sid = payload.MessageSid;
      const status = payload.MessageStatus;

      console.log(`Delivery status update - SID: ${sid}, Status: ${status}`);

      // Map Twilio status to our status
      const statusMap: Record<string, string> = {
        queued: "queued",
        sending: "sent",
        sent: "sent",
        delivered: "delivered",
        undelivered: "undelivered",
        failed: "failed",
      };

      const mappedStatus = statusMap[status] || status;

      // Update the message record
      const { error: updateError } = await supabase
        .from("sms_messages")
        .update({
          twilio_status: status,
          status: mappedStatus,
          error_code: payload.ErrorCode || null,
          error_message: payload.ErrorMessage || null,
          delivered_at: status === "delivered" ? new Date().toISOString() : null,
        })
        .eq("twilio_sid", sid);

      if (updateError) {
        console.error("Failed to update message status:", updateError);
      }

      // Update campaign stats if delivered or failed
      if (status === "delivered" || status === "failed" || status === "undelivered") {
        const { data: message } = await supabase
          .from("sms_messages")
          .select("campaign_id")
          .eq("twilio_sid", sid)
          .single();

        if (message?.campaign_id) {
          if (status === "delivered") {
            // Increment delivered count
            await supabase.rpc("increment", {
              table_name: "sms_campaigns",
              column_name: "total_delivered",
              row_id: message.campaign_id,
            });
          } else {
            // Increment failed count
            await supabase.rpc("increment", {
              table_name: "sms_campaigns",
              column_name: "total_failed",
              row_id: message.campaign_id,
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("twilioWebhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
