# kwtSMS for Shopify

SMS notifications and OTP verification for Shopify stores, powered by [kwtSMS](https://www.kwtsms.com) gateway.

## Features

- **Order Notifications**: Automatic SMS for order confirmation, payment, shipping, and cancellation
- **OTP Verification**: Phone number verification for customer accounts
- **Multilingual**: Full English and Arabic support with customizable templates
- **Template Engine**: Placeholder-based SMS templates with character counting
- **Admin Dashboard**: Balance monitoring, sender ID management, and SMS logs
- **Bulk Sending**: Batched sending with rate limiting for 200+ recipients
- **Phone Normalization**: Automatic formatting for international numbers including Arabic digits

## Requirements

- Shopify store (any plan)
- kwtSMS account with API access ([register here](https://www.kwtsms.com))
- Approved Sender ID (for production use)

## Installation

Install from the [Shopify App Store](#) (link available after marketplace approval).

## Configuration

1. Install the app on your Shopify store
2. Navigate to **Gateway Settings** and enter your kwtSMS API credentials
3. Click **Verify Credentials** to validate and fetch your sender IDs
4. Select your preferred Sender ID
5. Customize SMS templates in the **Templates** tab
6. Enable desired notification triggers in **General Settings**

## API Credentials

Your kwtSMS API credentials are separate from your account login. To get API access:

1. Log in to [kwtsms.com](https://www.kwtsms.com)
2. Navigate to Account > API
3. Request API access (activated same day)
4. Use the API username and password provided

## Development

See [docs/PLAN.md](docs/PLAN.md) for the implementation plan.

```bash
# Prerequisites: Node.js 20.10+, npm
npm install -g @shopify/cli@latest

# Install dependencies
npm install

# Start development server
shopify app dev
```

## License

Proprietary. All rights reserved.

## Support

- kwtSMS Support: [kwtsms.com/support](https://www.kwtsms.com/support.html)
- Issues: [GitHub Issues](https://github.com/boxlinknet/kwtsms-shopify/issues)
