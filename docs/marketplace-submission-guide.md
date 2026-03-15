# Shopify App Store Submission Guide

Tested and verified guide for submitting a Shopify app to the App Store. Based on the actual kwtSMS submission process (March 2026).

## Prerequisites

Before starting:

- [ ] Shopify Partner account ([partners.shopify.com](https://partners.shopify.com))
- [ ] App fully functional on a production server (not localhost)
- [ ] Production URL does NOT contain the word "shopify" or "example" in the domain
- [ ] All mandatory privacy webhooks implemented (customers/data_request, customers/redact, shop/redact)
- [ ] Using GraphQL Admin API (not REST)
- [ ] Using session tokens (not cookies)
- [ ] Valid TLS/SSL on production URL
- [ ] App tested on desktop and mobile Shopify Admin
- [ ] Privacy policy page hosted and accessible

## Step 1: Deploy to Production

See `docs/cpanel-deployment-guide.md` for detailed cPanel deployment steps.

Key requirements:
- Node.js 20+ running with PM2
- MySQL or PostgreSQL database
- Apache reverse proxy to Node.js port
- SSL certificate on the domain
- `.env` with SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, DATABASE_URL, SCOPES

**IMPORTANT**: Your production domain must NOT contain "shopify" or "example". Use something like `app.yourdomain.com` or `sms.yourdomain.com`.

## Step 2: Update App URLs

Edit `shopify.app.toml` on the server:
```
application_url = "https://app.yourdomain.com"

[auth]
redirect_urls = [ "https://app.yourdomain.com/auth/callback" ]
```

Deploy the config:
```bash
# Create dummy xdg-open if on headless server
mkdir -p ~/bin
echo '#!/bin/bash' > ~/bin/xdg-open
echo 'echo "$1"' >> ~/bin/xdg-open
chmod +x ~/bin/xdg-open
export PATH="$HOME/bin:$PATH"

# Deploy
npx shopify app deploy
```

When it shows a verification code, open the URL on your computer's browser, log in, then wait for the CLI to detect auth.

## Step 3: Register for App Store

1. Go to `https://partners.shopify.com/<your-partner-id>/apps/<your-app-id>/distribution`
2. Select **Individual** or **Organization** (Organization if you're a business, your company name appears as publisher)
3. Select account association
4. Pay the one-time **$19 USD** registration fee

**WARNING**: Distribution method is permanent and cannot be changed.

## Step 4: Choose Primary Listing Language

In the distribution page, select **English** as the primary listing language. You can add Arabic later after the primary is published.

## Step 5: App Configuration (Preliminary Steps)

Fix all preliminary requirements:
- [ ] URLs don't include "shopify" or "example" in domain
- [ ] App icon uploaded (1200x1200 PNG)
- [ ] API contact email doesn't include "shopify"
- [ ] Emergency contact email and phone added
- [ ] Protected customer data request completed

## Step 6: Fill in App Listing Content

### App Introduction (max 100 chars)
Two brief sentences summarizing purpose and benefit.
```
Send automatic SMS notifications for Shopify orders via the kwtSMS gateway, in Arabic and English.
```

### App Details (max 500 chars)
Clear explanation of what the app does, no links or formatting.
```
kwtSMS connects your Shopify store to the kwtSMS SMS gateway. When an order is created, paid, shipped, or cancelled, your customer gets an SMS instantly. You can also notify your store admin.

Each event has its own English and Arabic template that you can customize with placeholders like order number, customer name, and tracking URL. The app detects customer language automatically.

Setup takes under 3 minutes: enter your kwtSMS credentials, pick a Sender ID, and you are ready to send. No coding required.
```

### Features (3-5, max 80 chars each)
```
1. Automatic SMS for 6 order events with bilingual Arabic and English templates
2. Send to customers, store admins, or both with per-event recipient control
3. Private Sender ID so customers see your brand name on every message
4. Real-time SMS balance, delivery logs, and send statistics on every page
5. Smart phone normalization with auto country code and coverage checking
```

## Step 7: Media Assets

### App Icon
- 1200x1200 PNG
- Upload in app settings

### Feature Media (Header Image)
- 1600x900 PNG or JPG
- Screenshot of landing page or promotional graphic
- No Shopify logo, no heavy patterns

### Screenshots
- Exactly **1600x900** pixels
- **Crop out** browser UI, Shopify sidebar, and desktop background
- No personally identifiable information
- Recommended 5 screenshots:
  1. Settings page (notification events, toggles)
  2. Gateway page (credentials, balance, sender ID, coverage)
  3. Templates page (EN/AR editor, placeholders, recipient control)
  4. Logs page (SMS entries with status)
  5. Integrations page (active + coming soon)

### Screencast Video
- 3-8 minutes, Loom or YouTube (unlisted)
- Show: install, gateway login, templates, test SMS, logs, create order
- No loud background noise

## Step 8: Pricing

- Select **Free** plan
- Display name: `Free`
- Add top features (up to 8)

## Step 9: App Discovery Content

### Subtitle (max 62 chars)
```
SMS order notifications via kwtSMS gateway, in Arabic and English
```

### Search Terms (1-5, max 20 chars each)
```
sms notifications
order sms
kwtsms
arabic sms
kuwait sms
```

### SEO Title Tag (max 60 chars)
```
kwtSMS - SMS Order Notifications for Shopify Stores
```

### SEO Meta Description (max 160 chars)
```
Send automatic SMS for Shopify orders via kwtSMS. Bilingual Arabic and English templates, private Sender ID, delivery logs. Free app, pay-as-you-go credits.
```

## Step 10: Install Requirements

- Select: **My app doesn't require Online Store or POS** (unless it does)
- Geographic requirements: leave empty if your app works globally

## Step 11: Testing Instructions

Provide test credentials and step-by-step instructions for reviewers:
```
1. Install the app on a development store.
2. Go to Gateway page. Enter test credentials:
   - Username: [test_username]
   - Password: [test_password]
   - Click Login.
3. Select a Sender ID and click Save Settings.
4. Go to Templates page. Default templates are pre-loaded.
5. Go to Gateway page, scroll to Test SMS, enter a phone number and send.
6. Check Logs page to see the log entry.
7. Create a test order to trigger automatic SMS notifications.
8. Test mode is enabled by default (SMS queued but not delivered).
```

## Step 12: URLs

- **App URL**: `https://app.yourdomain.com`
- **Privacy policy URL**: `https://app.yourdomain.com/privacy`
- **Support URL**: Your support page or contact form

## Step 13: Submit for Review

1. Fix all listed issues in the submission checklist
2. Click **Submit for review**
3. Review takes **3-7 business days**

### Common Rejection Reasons
- App crashes or shows errors
- URLs contain "shopify" or "example"
- Missing privacy policy
- Missing screencast video
- Requesting unnecessary scopes
- Missing GDPR/compliance webhooks
- Using REST API instead of GraphQL
- Poor mobile experience

### If Rejected
1. Read rejection feedback carefully
2. Fix all listed issues
3. Resubmit with notes explaining what was fixed
4. Re-review is typically faster (1-3 days)

## Post-Launch

After approval:
- [ ] Verify listing is live on apps.shopify.com
- [ ] Install on a real store and test end-to-end
- [ ] Monitor for support requests
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Plan Phase 2 features based on user feedback
