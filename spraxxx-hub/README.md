# SPRAXXX Ecosystem Hub

**Main landing page for the complete SPRAXXX digital infrastructure**

---

## 🎯 What This Is

The unified front door for all SPRAXXX services:
- Verified Identity (Mail-Safe™)
- Blackbox Ops (private compute)
- HUX Tools (developer utilities)
- Interactive HUD (games & engagement)
- Terminal, Oracle, Permissions, Status

**Live at**: https://spraxxx.com

---

## 📁 Structure

```
spraxxx-hub/
├── index.html                  # Main landing page
├── assets/
│   ├── css/hub.css             # Styles (dark theme, responsive)
│   └── js/hub.js               # Logic (form handling, navigation)
├── components/
│   ├── shared-nav.html         # Reusable navigation
│   └── shared-footer.html      # Reusable footer
├── workers/
│   └── contact-handler.js      # Cloudflare Worker (email backend)
├── deployment/
│   ├── DNS_CONFIG.md           # DNS templates
│   └── DEPLOYMENT_GUIDE.md     # Full deployment instructions
└── README.md                   # This file
```

---

## 🚀 Quick Deploy

**Prerequisites**:
- Cloudflare account
- Domain `spraxxx.com` in Cloudflare
- GitHub repository

**Deploy in 10 minutes**:

1. **Cloudflare Pages**:
   - Connect GitHub repo
   - Root directory: `spraxxx-hub`
   - Deploy

2. **Add custom domain**:
   - spraxxx.com
   - www.spraxxx.com

3. **Configure DNS**:
   - See `deployment/DNS_CONFIG.md`

4. **Deploy Worker**:
   ```bash
   cd workers
   wrangler deploy
   ```

**Full instructions**: See `DEPLOYMENT_GUIDE.md`

---

## ✨ Features

### Services Grid
- Clickable service cards
- Live/Beta/Coming Soon badges
- Hover animations
- Direct links to all subdomains

### Contact Form
- Name, email, service selection, message
- Cloudflare Workers backend
- Sends to hello@spraxxx.com
- Success/error handling
- Form validation

### Shared Components
- Reusable navigation (include in all SPRAXXX sites)
- Reusable footer (include in all SPRAXXX sites)
- Consistent brand experience

### Design
- Dark theme
- Responsive (mobile/tablet/desktop)
- Smooth scrolling
- Sticky navigation
- Accessibility features

---

## 🔗 Linked Services

| Service | URL | Status |
|---------|-----|--------|
| Verified Identity | spraxxx.com/verified-identity | LIVE |
| Interactive HUD | spraxxx.com/docs | LIVE |
| Blackbox Ops | blackbox.spraxxx.com | BETA |
| HUX Tools | hux.spraxxx.com | LIVE |
| Terminal | term.spraxxx.com | LIVE |
| Oracle | oracle.spraxxx.com | LIVE |
| Permissions | perm.spraxxx.com | LIVE |
| Status Dashboard | status.spraxxx.com | LIVE |
| Hallmark | hallmark.spraxxx.com | SOON |

---

## 🛠️ Local Development

**Test locally**:
```bash
cd spraxxx-hub
python3 -m http.server 8000
# Open http://localhost:8000
```

**Make changes**:
1. Edit HTML/CSS/JS
2. Test in browser
3. Commit and push
4. Cloudflare Pages auto-deploys

---

## 🔧 Customization

### Update Service Cards

Edit `index.html`, find service cards:
```html
<a href="https://example.spraxxx.com" class="service-card" data-status="live">
  <div class="service-header">
    <div class="service-icon">🔧</div>
    <span class="service-badge live">LIVE</span>
  </div>
  <h3>Service Name</h3>
  <p>Description here...</p>
</a>
```

### Change Colors

Edit `assets/css/hub.css`:
```css
:root {
  --accent-primary: #00ff88;  /* Main accent color */
  --accent-secondary: #90f2ff; /* Secondary accent */
  --bg-black: #000000;         /* Background */
}
```

### Update Contact Form Email

Edit `workers/contact-handler.js`:
```javascript
to: [{ email: 'hello@spraxxx.com', name: 'SPRAXXX Team' }]
```

---

## 📧 Email Backend

**Cloudflare Worker** handles contact form:
- Route: `spraxxx.com/api/contact`
- Method: POST
- Backend: MailChannels (free on CF Workers)
- Recipient: hello@spraxxx.com

**Deploy worker**:
```bash
cd workers
wrangler deploy
```

**Test**:
```bash
curl -X POST https://spraxxx.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","service":"test"}'
```

---

## 🔐 Security

**Implemented**:
- HTTPS enforced (Cloudflare)
- No tracking/telemetry (privacy-first)
- Form validation (client + server)
- CORS headers (Workers)
- Email validation (server-side)
- Rate limiting (optional, via Cloudflare)

**Recommended**:
- Enable HSTS in Cloudflare
- Add CSP headers
- Enable firewall rules for form spam

---

## 📊 Analytics (Optional)

Currently **NO analytics** (privacy-first).

To add privacy-respecting analytics:

**Option 1: Plausible**
```html
<script defer data-domain="spraxxx.com" src="https://plausible.io/js/script.js"></script>
```

**Option 2: Self-hosted Umami**
```html
<script async src="https://analytics.spraxxx.com/script.js" data-website-id="your-id"></script>
```

---

## 🧪 Testing

**Automated tests** (future):
- Lighthouse CI (performance, accessibility)
- Broken link checker
- HTML validator

**Manual tests**:
- [ ] Page loads without errors
- [ ] All service cards link correctly
- [ ] Contact form sends emails
- [ ] Mobile responsive
- [ ] Cross-browser (Chrome, Firefox, Safari)
- [ ] HTTPS works
- [ ] No mixed content warnings

---

## 🚨 Troubleshooting

**Form not working?**
1. Check Workers deployment: `wrangler deployments list`
2. Verify route: `spraxxx.com/api/contact`
3. Check browser console for errors

**Service card 404?**
1. Verify subdomain DNS record exists
2. Check service is running (visit URL directly)
3. Update URL in `index.html` if changed

**Styles not loading?**
1. Check `assets/css/hub.css` path
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Cloudflare Pages deployment logs

---

## 📝 Changelog

**2026-01-09**: Initial release
- Main hub landing page
- All services integrated
- Contact form with Workers backend
- Shared nav/footer components
- Full deployment guide

---

## 🤝 Contributing

This is the main SPRAXXX ecosystem hub. Changes here affect all services.

**Before making changes**:
1. Test locally
2. Verify all service links still work
3. Test contact form
4. Check mobile responsive
5. Deploy to staging first (if available)

---

## 📄 License

Proprietary - SPRAXXX infrastructure

---

## 🔗 Related

- **Blackbox Landing**: `/blackbox-landing-safe/`
- **Red Flags Audit**: `/RED_FLAGS_AUDIT.md`
- **Launch Guide**: `/BLACKBOX_LAUNCH.md`

---

**Main hub for the SPRAXXX ecosystem. Infrastructure that signs its name.** 🚀
