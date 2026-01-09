# SPRAXXX Blackbox Ops — Landing Page

**Private compute. Zero noise. Pay to touch.**

This repository contains the production-ready landing page for SPRAXXX Blackbox Ops, a private compute service with cryptographic session seals.

---

## 🚀 Quick Start

### Option 1: Deploy to Cloudflare Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SPRAXXX Blackbox landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/spraxxx-blackbox-landing.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Pages** → **Create a project**
   - Connect your GitHub repo: `spraxxx-blackbox-landing`
   - Build settings:
     - **Framework preset**: None
     - **Build command**: (leave empty)
     - **Build output directory**: `/`
   - Click **Save and Deploy**

3. **Configure Custom Domain** (optional):
   - In Cloudflare Pages, go to **Custom domains**
   - Add: `blackbox.spraxxx.com`
   - Cloudflare will auto-configure DNS and HTTPS

### Option 2: Deploy to Any Static Host

This is a pure static site (HTML/CSS/JS). Upload to:
- **Netlify**: Drag & drop the folder
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to `gh-pages` branch
- **S3 + CloudFront**: Upload and configure bucket policy

---

## 📁 Project Structure

```
spraxxx-blackbox-landing/
├── index.html              # Main landing page
├── assets/
│   ├── css/
│   │   └── style.css       # All styles (dark theme, modal, responsive)
│   ├── js/
│   │   └── main.js         # Interactive modal, node selection, config loader
│   └── images/             # Future: logos, icons, OG images
├── nodes.json              # Node endpoint configuration (dynamic injection)
├── README.md               # This file
└── .gitignore              # Git ignore rules
```

---

## 🔗 Node Integration

### Existing Nodes

Your live nodes (already deployed):

| Node      | HTTPS Endpoint                   | Purpose              |
|-----------|----------------------------------|----------------------|
| LiveSwan  | `https://liveswan.spraxxx.com`   | HOUR tier (60 min)   |
| AngryWu   | `https://angrywu.spraxxx.com`    | DAY tier (8 hours)   |
| SadBlack  | `https://sadblack.spraxxx.com`   | FORGE tier (72 hours)|

### Configuration

Node endpoints are defined in `nodes.json`:

```json
{
  "liveswan": "https://liveswan.spraxxx.com",
  "angrywu": "https://angrywu.spraxxx.com",
  "sadblack": "https://sadblack.spraxxx.com"
}
```

**How it works**:
1. On page load, `main.js` fetches `nodes.json`
2. When user clicks a tier card, the modal displays the correct node endpoint
3. If `nodes.json` is missing, fallback URLs are used

**To update node URLs**:
- Edit `nodes.json` and redeploy
- No HTML changes needed

---

## 🎨 Customization

### Updating Pricing

Edit `index.html`, lines with `data-price` attributes:

```html
<div class="node-card" data-node="liveswan" data-tier="HOUR" data-price="$150">
```

Change `$150` to your new price.

### Updating Features

Edit feature lists in each `.tier-features` section:

```html
<div class="tier-features">
  <p>60 minutes runtime</p>
  <p>SSH/HTTPS access</p>
  <p>Hard wipe after session</p>
  <p>Cryptographic seal receipt</p>
</div>
```

### Changing Colors

Edit CSS variables in `assets/css/style.css`:

```css
:root {
  --bg-black: #000000;
  --accent-green: #00ff88;
  --accent-red: #ff4444;
  --accent-orange: #ffaa00;
}
```

---

## 🔐 Security Notes

### What This Landing Page Does

✅ **Client-side only** (no backend, no server processing)
✅ **No cookies** (no tracking, no sessions)
✅ **No telemetry** (optional analytics placeholder in `main.js`)
✅ **No external dependencies** (pure HTML/CSS/JS, no frameworks)
✅ **Dynamic node URLs** (via `nodes.json`, not hardcoded)

### What This Landing Page Does NOT Do

