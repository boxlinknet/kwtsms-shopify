# cPanel Deployment Guide: kwtSMS Shopify App

Tested and working on CloudLinux 7.9 with cPanel. This guide covers deploying the Node.js Shopify app on shared/dedicated cPanel hosting with MySQL.

## Prerequisites

- cPanel hosting with SSH access
- MySQL available (via cPanel)
- SSL certificate on the subdomain (AutoSSL or Let's Encrypt)
- A Shopify Partner account with the app created
- The app's GitHub repo: `https://github.com/boxlinknet/kwtsms-shopify.git`

## Step 1: Install Node.js

The server likely has old glibc (e.g., CloudLinux 7 has glibc 2.17). Modern Node.js binaries require glibc 2.28+. Do NOT download Node.js directly from nodejs.org - it will fail with `GLIBC_2.27 not found` errors.

### Use CloudLinux alt packages (recommended for cPanel)

```bash
# Check what's available
sudo yum list available | grep nodejs

# Install Node.js 20 via CloudLinux
sudo yum install alt-nodejs20 -y
sudo yum install alt-nodejs20-nodejs -y

# Add to PATH
echo 'export PATH="/opt/alt/alt-nodejs20/root/usr/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
node --version   # v20.x.x
npm --version
```

If `sudo` is not available, ask your hosting provider to install `alt-nodejs20` and `alt-nodejs20-nodejs`.

### If CloudLinux packages are not available

Options in order of preference:
1. Ask hosting provider to install Node.js 20
2. Use Docker (requires root): install docker-ce, run app in container
3. Move to a server with Ubuntu 22+ or CloudLinux 8+

## Step 2: Create MySQL Database

### Via cPanel UI:
1. Go to **MySQL Databases** in cPanel
2. Create database: `youruser_shopify`
3. Create user: `youruser_dbuser` with a strong password
4. Add user to database with **ALL PRIVILEGES**

### Via command line (if you have root):
```bash
mysql -e "CREATE DATABASE youruser_shopify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'youruser_dbuser'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON youruser_shopify.* TO 'youruser_dbuser'@'localhost'; FLUSH PRIVILEGES;"
```

**IMPORTANT**: If your password contains special characters, you must URL-encode them in the DATABASE_URL:
- `@` = `%40`
- `^` = `%5E`
- `!` = `%21`
- `#` = `%23`
- `$` = `%24`
- `&` = `%26`
- `+` = `%2B`

Example: password `J@22^m!` becomes `J%4022%5Em%21`

## Step 3: Create Subdomain

1. In cPanel, go to **Domains** or **Subdomains**
2. Create: `shopify.yourdomain.com`
3. Note the document root (usually `/home/username/public_html` for main domain)
4. Ensure SSL is enabled (AutoSSL or Let's Encrypt via cPanel)

## Step 4: Clone and Install the App

**IMPORTANT**: Clone into your home directory, NOT into `public_html`. The `public_html` directory is served directly by Apache, meaning anyone could browse your source code, `.env` file, and credentials. Your app must stay in a private directory and only be accessible through the reverse proxy.

```bash
cd ~
git clone https://github.com/boxlinknet/kwtsms-shopify.git shopify-app
cd shopify-app
npm install
```

**Note**: `npm install` may show vulnerability warnings. Do NOT run `npm audit fix --force` as it can break Shopify dependencies.

## Step 5: Create .env File

```bash
cat > .env << 'EOF'
DATABASE_URL="mysql://youruser_dbuser:URL_ENCODED_PASSWORD@localhost:3306/youruser_shopify"
SHOPIFY_API_KEY=your_api_key_from_shopify_partner_dashboard
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://shopify.yourdomain.com
SCOPES=read_customers,read_fulfillments,read_inventory,read_orders,read_products
NODE_ENV=production
EOF
chmod 600 .env
```

To get the API key and secret, run this on your local dev machine:
```bash
shopify app env show
```
This displays `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, and `SCOPES`. Copy them into your `.env` file.

Alternatively, find them in the Shopify Partners dashboard: Apps > your app > API credentials.

## Step 6: Initialize Database and Build

```bash
npx prisma generate
npx prisma db push
npm run build
```

**If `prisma db push` fails with "invalid domain character"**: your DATABASE_URL password has special characters that need URL-encoding (see Step 2).

**If `prisma db push` fails with "BLOB/TEXT column can't have default value"**: the Prisma schema needs `@db.Text` annotations without `@default()` on TEXT columns. This should already be fixed in the repo.

## Step 7: Start the App with PM2

```bash
# Install PM2 locally (global install may fail due to permissions)
npm install pm2

# Start the app on port 3000
PORT=3000 npx pm2 start npm --name "kwtsms-shopify" -- run start

# Save the process list
npx pm2 save

# Verify it's running
curl http://localhost:3000
# Should return HTML (200 status)
```

### Auto-restart on server reboot

`pm2 startup` will fail on shared hosting (no systemd). Use cron instead:

```bash
crontab -e
```

Add this line:
```
@reboot cd /home/username/shopify-app && PORT=3000 /opt/alt/alt-nodejs20/root/usr/bin/npx pm2 resurrect
```

## Step 8: Configure Apache Reverse Proxy

The `.htaccess` file in the subdomain's document root (e.g., `/home/username/public_html/`) likely already has cPanel-generated PHP directives. Do NOT overwrite it. Instead, prepend the proxy rules above the existing content:

```bash
# First, backup the existing .htaccess
cp /home/username/public_html/.htaccess /home/username/public_html/.htaccess.bak

# Prepend the proxy rules above the existing content
cat > /tmp/htaccess_proxy << 'EOF'
DirectoryIndex disabled

RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L,QSA]

EOF
cat /tmp/htaccess_proxy /home/username/public_html/.htaccess.bak > /home/username/public_html/.htaccess
rm /tmp/htaccess_proxy
```

The result should look like this (proxy rules on top, cPanel directives preserved below):
```apache
DirectoryIndex disabled

RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L,QSA]

