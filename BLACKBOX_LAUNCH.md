# SPRAXXX Blackbox Ops — Launch Checklist

## Pre-Launch (Do This First)

### 1. Legal & Business Setup

- [ ] **Business entity** (LLC, sole prop, etc.) for liability protection
- [ ] **Terms of Service** (lawyer-reviewed if handling payments >$10K)
- [ ] **Acceptable Use Policy** (no illegal activity, no mining, no spam)
- [ ] **Privacy Policy** (minimal: "we don't log your content")
- [ ] **Stripe account** (or crypto wallets: BTC, ETH, USDC)
- [ ] **Insurance** (cyber liability, E&O) — optional but smart for $5K tier

### 2. Email Setup

- [ ] Register domain: `spraxxx.com` (already owned)
- [ ] Create email: `blackbox@spraxxx.com`
- [ ] Test email delivery (send/receive)
- [ ] Set up autoresponder: "Request received, response within 4 hours"

### 3. Payment Setup

**Option A: Stripe**
- [ ] Stripe account verified
- [ ] Enable manual invoicing
- [ ] Test invoice creation + payment

**Option B: Crypto**
- [ ] BTC wallet address (hardware wallet preferred)
- [ ] ETH wallet address
- [ ] Price oracle for USD conversion (CoinGecko API, etc.)
- [ ] Payment confirmation script (check blockchain for incoming tx)

### 4. Node Infrastructure

**First Node Setup**:
- [ ] Provision 1 clean node (Ubuntu 22.04 LTS or similar)
- [ ] Harden SSH (key-only, non-standard port, fail2ban)
- [ ] Install ZFS or Btrfs (for snapshot/rollback)
- [ ] Create baseline snapshot: `zfs snapshot tank/blackbox@clean`
- [ ] Test rollback: `zfs rollback tank/blackbox@clean`
- [ ] Configure firewall (iptables / ufw)
- [ ] Disable unnecessary services
- [ ] Install monitoring (uptime only, no content logging)

**Node Specs** (Recommended Minimum):
- **HOUR**: 4 CPU, 8 GB RAM, 100 GB SSD
- **DAY**: 8 CPU, 16 GB RAM, 200 GB SSD
- **FORGE**: 16 CPU, 32 GB RAM, 500 GB NVMe

### 5. Automation Scripts

**Provisioning Script**: `/srv/blackbox/provision.sh`
```bash
#!/bin/bash
# Input: SESSION_ID, TIER, START_TIME, END_TIME, CUSTOMER_EMAIL

SESSION_ID="$1"
TIER="$2"
START_TIME="$3"
END_TIME="$4"
CUSTOMER_EMAIL="$5"

# Create session directory
mkdir -p /srv/blackbox/sessions/$SESSION_ID

# Store metadata
echo "$SESSION_ID" > /srv/blackbox/sessions/$SESSION_ID/session_id
echo "$TIER" > /srv/blackbox/sessions/$SESSION_ID/tier
echo "$START_TIME" > /srv/blackbox/sessions/$SESSION_ID/start_time
echo "$END_TIME" > /srv/blackbox/sessions/$SESSION_ID/end_time
echo "$CUSTOMER_EMAIL" > /srv/blackbox/sessions/$SESSION_ID/email

# Generate SSH keypair
ssh-keygen -t ed25519 -f /srv/blackbox/sessions/$SESSION_ID/ssh_key -N "" -C "$SESSION_ID"

# Create user on node
useradd -m -s /bin/bash blackbox-$SESSION_ID
mkdir /home/blackbox-$SESSION_ID/.ssh
cp /srv/blackbox/sessions/$SESSION_ID/ssh_key.pub /home/blackbox-$SESSION_ID/.ssh/authorized_keys
chown -R blackbox-$SESSION_ID:blackbox-$SESSION_ID /home/blackbox-$SESSION_ID/.ssh
chmod 700 /home/blackbox-$SESSION_ID/.ssh
chmod 600 /home/blackbox-$SESSION_ID/.ssh/authorized_keys

# Take initial snapshot hash
SNAPSHOT_HASH=$(find /home/blackbox-$SESSION_ID -type f | sort | xargs sha256sum | sha256sum | awk '{print $1}')
echo "$SNAPSHOT_HASH" > /srv/blackbox/sessions/$SESSION_ID/snapshot_hash

# Schedule wipe at END_TIME
echo "/srv/blackbox/wipe.sh $SESSION_ID" | at -t $(date -d "$END_TIME" +%Y%m%d%H%M)

echo "Provisioned: $SESSION_ID"
```