❌ **No payment processing** (handled manually via Stripe or crypto)
❌ **No user authentication** (handled by node provisioning workflow)
❌ **No database** (stateless landing page)
❌ **No form submissions** (uses `mailto:` links)

### Credentials Safety

**NEVER commit to this repo**:
- Private keys
- API keys
- Stripe secrets
- Node SSH credentials

These belong in your node provisioning scripts (see `BLACKBOX_WORKFLOW.md` in main repo).

---

## 🧪 Testing Checklist

Before deploying:

### 1. Node Link Accuracy
- [ ] Verify `nodes.json` URLs match your live nodes
- [ ] Click each tier card → modal should show correct node endpoint
- [ ] Test `mailto:` link opens email client correctly

### 2. Email Workflow
- [ ] Modal displays: "Send email to blackbox@spraxxx.com"
- [ ] Email subject pre-fills with tier name
- [ ] Email body includes: Name, Date/Time, Tier, Payment Method

### 3. Responsive Design
- [ ] Test on mobile (portrait & landscape)
- [ ] Test on tablet
- [ ] Test on desktop (1920px, 1440px, 1024px widths)
- [ ] Modal should be centered and scrollable on small screens

### 4. Interactivity
- [ ] Hover effects work on tier cards
- [ ] Click tier card → modal opens
- [ ] Click CTA button → modal opens
- [ ] Click X button → modal closes
- [ ] Click outside modal → modal closes
- [ ] Press Escape key → modal closes

### 5. Security & Privacy
- [ ] No node URLs visible in HTML source (only in `nodes.json`)
- [ ] No credentials hardcoded anywhere
- [ ] No external scripts loaded (verify in Network tab)
- [ ] HTTPS enforced (Cloudflare handles this)

### 6. Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (Chrome, Safari)

---

## 🎮 Optional Enhancements

### Scarcity Indicator

Add a live slot counter (requires backend or manual update):

```html
<p class="scarcity-notice">⚠️ 2 slots left today</p>
```

Update daily by editing `index.html` or fetching from an API.

### Interactive Survey

Add a fun question before modal opens:

```javascript
// In main.js, before openModal()
const answer = prompt("What's your use case? (dev, testing, AI training, research)");
trackEvent('use_case', { answer });
```

### Session Seal Preview

Add visual proof of wipe in modal:

```html
<div class="seal-preview">
  <code>SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
  <p>Cryptographic proof of wipe (example)</p>
</div>
```

---

## 📊 Analytics (Optional, Privacy-First)

Currently, no analytics are active. To add privacy-respecting tracking:

### Option 1: Plausible Analytics

1. Add script to `index.html` before `</head>`:
   ```html
   <script defer data-domain="blackbox.spraxxx.com" src="https://plausible.io/js/script.js"></script>
   ```

2. Plausible is:
   - GDPR compliant
   - No cookies
   - No personal data collection
   - Open source

### Option 2: Self-Hosted Umami

1. Deploy Umami on your own server
2. Add tracking script to `index.html`
3. Full control, no third parties

### Option 3: No Analytics

Leave as-is. You don't need analytics if:
- Manual reservations only
- Low volume (< 100 visitors/month)
- Privacy is paramount

---

## 🚨 Troubleshooting

### Modal not opening?

**Check**:
1. Browser console for JavaScript errors
2. `main.js` loaded correctly (check Network tab)
3. Click handlers attached (add `console.log` in `initializeTierCards()`)

### Node URLs not displaying?

**Check**:
1. `nodes.json` exists and is valid JSON
2. Browser console shows: "Node configuration loaded"
3. Fetch succeeded (check Network tab for `nodes.json` 200 OK)

### Email link not working?

**Check**:
1. Email client is configured on device
2. `mailto:` link format is correct
3. Try manual copy: `blackbox@spraxxx.com`

### Styles not loading?

