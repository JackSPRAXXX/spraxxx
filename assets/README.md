# SPRAXXX Assets

This directory contains visual assets for the SPRAXXX website.

## Current Files

- **favicon.svg** — Vector icon with SPRAXXX gradient branding (32×32 scalable)

## Missing Assets (TODO)

The following assets are referenced in HTML but not yet created:

- **favicon.png** — 32×32px raster fallback (for older browsers)
- **apple-touch-icon.png** — 180×180px iOS home screen icon
- **og.jpg** — 1200×630px Open Graph social sharing image

## Creating Missing Assets

### favicon.png
Convert the SVG to a 32×32px PNG:
```bash
# Using ImageMagick or similar
convert -background none -resize 32x32 favicon.svg favicon.png
```

### apple-touch-icon.png
Create a 180×180px version with padding:
```bash
convert -background none -resize 160x160 -gravity center -extent 180x180 favicon.svg apple-touch-icon.png
```

### og.jpg
Create a 1200×630px social card featuring:
- SPRAXXX branding
- Tagline: "Verified Email, Identity Keys & Mail-Safe Receipts"
- Dark background matching site theme (#0b0c11)
- Gradient accents (#90f2ff → #8cffc1)

## Design System

**Colors:**
- Background: `#0b0c11`
- Primary brand: `#90f2ff` (cyan)
- Secondary brand: `#8cffc1` (mint green)
- Text: `#e9f1ff`
- Muted: `#9fb0c8`

**Gradients:**
- Badge: `conic-gradient(from 120deg, #90f2ff, #8cffc1, #90f2ff)`
- Panels: `linear-gradient(180deg, #11152a, #0d1020)`