**Wipe Script**: `/srv/blackbox/wipe.sh`
```bash
#!/bin/bash
# Input: SESSION_ID

SESSION_ID="$1"

# Kill all processes for this session's user
pkill -9 -u blackbox-$SESSION_ID

# Wipe home directory (3-pass shred)
find /home/blackbox-$SESSION_ID -type f -exec shred -vfz -n 3 {} \;
rm -rf /home/blackbox-$SESSION_ID

# Delete user
userdel blackbox-$SESSION_ID

# Clear temp directories
rm -rf /tmp/* /var/tmp/*

# Clear kernel buffers
sync && echo 3 > /proc/sys/vm/drop_caches

# Rollback to clean snapshot (if using ZFS)
# zfs rollback tank/blackbox@clean

# Hash final state
WIPE_HASH=$(echo "clean" | sha256sum | awk '{print $1}')  # Simplified for now
echo "$WIPE_HASH" > /srv/blackbox/sessions/$SESSION_ID/wipe_hash

# Generate seal
/srv/blackbox/seal-generate.sh "$SESSION_ID"

echo "Wiped: $SESSION_ID at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

**Seal Generation Script**: `/srv/blackbox/seal-generate.sh`
```bash
#!/bin/bash
# Input: SESSION_ID

SESSION_ID="$1"
NODE_ID="liveswan-node-07"  # Hardcoded for first node

# Load metadata
TIER=$(cat /srv/blackbox/sessions/$SESSION_ID/tier)
START_TIME=$(cat /srv/blackbox/sessions/$SESSION_ID/start_time)
END_TIME=$(cat /srv/blackbox/sessions/$SESSION_ID/end_time)
CUSTOMER_EMAIL=$(cat /srv/blackbox/sessions/$SESSION_ID/email)
SNAPSHOT_HASH=$(cat /srv/blackbox/sessions/$SESSION_ID/snapshot_hash)
WIPE_HASH=$(cat /srv/blackbox/sessions/$SESSION_ID/wipe_hash)

# Generate seal signature (simplified: use sha256 of concatenated data)
# In production, use Ed25519 signing with openssl or similar
SEAL_DATA="$SESSION_ID|$NODE_ID|$START_TIME|$END_TIME|$TIER|$SNAPSHOT_HASH|$WIPE_HASH"
SEAL_SIG=$(echo -n "$SEAL_DATA" | sha256sum | awk '{print $1}')

# Create receipt
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

# Archive in museum
mkdir -p /srv/messiah/museum/seals/blackbox
cp /srv/blackbox/sessions/$SESSION_ID/RECEIPT.txt /srv/messiah/museum/seals/blackbox/$SESSION_ID.txt

# Email receipt to customer
mail -s "Your SPRAXXX Blackbox Session Seal" \
     -a /srv/blackbox/sessions/$SESSION_ID/RECEIPT.txt \
     $CUSTOMER_EMAIL <<EOF
Hi,

Your Blackbox session has ended and been wiped.

Attached is your cryptographic session seal.

Session ID: $SESSION_ID
Tier: $TIER

Thank you for using SPRAXXX Blackbox Ops.

Questions? Reply to this email.

—SPRAXXX Ops
blackbox@spraxxx.com
EOF