**Check**:
1. `assets/css/style.css` path is correct (relative to `index.html`)
2. No 404 errors in Network tab
3. Hard refresh browser (Ctrl+Shift+R)

---

## 🔄 Deployment Workflow

### Development

1. Make changes locally
2. Test with local server:
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js
   npx serve .

   # PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in browser

### Staging

1. Push to `staging` branch
2. Cloudflare Pages auto-deploys to staging URL
3. Test on real domain before production

### Production

1. Merge to `main` branch
2. Cloudflare Pages auto-deploys to production
3. Verify live site works
4. Monitor email: `blackbox@spraxxx.com` for reservations

---

## 📝 Manual Reservation Workflow

When email arrives at `blackbox@spraxxx.com`:

1. **Review request** (legitimate? slot available?)
2. **Send invoice** (Stripe or crypto address)
3. **Wait for payment** confirmation
4. **Provision node** (run `/srv/blackbox/provision.sh`)
5. **Send access email** (SSH key + credentials)
6. **Customer uses node** (monitor uptime only)
7. **Auto-wipe at end time** (`/srv/blackbox/wipe.sh`)
8. **Auto-seal email** (receipt with cryptographic proof)

See `BLACKBOX_WORKFLOW.md` in main repo for full details.

---

## 🛡️ Cloudflare Configuration

### DNS Records

```
blackbox.spraxxx.com    CNAME   spraxxx-blackbox-landing.pages.dev   (Proxied)
```

### Page Rules (Optional)

1. **Force HTTPS**:
   - URL: `http://blackbox.spraxxx.com/*`
   - Setting: Always Use HTTPS

2. **Cache Everything**:
   - URL: `blackbox.spraxxx.com/*`
   - Setting: Cache Level = Cache Everything
   - Edge Cache TTL: 2 hours

### Security Headers (Recommended)

Add in Cloudflare Workers or Pages Settings:

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 📦 What's Next?

### Week 1: Manual Operations
- [ ] Deploy landing page to Cloudflare Pages
- [ ] Configure custom domain: `blackbox.spraxxx.com`
- [ ] Test full flow (click → modal → email → reservation)
- [ ] Complete first 3 HOUR sessions

### Week 2-4: Refine & Scale
- [ ] Gather customer feedback
- [ ] Adjust pricing if needed
- [ ] Add second node (if demand is high)
- [ ] Write case study (with customer permission)

### Month 2+: Automate
- [ ] Self-service booking calendar (future)
- [ ] Auto-provisioning script (semi-automated)
- [ ] Public seal verification API
- [ ] Referral program (10% discount)

---

## 🤝 Support

**For landing page issues**:
- Check this README first
- Review browser console for errors
- Test with `nodes.json` fallback URLs

**For node provisioning**:
- See `BLACKBOX_WORKFLOW.md` in main repo
- Email: `blackbox@spraxxx.com`

**For Cloudflare issues**:
- Check Cloudflare Pages build logs
- Verify DNS records are proxied
- Ensure HTTPS is enabled

---

## 📄 License

This landing page is proprietary to SPRAXXX. Do not redistribute without permission.

Node infrastructure and cryptographic seal specifications are documented separately in the main SPRAXXX repository.

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] `nodes.json` URLs match live nodes
- [ ] Email `blackbox@spraxxx.com` is configured and monitored
- [ ] Stripe account ready (or crypto wallets prepared)
- [ ] At least 1 node ready to provision (LiveSwan recommended)
- [ ] Pricing confirmed ($150/hr, $900/day, $5K/72hr)
- [ ] Terms of Service reviewed (if needed)
- [ ] Cloudflare domain configured: `blackbox.spraxxx.com`
- [ ] HTTPS working (Cloudflare auto-provisions)
- [ ] Mobile responsive tested
- [ ] All modal interactions working
- [ ] `mailto:` link tested

---

**When ready**: Push to `main`, deploy to Cloudflare, monitor email, ship first session. 🚀

---

*Last updated: 2026-01-09*
