# SPRAXXX DNS Configuration

**Complete DNS setup for Cloudflare**

---

## 🌐 Root Domain: spraxxx.com

### Main Hub

| Type  | Name | Target                              | Proxy | TTL  |
|-------|------|-------------------------------------|-------|------|
| CNAME | @    | spraxxx-hub.pages.dev               | ☁️ ON | Auto |
| CNAME | www  | spraxxx-hub.pages.dev               | ☁️ ON | Auto |

**Result**: https://spraxxx.com and https://www.spraxxx.com

---

## 📦 Service Subdomains

### Blackbox Ops

| Type  | Name     | Target                              | Proxy | TTL  |
|-------|----------|-------------------------------------|-------|------|
| CNAME | blackbox | spraxxx-blackbox.pages.dev          | ☁️ ON | Auto |

**Result**: https://blackbox.spraxxx.com

---

### Node Services (Point to LIVESWAN)

**LIVESWAN IP**: `[YOUR_LIVESWAN_IP]` (replace with actual IP)

| Type  | Name   | Target                 | Proxy | TTL  |
|-------|--------|------------------------|-------|------|
| A     | hux    | [LIVESWAN_IP]          | ☁️ ON | Auto |
| A     | oracle | [LIVESWAN_IP]          | ☁️ ON | Auto |
| A     | term   | [LIVESWAN_IP]          | ☁️ ON | Auto |
| A     | perm   | [LIVESWAN_IP]          | ☁️ ON | Auto |
| A     | status | [LIVESWAN_IP]          | ☁️ ON | Auto |

**Result**:
- https://hux.spraxxx.com
- https://oracle.spraxxx.com
- https://term.spraxxx.com
- https://perm.spraxxx.com
- https://status.spraxxx.com

---

### Coming Soon Services

| Type  | Name     | Target                 | Proxy | TTL  |
|-------|----------|------------------------|-------|------|
| A     | hallmark | [LIVESWAN_IP]          | ☁️ ON | Auto |

**Result**: https://hallmark.spraxxx.com (currently 404, will be live later)

---

## 🔧 Cloudflare Configuration Steps

### 1. Add DNS Records

**Via Cloudflare Dashboard**:
1. Log in to https://dash.cloudflare.com
2. Select domain: `spraxxx.com`
3. Go to **DNS** → **Records**
4. Click **Add record**
5. For each record above:
   - Set Type (A or CNAME)
   - Set Name (subdomain)
   - Set Target (IP or Pages domain)
   - Enable Proxy (orange cloud)
   - Click **Save**

**Via Cloudflare API** (optional, for automation):
```bash
# Set your API token
CF_API_TOKEN="your_api_token_here"
CF_ZONE_ID="your_zone_id_here"

# Add CNAME for hub
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "@",
    "content": "spraxxx-hub.pages.dev",
    "proxied": true
  }'

# Repeat for each subdomain...
```

---

### 2. Configure SSL/TLS

**Cloudflare Dashboard** → **SSL/TLS**:
- **Mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Minimum TLS Version**: TLS 1.2
- **Automatic HTTPS Rewrites**: ON
- **HTTP Strict Transport Security (HSTS)**: Enable

---

### 3. Page Rules (Optional Performance Boost)

**Cloudflare Dashboard** → **Page Rules**:

**Rule 1**: Cache Everything (spraxxx.com/*)
- URL: `spraxxx.com/*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 4 hours

**Rule 2**: Force HTTPS
- URL: `http://*spraxxx.com/*`
- Settings:
  - Always Use HTTPS: ON

---

### 4. Security Settings

**Cloudflare Dashboard** → **Security**:
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ON
- **Email Obfuscation**: ON

**Firewall Rules** (optional):
- Block known bad bots
- Rate limit contact form (max 5 requests/minute per IP)

---

## 🧪 Verification

After adding DNS records, verify they propagate:

```bash
# Check root domain
dig spraxxx.com +short

# Check subdomains
dig hux.spraxxx.com +short
dig blackbox.spraxxx.com +short

# Check HTTPS
curl -I https://spraxxx.com
curl -I https://hux.spraxxx.com
```

**Expected**:
- All domains resolve to correct IPs/CNAMEs
- All HTTPS requests return `200 OK` or `301/302` redirects
- SSL certificates are valid (check with browser)

---

## 📝 DNS Propagation

**Time**: 5 minutes - 48 hours (usually < 1 hour with Cloudflare)

**Check propagation**:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🚨 Troubleshooting

### DNS not resolving

**Problem**: `dig subdomain.spraxxx.com` returns `NXDOMAIN`

**Fix**:
1. Verify record was added in Cloudflare
2. Check spelling of subdomain
3. Wait 5-10 minutes for propagation
4. Clear local DNS cache: `sudo systemd-resolve --flush-caches`

### HTTPS not working

**Problem**: `ERR_SSL_PROTOCOL_ERROR` or certificate mismatch

**Fix**:
1. Verify SSL/TLS mode is **Full (strict)**
2. Ensure Cloudflare proxy is enabled (orange cloud)
3. Wait for Universal SSL certificate (usually instant)
4. Check origin server has valid SSL cert

### 404 on subdomain

**Problem**: DNS resolves but page shows 404

**Fix**:
1. Verify Cloudflare Pages project is deployed
2. Check custom domain is added in Pages settings
3. Verify Nginx on LIVESWAN is configured correctly
4. Check logs: `tail -f /var/log/nginx/error.log`

### Mixed content warnings

**Problem**: Browser console shows mixed HTTP/HTTPS resources

**Fix**:
1. Enable **Automatic HTTPS Rewrites** in Cloudflare
2. Update hardcoded `http://` links to `https://`
3. Use protocol-relative URLs: `//example.com/resource.js`

---

## 📋 DNS Record Checklist

Before going live:

- [ ] Root domain (`@`) points to hub
- [ ] WWW subdomain points to hub
- [ ] Blackbox subdomain points to Pages
- [ ] All node subdomains (hux, oracle, term, perm, status) point to LIVESWAN
- [ ] SSL/TLS mode set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] All domains resolve (test with `dig`)
- [ ] All HTTPS URLs load (test with `curl -I`)
- [ ] No SSL certificate errors in browser
- [ ] No mixed content warnings

---

## 🔐 Security Headers (Advanced)

**Add via Cloudflare Workers or Page Rules**:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 📊 Expected Result

After completing all steps:

| URL                          | Status | Points To          |
|------------------------------|--------|--------------------|
| https://spraxxx.com          | ✅ 200 | Cloudflare Pages   |
| https://www.spraxxx.com      | ✅ 200 | Cloudflare Pages   |
| https://blackbox.spraxxx.com | ✅ 200 | Cloudflare Pages   |
| https://hux.spraxxx.com      | ✅ 200 | LIVESWAN Node      |
| https://oracle.spraxxx.com   | ✅ 200 | LIVESWAN Node      |
| https://term.spraxxx.com     | ✅ 200 | LIVESWAN Node      |
| https://perm.spraxxx.com     | ✅ 200 | LIVESWAN Node      |
| https://status.spraxxx.com   | ✅ 200 | LIVESWAN Node      |
| https://hallmark.spraxxx.com | ⚠️ 404  | LIVESWAN (not ready) |

---

**All systems ready. DNS configured. Ship it.** 🚀
