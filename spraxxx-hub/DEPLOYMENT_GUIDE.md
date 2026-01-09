# SPRAXXX Ecosystem - Complete Deployment Guide

**Full stack deployment: Hub + Blackbox + Shared Components**

---

## 🎯 What You're Deploying

### 1. Main Hub (`spraxxx.com`)
- Ecosystem landing page
- All services in one place
- Contact form with Cloudflare Workers backend

### 2. Blackbox Landing (`blackbox.spraxxx.com`)
- Private compute waitlist page
- Shared nav/footer linking to hub

### 3. Shared Components
- Navigation (reusable across all sites)
- Footer (reusable across all sites)
- Consistent brand experience

### 4. Backend Infrastructure
- Cloudflare Workers for form handling
- DNS configuration for all subdomains
- SSL/TLS for all endpoints

---

## ⚡ Quick Start (30 minutes)

**Prerequisites**:
- GitHub account
- Cloudflare account
- Domain `spraxxx.com` added to Cloudflare
- LIVESWAN node IP address

**Steps**:
1. Deploy main hub to Cloudflare Pages (10 min)
2. Deploy Blackbox landing to Cloudflare Pages (5 min)
3. Configure DNS records (10 min)
4. Deploy Cloudflare Worker for contact form (5 min)
5. Test everything (5 min)

---

## 📁 Repository Structure

```
spraxxx/
├── spraxxx-hub/                    # Main hub (spraxxx.com)
│   ├── index.html                  # Landing page
│   ├── assets/
│   │   ├── css/hub.css             # Styles
│   │   └── js/hub.js               # Interactive logic
│   ├── components/
│   │   ├── shared-nav.html         # Reusable navigation
│   │   └── shared-footer.html      # Reusable footer
│   ├── workers/
│   │   └── contact-handler.js      # Cloudflare Worker
│   └── deployment/
│       ├── DNS_CONFIG.md           # DNS templates
│       └── DEPLOYMENT_GUIDE.md     # This file
│
├── blackbox-landing-safe/          # Blackbox landing (blackbox.spraxxx.com)
│   ├── index.html                  # Waitlist page
│   ├── assets/
│   │   └── css/style.css           # Styles
│   └── README.md                   # Blackbox docs
│
└── [other directories...]
```

---

## 🚀 Step 1: Deploy Main Hub

### Option A: Single Repository (Recommended)

**1.1. Create Cloudflare Pages Project**

1. Go to https://dash.cloudflare.com
2. Select **Pages** → **Create a project**
3. Connect your GitHub account
4. Select repository: `JackSPRAXXX/spraxxx`
5. Configure build:
   - **Project name**: `spraxxx-hub`
   - **Production branch**: `main` (or `claude/spraxxx-landing-page-B6N5V`)
   - **Build command**: (leave empty)
   - **Build output directory**: `/spraxxx-hub`
   - **Root directory**: `spraxxx-hub` (important!)
6. Click **Save and Deploy**

**1.2. Add Custom Domain**

1. After deployment, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `spraxxx.com`
4. Click **Activate domain**
5. Repeat for: `www.spraxxx.com`

**1.3. Verify**

```bash
curl -I https://spraxxx.com
# Should return 200 OK
```

---

### Option B: Separate Repositories

If you want separate repos for each site:

**1.1. Create new repository**

```bash
# Clone only the hub directory
cd /tmp
git clone https://github.com/JackSPRAXXX/spraxxx.git
cd spraxxx
git filter-branch --subdirectory-filter spraxxx-hub

# Push to new repo
git remote add hub https://github.com/JackSPRAXXX/spraxxx-hub.git
git push hub main
```

**1.2. Connect to Cloudflare Pages**

Same as Option A, but select the `spraxxx-hub` repository.

---

## 🔲 Step 2: Deploy Blackbox Landing

**2.1. Create Cloudflare Pages Project**

1. Go to **Pages** → **Create a project**
2. Select repository: `JackSPRAXXX/spraxxx`
3. Configure build:
   - **Project name**: `spraxxx-blackbox`
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `/blackbox-landing-safe`
   - **Root directory**: `blackbox-landing-safe`
4. Click **Save and Deploy**

**2.2. Add Custom Domain**

1. Go to **Custom domains**
2. Add: `blackbox.spraxxx.com`
3. Click **Activate domain**

**2.3. Verify**

```bash
curl -I https://blackbox.spraxxx.com
# Should return 200 OK
```

---

## 🌐 Step 3: Configure DNS

**3.1. Get LIVESWAN IP**

```bash
# SSH into LIVESWAN
ssh user@your-liveswan-host

# Get public IP
curl -4 ifconfig.me
# Example: 123.45.67.89
```

**3.2. Add DNS Records in Cloudflare**

Go to **DNS** → **Records**, add these:

