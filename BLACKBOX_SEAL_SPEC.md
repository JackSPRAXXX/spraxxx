# SPRAXXX Blackbox Ops — Cryptographic Session Seal Specification

## Purpose

Every Blackbox session receives a tamper-proof cryptographic seal that proves:
1. The session existed
2. The session was wiped clean
3. No content was logged or retained

This seal is **NOT** a record of what happened—it's proof that privacy was maintained.

---

## Seal Components

Each seal contains:

```
SESSION_ID:      Unique identifier for this session
NODE_ID:         Which physical/virtual node was used
START_TIME:      ISO 8601 timestamp (UTC) when session began
END_TIME:        ISO 8601 timestamp (UTC) when session ended
TIER:            HOUR | DAY | FORGE
SNAPSHOT_HASH:   SHA-256 of initial node state (before customer access)
WIPE_HASH:       SHA-256 of final node state (after wipe, before reuse)
SEAL_SIGNATURE:  Ed25519 signature of above fields using SPRAXXX private key
```

---

## What Gets Hashed

**Initial Snapshot** (before customer touches it):
- Filesystem state hash (content-blind, metadata only)
- Running process count
- Network interface state
- Timestamp of snapshot

**Final Wipe** (after customer session ends):
- Same metrics as initial snapshot
- Must match clean baseline or seal notes discrepancy

**What Does NOT Get Hashed**:
- Customer files
- Command history
- Network traffic
- Process names
- Any customer data

---

## Seal Format

### Human-Readable Receipt (Customer Receives This)

```
SPRAXXX BLACKBOX SESSION SEAL
═══════════════════════════════════════════

Session ID:    bb-20260109-a3f7c2
Node ID:       liveswan-node-07
Tier:          HOUR
Started:       2026-01-09T14:00:00Z
Ended:         2026-01-09T15:00:00Z
Duration:      60 minutes

Snapshot Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Wipe Hash:     e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

Seal Signature:
4a7b3c9d2e8f1a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b

Verified by:   SPRAXXX Ops (seal@spraxxx.com)
Receipt Date:  2026-01-09T15:01:23Z

═══════════════════════════════════════════
This seal proves the session existed and was wiped.
No customer data was logged or retained.
Verify at: https://spraxxx.com/seal/verify
```

---

## Machine-Readable Format (Stored in Museum)

```json
{
  "seal_version": "1.0",
  "session_id": "bb-20260109-a3f7c2",
  "node_id": "liveswan-node-07",
  "tier": "HOUR",
  "start_time": "2026-01-09T14:00:00Z",
  "end_time": "2026-01-09T15:00:00Z",
  "duration_seconds": 3600,
  "snapshot_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "wipe_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "seal_signature": "4a7b3c9d2e8f1a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
  "sealed_at": "2026-01-09T15:01:23Z",
  "spraxxx_public_key": "0x..."
}
```

---

## Wipe Ritual

After session ends:

1. **Kill all customer processes** (SIGKILL, no grace period)
2. **Wipe /home, /tmp, /var/tmp** (shred or zfs destroy → recreate)
3. **Clear kernel buffers** (sync; echo 3 > /proc/sys/vm/drop_caches)
4. **Reset network state** (flush iptables, restart interfaces)
5. **Restore from baseline snapshot** (zfs rollback or equivalent)
6. **Hash final state** → compare to clean baseline
7. **Generate seal** → sign with SPRAXXX private key
8. **Send receipt to customer** (email + downloadable .txt)
9. **Archive seal in museum** (immutable log, never deleted)

---

## Verification

Customers can verify their seal at:

**https://spraxxx.com/seal/verify**

Enter session ID → system returns:
- Seal signature (proves SPRAXXX issued it)
- Start/end times
- Wipe confirmation
- **Does NOT reveal any session content**

---

## Trust Model

**What customers trust**:
- SPRAXXX wiped the node (provable via wipe hash)
- No logs were kept (design guarantee, not provable)
- Seal is authentic (Ed25519 signature)

**What customers CANNOT verify**:
- Whether we secretly copied data before wiping (requires trust)
- Whether node was truly isolated (physical security model)

**Why this matters**:
- Most competitors don't even commit to wiping
- Most competitors retain logs "for security"
- This seal is **stronger than industry standard**, even if not perfect

---

## Storage

**Customer receives**:
- Plain text receipt (email)
- Downloadable .txt file (linked in email)

**Museum archives**:
- JSON seal (stored in `/srv/messiah/museum/seals/blackbox/`)
- Immutable append-only log
- Never deleted (proof of wipe history)

---

## Launch Implementation

**Phase 1** (Manual):
- Generate seals by hand after each session
- Email receipts manually
- Store JSON in git-tracked folder

**Phase 2** (Automated):
- Seal generation script runs on session end
- Auto-email receipt
- Auto-archive to museum

**Phase 3** (Verifiable):
- Public verification endpoint
- Customer can check seal authenticity
- Blockchain/IPFS anchoring (optional, for extra paranoia)

---

## Legal Note

This seal is **proof of process**, not proof of absolute security.

We commit to:
- Wiping nodes after every session
- Not logging customer content
- Providing cryptographic proof of wipe

We do NOT guarantee:
- Physical security of hardware (datacenters can be compromised)
- Nation-state level threats (if NSA wants your data, they'll get it)
- Bugs in wipe implementation (we're human)

**Use Blackbox for operational privacy, not life-or-death secrecy.**

---

End of spec.