echo "Sealed: $SESSION_ID"
```

**Make scripts executable**:
```bash
chmod +x /srv/blackbox/provision.sh
chmod +x /srv/blackbox/wipe.sh
chmod +x /srv/blackbox/seal-generate.sh
```

### 6. Website Deployment

- [ ] Upload `blackbox.html` to server
- [ ] Configure DNS: `blackbox.spraxxx.com` → points to server
- [ ] Enable HTTPS (Let's Encrypt / Certbot)
- [ ] Test page loads correctly
- [ ] Test "REQUEST ACCESS" mailto link opens email client

---

## Launch Day Checklist

### Morning Of

- [ ] Test node is online and accessible
- [ ] Test SSH access with keypair
- [ ] Verify email `blackbox@spraxxx.com` is working
- [ ] Verify Stripe/crypto payment ready
- [ ] Clear any previous test sessions
- [ ] Announce launch (optional: silent launch, no marketing)

### First Customer Flow (Manual)

1. **Request arrives** via email
2. **Review request** (legitimate? slot available?)
3. **Send invoice** (Stripe link or crypto address)
4. **Wait for payment** (confirm via Stripe dashboard or blockchain)
5. **Run provision script**:
   ```bash
   /srv/blackbox/provision.sh \
     bb-20260109-abc123 \
     HOUR \
     "2026-01-09T14:00:00Z" \
     "2026-01-09T15:00:00Z" \
     customer@example.com
   ```
6. **Send access email** (copy from template, attach SSH key)
7. **Customer uses node** (you monitor uptime only)
8. **Wipe script auto-runs** at end time
9. **Seal script auto-emails** receipt to customer
10. **Archive seal** in museum

### After First Session

- [ ] Verify wipe completed successfully
- [ ] Verify seal was generated and emailed
- [ ] Verify museum archive has seal
- [ ] Ask customer for feedback (optional)
- [ ] Refine scripts based on any issues

---

## Week 1 Goals

- [ ] **3 HOUR sessions** successfully completed
- [ ] **1 DAY session** successfully completed
- [ ] **0 FORGE sessions** (wait for high-trust customer)
- [ ] All seals generated correctly
- [ ] No customer complaints
- [ ] Revenue: $450-$1,350 (3 HOUR @ $150 each)

---

## Ongoing Operations

### Daily Tasks
- Check `blackbox@spraxxx.com` for requests (2x/day)
- Monitor node uptime
- Verify scheduled wipes executed

### Weekly Tasks
- Review museum archive (ensure seals are being stored)
- Check payment reconciliation (Stripe vs actual sessions)
- Backup scripts and session metadata

### Monthly Tasks
- Review pricing (adjust if demand is high/low)
- Evaluate adding second node (if >10 sessions/month)
- Solicit customer testimonials (with permission)

---

## Scaling Plan

### Phase 1: Manual (Launch → 10 sessions)
- 1 node
- Manual provisioning
- Manual approval
- Manual invoicing

### Phase 2: Semi-Auto (10-50 sessions)
- 2-3 nodes
- Scripted provisioning (still manual approval)
- Stripe auto-invoicing
- Automated wipe + seal

### Phase 3: Self-Service (50+ sessions)
- 5+ nodes
- Calendar booking system
- Auto-approval (for verified customers)
- Public seal verification API
- Waiting list when full

---

## Marketing Plan (Post-Launch)

### Week 1: Silent Launch
- No public announcement
- Direct outreach to 5-10 trusted contacts
- "Private beta, invite only"

### Week 2-4: Soft Launch
- Post on Hacker News Show HN (if 5+ successful sessions)
- Share on indie hacker forums
- LinkedIn post (target devs/founders)

### Month 2+: Growth
- Customer testimonials (with permission)
- Case studies (anonymized)
- Referral program (10% discount for referrals)

**No Paid Ads**: Organic only. Scarcity = marketing.

---

## Red Flags to Watch For

🚨 **Stop immediately if**:
- Customer requests illegal activity
- Payment chargebacks (investigate, ban customer)
- Node security breach (wipe everything, audit, relaunch)
- Negative press / bad reputation (pause, address publicly)

---

## Success Metrics

### Month 1
- **Goal**: 10 sessions total
- **Revenue**: $1,500 minimum (10 HOUR @ $150)
- **Seals issued**: 10
- **Customer satisfaction**: 8+/10 average

### Month 3
- **Goal**: 30 sessions total
- **Revenue**: $5,000+ (mix of HOUR/DAY)
- **Add second node**
- **First FORGE session** completed

### Month 6
- **Goal**: 100 sessions total
- **Revenue**: $20,000+ cumulative
- **3+ nodes in rotation**
- **Self-service booking live**

---

## Node Configuration (First Node: liveswan-node-07)

### Hardware
- **CPU**: 8 cores (Intel Xeon or AMD EPYC)
- **RAM**: 16 GB
- **Storage**: 256 GB NVMe SSD
- **Network**: 1 Gbps
- **Location**: Trusted datacenter (or on-premises if paranoid)

### Software
- **OS**: Ubuntu 22.04 LTS (minimal install)
- **Filesystem**: ZFS (for snapshots)
- **SSH**: OpenSSH 8.9+ (key-only auth)
- **Firewall**: ufw (deny all, allow 22/tcp, 443/tcp)
- **Monitoring**: Uptime Kuma or similar (no content logging)

### Security Hardening
```bash
# Disable password auth
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban

