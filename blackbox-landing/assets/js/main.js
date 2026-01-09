/* ============================================
   SPRAXXX Blackbox Ops - Interactive Logic
   ============================================ */

// ===== CONFIGURATION =====
// Node endpoints loaded from nodes.json
let nodeEndpoints = {};

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', async () => {
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Load node configuration
  await loadNodeConfig();

  // Initialize modal handlers
  initializeModal();

  // Initialize tier card click handlers
  initializeTierCards();
});

// ===== LOAD NODE CONFIGURATION =====
/**
 * Fetches node endpoints from nodes.json
 * Falls back to placeholder if file doesn't exist
 */
async function loadNodeConfig() {
  try {
    const response = await fetch('nodes.json');
    if (response.ok) {
      nodeEndpoints = await response.json();
      console.log('Node configuration loaded:', nodeEndpoints);
    } else {
      console.warn('nodes.json not found, using placeholder endpoints');
      nodeEndpoints = {
        liveswan: 'https://liveswan.spraxxx.com',
        angrywu: 'https://angrywu.spraxxx.com',
        sadblack: 'https://sadblack.spraxxx.com'
      };
    }
  } catch (error) {
    console.error('Error loading node config:', error);
    // Fallback to placeholder endpoints
    nodeEndpoints = {
      liveswan: 'https://liveswan.spraxxx.com',
      angrywu: 'https://angrywu.spraxxx.com',
      sadblack: 'https://sadblack.spraxxx.com'
    };
  }
}

// ===== INITIALIZE TIER CARDS =====
/**
 * Adds click handlers to all tier card buttons
 */
function initializeTierCards() {
  const ctaButtons = document.querySelectorAll('.cta-button');

  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click from firing
      const node = button.getAttribute('data-node');
      const card = button.closest('.node-card');
      const tier = card.getAttribute('data-tier');
      const price = card.getAttribute('data-price');

      openModal(node, tier, price);
    });
  });

  // Also make entire card clickable (alternative interaction)
  const cards = document.querySelectorAll('.node-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Only trigger if not clicking button directly
      if (!e.target.classList.contains('cta-button')) {
        const node = card.getAttribute('data-node');
        const tier = card.getAttribute('data-tier');
        const price = card.getAttribute('data-price');
        openModal(node, tier, price);
      }
    });
  });
}

// ===== INITIALIZE MODAL =====
/**
 * Sets up modal close handlers
 */
function initializeModal() {
  const modal = document.getElementById('modal');
  const closeButton = document.getElementById('modal-close');

  // Close on X button
  closeButton.addEventListener('click', closeModal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// ===== OPEN MODAL =====
/**
 * Opens reservation modal with node-specific information
 * @param {string} node - Node identifier (liveswan, angrywu, sadblack)
 * @param {string} tier - Tier name (HOUR, DAY, FORGE)
 * @param {string} price - Price string (e.g., "$150")
 */
function openModal(node, tier, price) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');

  // Get node endpoint (if configured)
  const nodeUrl = nodeEndpoints[node] || '#';

  // Node-specific details
  const nodeDetails = getNodeDetails(node, tier);

  // Generate modal content
  modalBody.innerHTML = `
    <h2>Reserve ${tier} Session</h2>

    <div class="modal-info">
      <p><strong>Node:</strong> ${nodeDetails.name}</p>
      <p><strong>Tier:</strong> ${tier}</p>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Duration:</strong> ${nodeDetails.duration}</p>
    </div>

    <p>To reserve this node:</p>

    <ol style="color: #aaa; padding-left: 20px; line-height: 1.8;">
      <li>Send email to <strong style="color: #00ff88;">blackbox@spraxxx.com</strong></li>
      <li>Include: Your name, preferred date/time, tier selection</li>
      <li>Payment method: Stripe invoice or crypto (BTC/ETH)</li>
      <li>You'll receive access credentials within 4 hours</li>
    </ol>

    <p style="margin-top: 20px; color: #888; font-size: 14px;">
      <strong>What you'll get:</strong><br>
      SSH private key, node IP/hostname, session timer, and cryptographic seal receipt after wipe.
    </p>

    ${nodeUrl !== '#' ? `
      <p style="margin-top: 15px; color: #888; font-size: 14px;">
        <strong>Node endpoint:</strong> <code style="color: #00ff88;">${nodeUrl}</code>
      </p>
    ` : ''}

    <a href="mailto:blackbox@spraxxx.com?subject=Blackbox%20${tier}%20Reservation&body=Name:%0D%0APreferred%20Date/Time:%0D%0ATier:%20${tier}%0D%0APayment%20Method:%20[Stripe/BTC/ETH]%0D%0A%0D%0AUse%20Case%20(1%20sentence):%0D%0A"
       class="email-cta">
      SEND RESERVATION REQUEST
    </a>
  `;

  // Show modal
  modal.classList.add('open');

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

// ===== CLOSE MODAL =====
/**
 * Closes the modal and restores page scroll
 */
function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== GET NODE DETAILS =====
/**
 * Returns node-specific details for display
 * @param {string} node - Node identifier
 * @param {string} tier - Tier name
 * @returns {object} Node details
 */
function getNodeDetails(node, tier) {
  const details = {
    liveswan: {
      name: 'LiveSwan Node',
      duration: '60 minutes'
    },
    angrywu: {
      name: 'AngryWu Node',
      duration: '8 hours'
    },
    sadblack: {
      name: 'SadBlack Forge Node',
      duration: '72 hours'
    }
  };

  return details[node] || {
    name: 'Unknown Node',
    duration: 'Variable'
  };
}

// ===== ANALYTICS PLACEHOLDER =====
/**
 * Placeholder for future analytics tracking
 * Currently logs to console (no external tracking)
 */
function trackEvent(eventName, data) {
  console.log(`[Analytics] ${eventName}`, data);
  // Future: Send to privacy-respecting analytics service
  // Example: plausible.io, Simple Analytics, or self-hosted Umami
}

// Track tier card clicks (optional, privacy-first)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('cta-button')) {
    const tier = e.target.closest('.node-card').getAttribute('data-tier');
    trackEvent('tier_click', { tier });
  }
});
