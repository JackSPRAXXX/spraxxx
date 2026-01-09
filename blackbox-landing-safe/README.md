# SPRAXXX Blackbox Ops — Safe Landing Page (Interest-Only)

**This is the SAFE version that addresses all red flags.**

---

## 🚦 What's Different From Original

### Removed (Red Flags):
- ❌ Specific pricing ($150, $900, $5,000)
- ❌ "Reserve" / "Buy Now" CTAs
- ❌ Node endpoint URLs
- ❌ Payment method mentions
- ❌ Stripe/crypto references
- ❌ Promises we can't yet keep

### Added (Safe):
- ✅ "Coming Soon" badges on tiers
- ✅ Waitlist form (interest collection)
- ✅ Use case dropdown
- ✅ Tier interest selection
- ✅ "Private Beta" messaging
- ✅ No pricing commitments
- ✅ Clear expectations ("Not ready for public use")

---

## 📋 What This Version Does

1. **Collects Interest**: Name, email, use case, tier preference
2. **Sets Expectations**: "Private beta", "Coming soon"
3. **Validates Demand**: See if people actually want this
4. **Buys Time**: Build infrastructure while gauging interest
5. **Eliminates Risk**: No payment = no liability

---

## 🔗 Form Backend Options

### Option A: Formspree (Recommended, Fastest)

1. Go to https://formspree.io/
2. Sign up (free tier: 50 submissions/month)
3. Create new form
4. Copy form ID (looks like `xyzabc123`)
5. Replace in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
   Change `YOUR_FORM_ID` to your actual ID

### Option B: Cloudflare Workers (More Control)

See `/cloudflare-workers/waitlist-handler.js` (to be created)

### Option C: mailto: (Simplest, Least Reliable)

Replace form with:
```html
<a href="mailto:hello@spraxxx.com?subject=Blackbox%20Waitlist" class="cta-button">
  EMAIL TO JOIN WAITLIST
</a>
```

---

## 🚀 Deployment

Same as original:
1. Push to GitHub
2. Connect to Cloudflare Pages
3. Deploy to `blackbox.spraxxx.com` (or `beta.spraxxx.com`)

---

## ✅ No Blockers

This version can launch TODAY because:
- No payment processing needed
- No node infrastructure needed
- No legal docs needed (just interest collection)
- No customer support needed (not selling anything)
- No refund policy needed (not charging)

---

## 📊 What Happens Next

1. **Deploy this page**
2. **Share with 10-20 trusted contacts**
3. **Collect emails for 1-2 weeks**
4. **Analyze responses**:
   - How many sign-ups?
   - Which tiers most popular?
   - What use cases?
5. **Build infrastructure based on demand**
6. **Upgrade to paid version when ready**

---

## 🎯 Success Metrics

- **Week 1**: 20+ signups → validates demand
- **Week 2**: 50+ signups → strong demand
- **Week 4**: 100+ signups → proceed with infrastructure build

If < 20 signups after 2 weeks → reconsider pricing/positioning.

---

## 🔄 Upgrade Path

When infrastructure is ready:

1. Email waitlist: "Private beta is open"
2. Send personalized pricing (early bird discount)
3. Manual booking for first 10 customers
4. Gather feedback
5. Automate based on learnings
6. Public launch

---

**This version lets you validate demand risk-free before building infrastructure.**