| Type  | Name     | Target                              | Proxy |
|-------|----------|-------------------------------------|-------|
| CNAME | @        | spraxxx-hub.pages.dev               | ON    |
| CNAME | www      | spraxxx-hub.pages.dev               | ON    |
| CNAME | blackbox | spraxxx-blackbox.pages.dev          | ON    |
| A     | hux      | [LIVESWAN_IP]                       | ON    |
| A     | oracle   | [LIVESWAN_IP]                       | ON    |
| A     | term     | [LIVESWAN_IP]                       | ON    |
| A     | perm     | [LIVESWAN_IP]                       | ON    |
| A     | status   | [LIVESWAN_IP]                       | ON    |

Replace `[LIVESWAN_IP]` with actual IP from step 3.1.

**3.3. Verify DNS Propagation**

```bash
dig spraxxx.com +short
dig hux.spraxxx.com +short
dig blackbox.spraxxx.com +short
```

Wait 5-10 minutes if records don't resolve immediately.

---

## 🔧 Step 4: Deploy Cloudflare Worker

**4.1. Install Wrangler CLI**

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

**4.2. Create Worker Project**

```bash
cd /home/user/spraxxx/spraxxx-hub/workers

# Create wrangler.toml
cat > wrangler.toml <<'EOF'
name = "spraxxx-contact-handler"
main = "contact-handler.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "spraxxx.com/api/contact", zone_name = "spraxxx.com" }
]
EOF
```

**4.3. Deploy Worker**

```bash
wrangler deploy
```

**4.4. Verify Worker**

```bash
curl -X POST https://spraxxx.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "service": "test",
    "message": "Test message"
  }'

# Should return: {"success":true}
```

**4.5. Check Email**

Verify email arrived at `hello@spraxxx.com`.

---

## 🧪 Step 5: Test Everything

### 5.1. Test Main Hub

```bash
# Homepage loads
curl -I https://spraxxx.com
# Should return 200 OK

# WWW redirect works
curl -I https://www.spraxxx.com
# Should return 200 OK or 301 to non-www

# Assets load
curl -I https://spraxxx.com/assets/css/hub.css
# Should return 200 OK
```

### 5.2. Test Blackbox Landing

```bash
curl -I https://blackbox.spraxxx.com
# Should return 200 OK
```

### 5.3. Test Node Services

```bash
curl -I https://hux.spraxxx.com
curl -I https://oracle.spraxxx.com
curl -I https://term.spraxxx.com
curl -I https://perm.spraxxx.com
curl -I https://status.spraxxx.com

# All should return 200 OK
```

### 5.4. Test Contact Form

1. Open https://spraxxx.com in browser
2. Scroll to contact form
3. Fill out all fields
4. Submit
5. Should see "✓ Request sent!" message
6. Check `hello@spraxxx.com` for email

### 5.5. Test Shared Navigation

1. Open https://blackbox.spraxxx.com
2. Click "SPRAXXX" logo in nav
3. Should redirect to https://spraxxx.com

---

## 🔐 Step 6: Security Configuration

### 6.1. SSL/TLS Settings

**Cloudflare Dashboard** → **SSL/TLS**:
- Mode: **Full (strict)**
- Always Use HTTPS: **ON**
- Minimum TLS Version: **TLS 1.2**
- Automatic HTTPS Rewrites: **ON**

### 6.2. Security Headers

**Cloudflare Dashboard** → **Transform Rules** → **Modify Response Header**:

Add these headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 6.3. Firewall Rules (Optional)

**Cloudflare Dashboard** → **Security** → **WAF**:

**Rule 1: Rate limit contact form**
- Field: URI Path
- Operator: equals
- Value: `/api/contact`
- Action: Challenge
- Rate: 5 requests per minute

---

## 📊 Step 7: Monitoring & Analytics

### 7.1. Cloudflare Web Analytics

**Cloudflare Dashboard** → **Web Analytics**:
1. Enable for `spraxxx.com`
2. Add tracking snippet (optional, privacy-first)

### 7.2. Status Monitoring

Use existing `status.spraxxx.com` or add UptimeRobot:

1. Sign up at https://uptimerobot.com
2. Add monitors for:
   - https://spraxxx.com (5 min intervals)
   - https://blackbox.spraxxx.com
   - https://hux.spraxxx.com
   - All other subdomains
3. Set alert email: `hello@spraxxx.com`

### 7.3. Error Tracking (Optional)

For production, consider:
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **Highlight.io** (privacy-first alternative)

---

## 🔄 Step 8: Update Workflow

### 8.1. Making Changes to Hub

```bash
cd /home/user/spraxxx

# Edit files
vim spraxxx-hub/index.html

# Commit
git add spraxxx-hub/
git commit -m "Update hub: [description]"
git push origin main

# Cloudflare Pages auto-deploys (30-60 seconds)
```

