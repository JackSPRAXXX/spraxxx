# SPRAXXX Blackbox Ops — Access Workflow

## Overview

```
REQUEST → APPROVE → PAYMENT → PROVISION → SESSION → WIPE → SEAL
```

This document defines the operational flow from "Request Access" click to receipt delivery.

---

## Phase 1: Request

**Customer Action**:
- Clicks "REQUEST ACCESS" on blackbox.spraxxx.com
- Email opens: `blackbox@spraxxx.com`
- Subject: "Blackbox Access Request"

**Customer Provides**:
```
Name:
Email:
Tier: [HOUR | DAY | FORGE]
Preferred Date/Time:
Use Case (1 sentence):
Payment Method: [Stripe | BTC | ETH]
```

**What Happens**:
- Email arrives at `blackbox@spraxxx.com`
- SPRAXXX Ops reviews (manual approval for now)

---

## Phase 2: Approval

**SPRAXXX Ops Reviews**:
- Is request legitimate? (not spam, not illegal use case)
- Is slot available? (max 3/day)
- Does tier match use case? (no underselling)

**Approval Criteria**:
✅ Legitimate use case (dev work, testing, analysis, research)
✅ Slot available for requested time
✅ Payment method acceptable

❌ Reject if:
- Spam / bot
- Illegal activity hinted
- Abusive language
- No use case provided

**Response Time**: Within 4 hours (business hours) or next morning

---

## Phase 3: Payment

**SPRAXXX Ops Sends Invoice**:

### Option A: Stripe
- Stripe invoice link
- Pre-filled with tier amount
- Customer pays via card

### Option B: Crypto
- BTC/ETH address provided
- Amount in USD equivalent (fixed at time of invoice)
- Payment must arrive within 24 hours or slot is released

**Payment Confirmation**:
- SPRAXXX Ops confirms payment received
- Slot is reserved (now unavailable to others)
- Provisioning begins

---

## Phase 4: Provisioning

**SPRAXXX Ops Provisions Node**:

1. **Select clean node** from pool (e.g., `liveswan-node-07`)
2. **Generate session ID**: `bb-YYYYMMDD-[random]`
3. **Create customer user account** on node
4. **Generate SSH keypair** (ed25519)
5. **Set session timer** (cron job to kill at end time)
6. **Take initial snapshot hash** (for seal later)
7. **Record session metadata** (start time, node ID, tier)

**Credentials Prepared**:
- SSH private key (customer downloads)
- SSH hostname/port
- HTTPS access URL (if applicable)
- Session ID
- Start/end times (UTC)

---

## Phase 5: Access Email

**SPRAXXX Ops Sends**:

```
Subject: Your SPRAXXX Blackbox Session is Ready

Hi [Name],

Your Blackbox session is provisioned and ready.

Session ID:    bb-20260109-a3f7c2
Tier:          HOUR
Start Time:    2026-01-09 14:00 UTC
End Time:      2026-01-09 15:00 UTC
Node:          liveswan-node-07

Access:
  SSH:   ssh -i blackbox.key user@node07.spraxxx.net -p 2222
  HTTPS: https://node07.spraxxx.net:8443

Your SSH private key is attached (blackbox.key).

Important:
- Session will be HARD KILLED at end time (no grace period)
- All data will be wiped
- You will receive a cryptographic seal receipt after wipe

Questions? Reply to this email.

—SPRAXXX Ops
blackbox@spraxxx.com
```

**Attachments**:
- `blackbox.key` (SSH private key, 600 permissions)

---

## Phase 6: Session

**Customer Uses Node**:
- SSH in, run whatever they need
- Install software, run jobs, test code
- Download any outputs before session ends

**SPRAXXX Ops Monitoring** (minimal):
- No content logging
- Only uptime/availability checks
- If node crashes, customer is notified

**Timer**:
- Cron job set for `END_TIME`
- At `END_TIME`, trigger wipe script (no warnings)

---

## Phase 7: Wipe

**Automatic Wipe Script**:

```bash
#!/bin/bash
# /srv/blackbox/wipe.sh

SESSION_ID="$1"
NODE_ID="$2"

# 1. Kill all customer processes
pkill -9 -u blackbox-user

# 2. Wipe data directories
shred -vfz -n 3 /home/blackbox-user/*
rm -rf /home/blackbox-user/.* 2>/dev/null
rm -rf /tmp/* /var/tmp/*

# 3. Clear kernel buffers
sync
echo 3 > /proc/sys/vm/drop_caches

# 4. Reset network state
iptables -F
iptables -X
systemctl restart networking

# 5. Rollback to clean snapshot
zfs rollback tank/blackbox@clean

# 6. Hash final state
WIPE_HASH=$(find /home/blackbox-user -type f | sort | xargs sha256sum | sha256sum | awk '{print $1}')

# 7. Generate seal
/srv/blackbox/seal-generate.sh "$SESSION_ID" "$NODE_ID" "$WIPE_HASH"

# 8. Node is ready for next customer
echo "WIPED: $SESSION_ID at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /var/log/blackbox-wipes.log
```

**Result**:
- Node is back to clean baseline
- Wipe hash recorded
- Seal generated and signed

---

## Phase 8: Seal & Receipt

**Automatic Seal Script**:

```bash
#!/bin/bash
# /srv/blackbox/seal-generate.sh

SESSION_ID="$1"
NODE_ID="$2"
WIPE_HASH="$3"

# Load session metadata (stored during provisioning)
START_TIME=$(cat /srv/blackbox/sessions/$SESSION_ID/start_time)
END_TIME=$(cat /srv/blackbox/sessions/$SESSION_ID/end_time)
TIER=$(cat /srv/blackbox/sessions/$SESSION_ID/tier)
SNAPSHOT_HASH=$(cat /srv/blackbox/sessions/$SESSION_ID/snapshot_hash)
CUSTOMER_EMAIL=$(cat /srv/blackbox/sessions/$SESSION_ID/email)

# Generate seal signature (Ed25519)
SEAL_DATA="$SESSION_ID|$NODE_ID|$START_TIME|$END_TIME|$TIER|$SNAPSHOT_HASH|$WIPE_HASH"
SEAL_SIG=$(echo -n "$SEAL_DATA" | openssl dgst -sha256 -sign /srv/blackbox/spraxxx-seal-key.pem | base64 -w0)

# Create human-readable receipt
cat > /srv/blackbox/sessions/$SESSION_ID/RECEIPT.txt <<EOF
SPRAXXX BLACKBOX SESSION SEAL
═══════════════════════════════════════════

Session ID:    $SESSION_ID
Node ID:       $NODE_ID
Tier:          $TIER
Started:       $START_TIME
Ended:         $END_TIME

Snapshot Hash: $SNAPSHOT_HASH
Wipe Hash:     $WIPE_HASH

Seal Signature:
$SEAL_SIG

Verified by:   SPRAXXX Ops (seal@spraxxx.com)
Receipt Date:  $(date -u +%Y-%m-%dT%H:%M:%SZ)

═══════════════════════════════════════════
This seal proves the session existed and was wiped.
No customer data was logged or retained.
Verify at: https://spraxxx.com/seal/verify
EOF

# Archive in museum (immutable)
cp /srv/blackbox/sessions/$SESSION_ID/RECEIPT.txt /srv/messiah/museum/seals/blackbox/$SESSION_ID.txt

# Email receipt to customer
mail -s "Your Blackbox Session Seal" -a /srv/blackbox/sessions/$SESSION_ID/RECEIPT.txt $CUSTOMER_EMAIL <<EOF
Hi,

Your Blackbox session has ended and been wiped.

Attached is your cryptographic session seal.

Session ID: $SESSION_ID
Duration: $TIER

Thank you for using SPRAXXX Blackbox Ops.

—SPRAXXX Ops
blackbox@spraxxx.com
EOF

echo "SEALED: $SESSION_ID" >> /var/log/blackbox-seals.log
```

**Customer Receives**:
- Email with receipt attached
- Plain text seal (human-readable)
- Can verify at spraxxx.com/seal/verify (future feature)

---

## Phase 9: Museum Archive

**Seal Stored In**:
```
/srv/messiah/museum/seals/blackbox/
  └── bb-20260109-a3f7c2.txt
  └── bb-20260109-f8d3e1.txt
  └── ...
```

**Properties**:
- Append-only (never deleted)
- Git-tracked (tamper-evident)
- Publicly auditable (no customer content, just seals)

---

## Scarcity Enforcement

**3 Slots Per Day Max**:

**Manual Phase** (launch):
- SPRAXXX Ops tracks slots in spreadsheet
- If 3 slots full for a day, respond: "Slots full for [date]. Next available: [date]."

**Automated Phase** (future):
- Calendar system with max 3 bookings/day
- Auto-respond when full
- Waiting list for cancellations

**Why Scarcity Works**:
- Urgency → faster decisions
- Exclusivity → higher perceived value
- Manageable load → quality service

---

## Customer Support

**During Session**:
- Email: `blackbox@spraxxx.com`
- Response time: 30 minutes (business hours)
- Issues: node down, access problems, extension requests

**Extension Requests**:
- Customer can request extra time (paid)
- SPRAXXX Ops approves if slot available
- New invoice sent, timer extended

**Refunds**:
- Node down >50% of session → full refund
- Customer error (wrong SSH key, etc.) → no refund
- Dissatisfaction → case-by-case (aim for goodwill)

---

## Security Notes

**What We Log**:
- Session start/end times
- Node ID used
- Payment received
- Wipe completion
- Seal generation

**What We Do NOT Log**:
- Customer commands
- Customer files
- Network traffic
- Process names
- Anything customer-created

**Physical Security**:
- Nodes are in trusted datacenter (or on-prem if paranoid)
- Full-disk encryption
- No remote admin access during customer session

---

## Launch Checklist

Before going live:

- [ ] `blackbox@spraxxx.com` email configured
- [ ] Stripe account ready (or crypto wallets)
- [ ] At least 1 clean node ready (e.g., liveswan-node-07)
- [ ] Wipe script tested and working
- [ ] Seal generation script tested
- [ ] SSH keypair generation automated
- [ ] Cron job timer tested (kills session at end time)
- [ ] Museum archive directory created
- [ ] Legal terms reviewed (if needed)

---

## Pricing Tiers (Reminder)

| Tier   | Duration | Price   | Features                          |
|--------|----------|---------|-----------------------------------|
| HOUR   | 60 min   | $150    | SSH/HTTPS, hard wipe after        |
| DAY    | 8 hours  | $900    | Priority CPU, snapshot download   |
| FORGE  | 72 hours | $5,000  | Custom node, NDA, private NS      |

---

## Future Automation

**Phase 1** (Manual):
- Email requests handled by human
- Provisioning done by hand
- Seals generated manually

**Phase 2** (Semi-Auto):
- Provisioning script (input: email, tier, time)
- Auto-wipe + seal after session
- Manual approval still required

**Phase 3** (Full Auto):
- Self-service booking calendar
- Auto-approval for verified customers
- Instant provisioning
- Public seal verification API

---

End of workflow.