# php -- BEGIN cPanel-generated handler, do not edit
# (existing cPanel directives stay here untouched)
# php -- END cPanel-generated handler, do not edit
```

**CRITICAL**: The `DirectoryIndex disabled` line is required. Without it, Apache appends `index.php` to requests, causing 404 errors in the Node.js app.

**If you get 500 errors**: `mod_proxy` may not be enabled. Ask your hosting provider to enable `mod_proxy` and `mod_proxy_http` in Apache.

## Step 9: Update Shopify App URLs

### Option A: Via Shopify CLI on the server

First, create a dummy `xdg-open` (servers have no browser):

```bash
mkdir -p ~/bin
echo '#!/bin/bash' > ~/bin/xdg-open
echo 'echo "$1"' >> ~/bin/xdg-open
chmod +x ~/bin/xdg-open
export PATH="$HOME/bin:$PATH"
```

Edit `shopify.app.toml`:
```bash
vi shopify.app.toml
# Change: application_url = "https://shopify.yourdomain.com"
# Change: redirect_urls = [ "https://shopify.yourdomain.com/auth/callback" ]
```

Install Shopify CLI and deploy:
```bash
npm install @shopify/cli @shopify/app
npx shopify app deploy
```

When it shows a user verification code:
1. Open the URL it displays on your computer's browser
2. Log in with your Shopify Partner account
3. Wait for the CLI to detect the auth (do NOT press any key until auth completes)
4. Confirm the deploy with `y`

### Option B: Via Shopify Dev Dashboard

1. Go to https://dev.shopify.com/dashboard
2. Select your app
3. Create a new version with the correct URLs
4. Release the version

## Step 10: Install the App on Your Store

If the app was previously installed with a different URL, uninstall it first:
1. Go to your Shopify admin > Settings > Apps and sales channels
2. Uninstall the app

Reinstall with the new URL:
```
https://your-store.myshopify.com/admin/oauth/install?client_id=YOUR_API_KEY
```

## Step 11: Verify

1. Visit `https://shopify.yourdomain.com/` - should show the landing page
2. Open the app in Shopify admin - should load inside the iframe
3. Check PM2 logs for errors: `npx pm2 logs kwtsms-shopify --lines 30`

---

## Updating the App

When you push new code to GitHub:

