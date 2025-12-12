# 360° Method App - Launch Setup Guide

## Step 1: Make Yourself Admin

Run this SQL in Supabase SQL Editor (replace with your email):

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE users
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, is_admin, tier FROM users WHERE email = 'your-email@example.com';
```

---

## Step 2: Create Stripe Products

### 2a. Go to Stripe Dashboard
1. Log in to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Go to **Products** → **Add Product**

### 2b. Create These Products

| Product Name | Monthly Price | Annual Price | Notes |
|-------------|---------------|--------------|-------|
| Homeowner+ | $9.99/month | $99/year | Basic paid tier |
| Pioneer | $29/month | $290/year | Multi-property (3 included) |
| Commander | $99/month | $990/year | Business tier (15 included) |
| Elite | $199/month | $1,990/year | Enterprise tier |

For each product:
1. Click "Add Product"
2. Name: e.g., "Homeowner+"
3. Click "Add another price"
4. Set up both Monthly and Annual pricing
5. **Copy the Price ID** (starts with `price_`) for each

### 2c. Save Your Price IDs

After creating all products, you'll have 8 price IDs. Note them down:

```
homeowner_plus_monthly: price_xxxxxxxxx
homeowner_plus_annual:  price_xxxxxxxxx
pioneer_monthly:        price_xxxxxxxxx
pioneer_annual:         price_xxxxxxxxx
commander_monthly:      price_xxxxxxxxx
commander_annual:       price_xxxxxxxxx
elite_monthly:          price_xxxxxxxxx
elite_annual:           price_xxxxxxxxx
```

---

## Step 3: Save Price IDs to Database

Run this SQL in Supabase (replace price_xxx with your actual IDs):

```sql
-- Insert Stripe price IDs into platform_settings
INSERT INTO platform_settings (setting_key, setting_value) VALUES
  ('stripe_price_homeowner_plus_monthly', 'price_YOUR_ID_HERE'),
  ('stripe_price_homeowner_plus_annual', 'price_YOUR_ID_HERE'),
  ('stripe_price_pioneer_monthly', 'price_YOUR_ID_HERE'),
  ('stripe_price_pioneer_annual', 'price_YOUR_ID_HERE'),
  ('stripe_price_pioneer_usage_monthly', 'price_YOUR_ID_HERE'),  -- Optional: per-door pricing
  ('stripe_price_pioneer_usage_annual', 'price_YOUR_ID_HERE'),
  ('stripe_price_commander_monthly', 'price_YOUR_ID_HERE'),
  ('stripe_price_commander_annual', 'price_YOUR_ID_HERE'),
  ('stripe_price_commander_usage_monthly', 'price_YOUR_ID_HERE'),
  ('stripe_price_commander_usage_annual', 'price_YOUR_ID_HERE'),
  ('stripe_price_elite_monthly', 'price_YOUR_ID_HERE'),
  ('stripe_price_elite_annual', 'price_YOUR_ID_HERE')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

---

## Step 4: Configure Supabase Secrets

Run these commands in your terminal:

```bash
# Navigate to project
cd "C:\Users\marci\OneDrive\Documents\App_Build\360°-Method-App"

# Login to Supabase (if not already)
npx supabase login

# Link to your project (get project ref from Supabase dashboard URL)
npx supabase link --project-ref YOUR_PROJECT_REF

# Set Stripe secrets (get keys from Stripe Dashboard > Developers > API keys)
npx supabase secrets set STRIPE_SECRET_KEY_TEST=sk_test_YOUR_KEY_HERE
npx supabase secrets set STRIPE_MODE=test
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Set Clerk secret (for user sync webhook)
npx supabase secrets set CLERK_WEBHOOK_SECRET=YOUR_CLERK_WEBHOOK_SECRET
```

---

## Step 5: Deploy Edge Functions

```bash
cd "C:\Users\marci\OneDrive\Documents\App_Build\360°-Method-App"

# Deploy all edge functions
npx supabase functions deploy createSubscriptionCheckout
npx supabase functions deploy handleStripeWebhook
npx supabase functions deploy getSubscriptionStatus
npx supabase functions deploy updateUserTier
npx supabase functions deploy clerk-webhook
npx supabase functions deploy fetch-property-data
```

---

## Step 6: Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/handleStripeWebhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Supabase secrets: `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx`

---

## Step 7: Test the Flow

1. **Test Admin Access**:
   - Go to `/hq` in your app
   - You should see the HQ Dashboard

2. **Test Subscription Flow**:
   - Go to `/pricing`
   - Click upgrade on any tier
   - Should redirect to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC
   - Complete checkout
   - Should redirect back with subscription active

3. **Verify in Database**:
   ```sql
   SELECT * FROM user_subscriptions WHERE user_id = 'YOUR_USER_ID';
   SELECT tier FROM users WHERE email = 'your-email@example.com';
   ```

---

## Quick Reference: Environment Variables Needed

| Variable | Where to Get |
|----------|-------------|
| `STRIPE_SECRET_KEY_TEST` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Your webhook |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks |
| `SUPABASE_URL` | Already set in your .env |
| `SUPABASE_ANON_KEY` | Already set in your .env |

---

## Troubleshooting

### "Stripe products not configured" error
- Make sure you ran the SQL to insert price IDs into `platform_settings`
- Verify with: `SELECT * FROM platform_settings WHERE setting_key LIKE 'stripe%';`

### Webhook not working
- Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
- Verify the webhook secret matches what you set in Supabase
- Check edge function logs: `npx supabase functions logs handleStripeWebhook`

### Can't access HQ Dashboard
- Verify your admin status: `SELECT is_admin FROM users WHERE email = 'your-email';`
- Try logging out and back in to refresh the session
