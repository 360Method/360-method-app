# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payments for the 360° Method App.

## Overview

The platform uses Stripe for:
1. **User Subscriptions** - Scout (free), Pioneer, Commander, Elite tiers
2. **Operator Payments** - Stripe Connect for operators to receive payments
3. **Invoice Payments** - Owners paying operators for services

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com))
- Access to Supabase project dashboard
- Admin access to the application

---

## Step 1: Get Your Stripe API Keys

### Test Mode Keys (for development)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure "Test mode" is toggled ON (top right)
3. Go to **Developers → API keys**
4. Copy your **Secret key** (starts with `sk_test_`)

### Live Mode Keys (for production)
1. Toggle "Test mode" OFF
2. Copy your **Secret key** (starts with `sk_live_`)

---

## Step 2: Set Up Supabase Secrets

Run these commands in your terminal, or set them in the Supabase Dashboard under **Project Settings → Edge Functions → Secrets**:

```bash
# For development/testing
supabase secrets set STRIPE_SECRET_KEY_TEST=sk_test_your_test_key_here

# For production
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key_here

# Set the mode (test or live)
supabase secrets set STRIPE_MODE=test

# Webhook secret (get this after setting up webhooks)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Required Secrets Summary

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `STRIPE_SECRET_KEY_TEST` | Test mode API secret key | `sk_test_51...` |
| `STRIPE_SECRET_KEY` | Live mode API secret key | `sk_live_51...` |
| `STRIPE_MODE` | Which mode to use: `test` or `live` | `test` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |

---

## Step 3: Configure Stripe Webhooks

Webhooks allow Stripe to notify your app about payment events.

### Create Webhook Endpoint

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/handleStripeWebhook
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference.

4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated` (for Stripe Connect)

5. Click **Add endpoint**

6. Copy the **Signing secret** (starts with `whsec_`)

7. Add it to Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret
   ```

---

## Step 4: Create Stripe Products & Prices

Run the `setupStripeProducts` edge function to create the subscription products:

### Option A: Via API call (recommended)
```javascript
// From your browser console while logged in as admin
const { data } = await supabase.functions.invoke('setupStripeProducts');
console.log(data);
```

### Option B: Via cURL
```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/setupStripeProducts' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

This creates:
- **HomeCare Essential** - $99/month
- **HomeCare Premium** - $199/month  
- **HomeCare Elite** - $399/month
- **PropertyCare Service Package** - Dynamic pricing

The Price IDs are automatically saved to `platform_settings` table.

---

## Step 5: Test the Integration

### Test Cards
Use these test card numbers in test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0002` | Declined (generic) |
| `4000 0027 6000 3184` | Requires authentication (3D Secure) |

Use any future expiry date, any 3-digit CVC, any postal code.

### Test Flow

1. **Sign up/Login** to the app
2. Go to **Pricing** page
3. Select a paid tier (Pioneer, Commander, or Elite)
4. Click to upgrade → redirected to Stripe Checkout
5. Enter test card `4242 4242 4242 4242`
6. Complete checkout
7. Verify redirect back to app with success message
8. Check **Settings** page for subscription status

---

## Step 6: Stripe Connect for Operators

Operators need to connect their Stripe accounts to receive payments.

### Operator Onboarding Flow

1. Operator goes to their dashboard
2. Clicks "Connect Stripe Account"
3. Redirected to Stripe Connect onboarding
4. Completes Stripe's identity verification
5. Returns to app with connected account

### Platform Fee

The platform takes a configurable fee from each operator payment:
- Default: 10%
- Stored in `platform_settings` table as `platform_fee_percent`

---

## Step 7: Go Live

When ready for production:

1. **Verify Stripe account** - Complete Stripe's business verification
2. **Update secrets**:
   ```bash
   supabase secrets set STRIPE_MODE=live
   ```
3. **Create live webhook** - Repeat Step 3 with live mode enabled
4. **Test with real card** - Make a small real payment to verify

---

## Troubleshooting

### Common Issues

**"STRIPE_SECRET_KEY not configured"**
- Ensure secrets are set in Supabase
- Check `STRIPE_MODE` matches your key type (test vs live)

**"No signature found"**
- Webhook secret is missing or incorrect
- Verify `STRIPE_WEBHOOK_SECRET` is set

**"Stripe products not configured"**
- Run `setupStripeProducts` function
- Check `platform_settings` table for price IDs

**Webhook events not processing**
- Check Supabase Edge Function logs
- Verify webhook URL is correct
- Check webhook signing secret

### Debug Commands

```bash
# Check Edge Function logs
supabase functions logs handleStripeWebhook

# Check webhook events in Stripe Dashboard
# Go to Developers → Webhooks → Select endpoint → View logs
```

---

## Database Tables

The payment system uses these tables:

| Table | Purpose |
|-------|---------|
| `user_subscriptions` | Tracks user subscription status |
| `transactions` | Payment history |
| `payment_methods` | Saved cards |
| `webhook_events` | Stripe webhook event log |
| `platform_settings` | Stripe price IDs, fee config |
| `operator_stripe_accounts` | Operator Connect accounts |

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `createSubscriptionCheckout` | Creates Stripe Checkout for subscriptions |
| `cancelSubscription` | Cancels user subscription |
| `getSubscriptionStatus` | Fetches current subscription details |
| `handleStripeWebhook` | Receives Stripe webhook events |
| `processStripeWebhookEvent` | Processes webhook event logic |
| `createOperatorConnectAccount` | Creates Stripe Connect account |
| `completeOperatorOnboarding` | Verifies operator Connect status |
| `createInvoicePaymentIntent` | Creates payment for invoices |
| `setupStripeProducts` | Admin: creates Stripe products |
| `diagnoseStripe` | Admin: checks Stripe configuration |

---

## Security Checklist

- [ ] API keys stored in Supabase secrets (never in code)
- [ ] Webhook signature verification enabled
- [ ] Test mode used for development
- [ ] RLS policies enabled on payment tables
- [ ] Service role key kept secure

---

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For app integration issues:
- Check Edge Function logs in Supabase Dashboard
- Review `webhook_events` table for failed events