### 8.2. Making Changes to Blackbox

```bash
# Edit files
vim blackbox-landing-safe/index.html

# Commit
git add blackbox-landing-safe/
git commit -m "Update blackbox: [description]"
git push origin main

# Auto-deploys
```

### 8.3. Updating Workers

```bash
cd spraxxx-hub/workers

# Edit
vim contact-handler.js

# Deploy
wrangler deploy

# Live immediately
```

---

## 🚨 Troubleshooting

### Issue: 404 on spraxxx.com

**Cause**: Pages deployment failed or custom domain not configured

**Fix**:
1. Check Cloudflare Pages deployment logs
2. Verify custom domain is added
3. Check DNS records point to Pages domain
4. Wait 5 minutes for DNS propagation

### Issue: Contact form not working

**Cause**: Worker not deployed or route not configured

**Fix**:
1. Verify worker is deployed: `wrangler deployments list`
2. Check route in wrangler.toml matches `/api/contact`
3. Test worker directly: `curl -X POST https://spraxxx.com/api/contact`
4. Check browser console for errors

### Issue: HTTPS not working

**Cause**: SSL certificate not provisioned or wrong SSL mode

**Fix**:
1. Set SSL/TLS mode to **Full (strict)**
2. Wait 5 minutes for Universal SSL certificate
3. Ensure proxy is enabled (orange cloud) in DNS

### Issue: Mixed content warnings

**Cause**: HTTP resources loaded on HTTPS page

**Fix**:
1. Enable **Automatic HTTPS Rewrites** in Cloudflare
2. Update hardcoded `http://` links to `https://`
3. Check browser console for specific resources

### Issue: Node services not loading

**Cause**: LIVESWAN Nginx not configured or firewall blocking

**Fix**:
1. SSH into LIVESWAN
2. Check Nginx status: `sudo systemctl status nginx`
3. Check firewall: `sudo ufw status`
4. Check logs: `tail -f /var/log/nginx/error.log`

---

## 📋 Post-Deployment Checklist

**Before announcing**:

- [ ] spraxxx.com loads correctly
- [ ] www.spraxxx.com redirects or loads
- [ ] blackbox.spraxxx.com loads correctly
- [ ] All node services (hux, oracle, term, perm, status) load
- [ ] Contact form sends emails
- [ ] Emails arrive at hello@spraxxx.com
- [ ] HTTPS works on all domains
- [ ] No SSL certificate errors
- [ ] No mixed content warnings
- [ ] Mobile responsive (test on phone)
- [ ] Shared nav links work (Blackbox → Hub)
- [ ] All service cards link to correct URLs
- [ ] Status page accessible
- [ ] DNS fully propagated (check dnschecker.org)
- [ ] Uptime monitoring configured
- [ ] Error tracking set up (if using)

---

## 🎉 Launch Sequence

### Soft Launch (Week 1)

1. Deploy everything (complete checklist above)
2. Share with 5-10 trusted contacts:
   ```
   "Hey! Just launched the new SPRAXXX ecosystem:
   https://spraxxx.com

   All our services are now in one place. Check it out!"
   ```
3. Monitor contact form submissions
4. Fix any issues reported
5. Gather feedback

### Public Launch (Week 2+)

1. Announce on:
   - Hacker News (Show HN)
   - Twitter/X
   - LinkedIn
   - Reddit (relevant subreddits)
2. Monitor traffic spike
3. Respond to contact requests within 24 hours
4. Scale infrastructure if needed

---

## 📈 Success Metrics

### Week 1 (Soft Launch)
- 50-100 unique visitors
- 5-10 contact form submissions
- 0 critical bugs
- All services operational

### Month 1
- 1,000+ unique visitors
- 50+ contact form submissions
- 10+ waitlist signups (Blackbox)
- <1% error rate

### Month 3
- 5,000+ unique visitors
- 200+ contact form submissions
- 50+ waitlist signups
- First paid Blackbox customer

---

## 🔗 Quick Links

**Production URLs**:
- Main Hub: https://spraxxx.com
- Blackbox: https://blackbox.spraxxx.com
- Status: https://status.spraxxx.com

**Cloudflare Dashboards**:
- Pages: https://dash.cloudflare.com → Pages
- Workers: https://dash.cloudflare.com → Workers
- DNS: https://dash.cloudflare.com → DNS

**Monitoring**:
- UptimeRobot: https://uptimerobot.com
- Cloudflare Analytics: https://dash.cloudflare.com → Analytics

---

## 🛟 Support

**Issues?**
- Check this guide first
- Review Cloudflare Pages deployment logs
- Check browser console for errors
- Test with curl/dig commands above

**Email**: hello@spraxxx.com

---

**Everything deployed. Ecosystem live. Ship it.** 🚀

---

*Last updated: 2026-01-09*