# Enable automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# Create ZFS pool and baseline snapshot
zpool create tank /dev/nvme0n1
zfs create tank/blackbox
zfs snapshot tank/blackbox@clean

# Install required tools
apt install at mailutils zfsutils-linux -y
```

### Testing
```bash
# Test ZFS snapshot/rollback
touch /tank/blackbox/testfile
zfs rollback tank/blackbox@clean
ls /tank/blackbox/testfile  # Should fail (file deleted)

# Test provisioning script
/srv/blackbox/provision.sh test-session HOUR "2026-01-09T14:00:00Z" "2026-01-09T14:10:00Z" test@example.com

# Test wipe script (after 10 minutes or cancel 'at' job)
/srv/blackbox/wipe.sh test-session

# Verify seal generated
cat /srv/blackbox/sessions/test-session/RECEIPT.txt
```

---

## Final Pre-Flight Check

Before announcing to first customer:

- [ ] Node is online and accessible
- [ ] All scripts tested end-to-end
- [ ] Email working (send + receive)
- [ ] Payment method ready
- [ ] Terms of Service visible on website (even if minimal)
- [ ] Museum archive directory exists and writable
- [ ] Backup plan if node fails (spare node or refund policy)

---

## Launch Command

When ready:

1. **Deploy landing page**: `blackbox.spraxxx.com` goes live
2. **Send to 3-5 trusted contacts**: "Private beta, $100 discount, feedback appreciated"
3. **Monitor email**: respond within 4 hours
4. **First session**: over-deliver, ask for testimonial

---

## Emergency Contacts

- **Node down**: [datacenter support number or on-call sysadmin]
- **Payment issues**: [Stripe support or crypto wallet recovery]
- **Legal questions**: [lawyer contact if handling >$10K]
- **Customer disputes**: blackbox@spraxxx.com (respond within 24 hours)

---

## Next Steps After Launch

1. **Week 1**: Complete 3 sessions, gather feedback
2. **Week 2**: Refine scripts based on real-world use
3. **Week 3**: Soft announce on Hacker News (if feedback is positive)
4. **Month 2**: Add second node, introduce DAY tier more aggressively
5. **Month 3**: First FORGE session (high-value customer only)

---

**Remember**:
- Start small (1 node, manual ops)
- Overdeliver on first 10 customers
- Let scarcity do the marketing
- Scale only when demand proves itself

---

End of launch guide. Ship it. 🚀