```bash
cd ~/shopify-app && git pull origin main && npm run build && npx pm2 restart kwtsms-shopify
```

If dependencies changed:
```bash
git pull origin main
npm install
npx prisma generate
npm run build
npx pm2 restart kwtsms-shopify
```

If database schema changed:
```bash
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
npx pm2 restart kwtsms-shopify
```

---

## Problems and Solutions

### Problem: `GLIBC_2.27 not found` when running node
**Cause**: Server OS is too old (CloudLinux 7, CentOS 7) for modern Node.js binaries.
**Solution**: Use `alt-nodejs20` package from CloudLinux repos. Do NOT download from nodejs.org.

### Problem: `tar: xz: Cannot exec: Permission denied`
**Cause**: `xz` utility not installed or not executable on the server.
**Solution**: Download `.tar.gz` instead of `.tar.xz` if installing manually.

### Problem: `npm install -g` fails with EACCES
**Cause**: Global npm directory is owned by root.
**Solution**: Install packages locally in the project (`npm install pm2` instead of `npm install -g pm2`), then use `npx` to run them.

### Problem: `prisma db push` fails with "invalid domain character in database URL"
**Cause**: Password contains special characters (`@`, `#`, `^`, `!`, etc.).
**Solution**: URL-encode special characters in the DATABASE_URL. Example: `@` becomes `%40`.

### Problem: `prisma db push` fails with "BLOB/TEXT column can't have a default value"
**Cause**: MySQL does not allow `@default()` on TEXT/BLOB columns (SQLite does).
**Solution**: Remove `@default("[]")` from fields that have `@db.Text` in `prisma/schema.prisma`. Set defaults in application code instead.

### Problem: App returns 404 for all requests
**Cause**: Apache prepends `index.php` to requests before proxying to Node.js.
**Solution**: Add `DirectoryIndex disabled` as the first line in `.htaccess`.

### Problem: `shopify app deploy` fails with `Error: spawn xdg-open EACCES`
**Cause**: Server has no browser and `xdg-open` binary doesn't exist or has wrong permissions.
**Solution**: Create a dummy `xdg-open`:
```bash
mkdir -p ~/bin
echo '#!/bin/bash' > ~/bin/xdg-open
echo 'echo "$1"' >> ~/bin/xdg-open
chmod +x ~/bin/xdg-open
export PATH="$HOME/bin:$PATH"
```

### Problem: `shopify app deploy` auth doesn't persist between runs
**Cause**: The CLI can't save auth tokens properly on some systems.
**Solution**: After the browser says "Successfully logged in", wait on the terminal. If it still shows the error, run `npx shopify app deploy` again immediately - the auth may now be cached.

### Problem: App shows "Application Error" in Shopify admin
**Cause**: The Node.js app is returning a 500 error.
**Solution**: Check PM2 logs: `npx pm2 logs kwtsms-shopify --lines 30`. Common causes:
- Database tables don't exist (run `npx prisma db push`)
- Missing environment variables in `.env`
- Build is outdated (run `npm run build`)

### Problem: App loads old Cloudflare tunnel URL after updating
**Cause**: Shopify cached the old app URL from development.
**Solution**: Uninstall the app from your store, then reinstall using the OAuth install URL.

### Problem: `pm2 startup` fails with "Init system not found"
**Cause**: Shared hosting doesn't have systemd.
**Solution**: Use cron `@reboot` instead (see Step 7).

### Problem: 500 error from Apache proxy
**Cause**: `mod_proxy` or `mod_proxy_http` not enabled.
**Solution**: Ask hosting provider to enable these Apache modules. Or use cPanel's "Setup Node.js App" feature if available.

---

## Server Details (Current Production)

- **Host**: cPanel on CloudLinux 7.9
- **IP**: 64.91.254.108
- **User**: shopifykwtsms
- **App path**: /home/shopifykwtsms/shopify-app
- **Node**: /opt/alt/alt-nodejs20 (v20.20.0)
- **Database**: MySQL (shopifykwtsms_shopify)
- **URL**: https://shopify.kwtsms.com
- **Process manager**: PM2 (local install)
- **Reverse proxy**: Apache .htaccess with mod_proxy
