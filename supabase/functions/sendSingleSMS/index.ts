// Supabase Edge Function: sendSingleSMS
// Sends a single SMS message via Twilio
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

interface SendSMSRequest {
  to: string;
  body: string;
  campaignId?: string;
  recipientId?: string;
  recipientType?: string;
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it's 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // If it already has country code, just add +
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Return as-is if we can't normalize
  return phone;
}

async function sendViaTwilio(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string; errorCode?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("From", from);
  formData.append("Body", body);

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

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Twilio API error",
        errorCode: data.code?.toString(),
      };
    }

    return {
      success: true,
      sid: data.sid,
    };
  } catch (error) {
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
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio configuration");
      return new Response(
        JSON.stringify({ error: "Twilio not configured" }),
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
    const body: SendSMSRequest = await req.json();

    if (!body.to || !body.body) {
      return new Response(
        JSON.stringify({ error: "Phone number and message body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedPhone = normalizePhoneNumber(body.to);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if phone is opted out (TCPA compliance)
    const { data: optOut } = await supabase
      .from("sms_opt_outs")
      .select("id")
      .eq("phone_number", normalizedPhone)
      .single();

    if (optOut) {
      console.log(`Phone ${normalizedPhone} is opted out, skipping`);
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is opted out", skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending SMS to ${normalizedPhone}`);

    // Send via Twilio
    const result = await sendViaTwilio(accountSid, authToken, fromNumber, normalizedPhone, body.body);

    // Record the message
    const { error: dbError } = await supabase
      .from("sms_messages")
      .insert({
        campaign_id: body.campaignId || null,
        phone_number: normalizedPhone,
        recipient_id: body.recipientId || null,
        recipient_type: body.recipientType || null,
        message_body: body.body,
        twilio_sid: result.sid || null,
        twilio_status: result.success ? "queued" : "failed",
        status: result.success ? "sent" : "failed",
        error_code: result.errorCode || null,
        error_message: result.error || null,
        sent_at: result.success ? new Date().toISOString() : null,
      });

    if (dbError) {
      console.error("Failed to record SMS message:", dbError);
    }

    if (result.success) {
      console.log(`SMS sent successfully, SID: ${result.sid}`);
      return new Response(
        JSON.stringify({ success: true, sid: result.sid }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error(`SMS failed: ${result.error}`);
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("sendSingleSMS error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
