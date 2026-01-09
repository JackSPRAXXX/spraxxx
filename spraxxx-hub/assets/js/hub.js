/* ============================================
   SPRAXXX Hub - Interactive Logic
   ============================================ */

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Initialize mobile navigation
  initializeMobileNav();

  // Initialize smooth scrolling
  initializeSmoothScroll();

  // Initialize contact form
  initializeContactForm();

  // Initialize sticky nav
  initializeStickyNav();
});

// ===== MOBILE NAVIGATION =====
function initializeMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';

    if (!isOpen) {
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '64px';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = 'rgba(0, 0, 0, 0.98)';
      nav.style.padding = '20px';
      nav.style.borderTop = '1px solid #222';
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      if (window.innerWidth <= 768) {
        nav.style.display = 'none';
      }
    }
  });

  // Close menu on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.style.display = 'flex';
      nav.style.position = 'static';
      nav.style.flexDirection = 'row';
    } else {
      nav.style.display = 'none';
    }
  });
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip empty anchors
      if (href === '#') {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.main-nav').offsetHeight;
        const targetPosition = target.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
          const nav = document.querySelector('.nav-links');
          if (nav) nav.style.display = 'none';
        }
      }
    });
  });
}

// ===== STICKY NAVIGATION =====
function initializeStickyNav() {
  const nav = document.querySelector('.main-nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 10) {
      nav.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    } else {
      nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });
}

// ===== CONTACT FORM =====
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    const originalButtonText = button.textContent;

    // Hide previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    // Update button state
    button.textContent = 'SENDING...';
    button.disabled = true;

    // Collect form data
    const formData = {
      name: form.querySelector('#name').value,
      email: form.querySelector('#email').value,
      service: form.querySelector('#service').value,
      message: form.querySelector('#message').value,
      timestamp: new Date().toISOString(),
      source: 'spraxxx-hub'
    };

    try {
      // Send to Cloudflare Worker
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Success
        successMessage.style.display = 'block';
        form.reset();

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Track success (privacy-first)
        trackEvent('contact_form_success', { service: formData.service });
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      // Error
      console.error('Form submission error:', error);
      errorMessage.style.display = 'block';

      // Track error
      trackEvent('contact_form_error', { error: error.message });
    } finally {
      // Reset button
      button.textContent = originalButtonText;
      button.disabled = false;
    }
  });
}

// ===== ANALYTICS PLACEHOLDER =====
/**
 * Privacy-first event tracking
 * Currently logs to console only
 * Can be upgraded to Plausible, Simple Analytics, or self-hosted Umami
 */
function trackEvent(eventName, data = {}) {
  console.log(`[Analytics] ${eventName}`, data);

  // Future: Send to privacy-respecting analytics
  // Example with Plausible:
  // if (window.plausible) {
  //   window.plausible(eventName, { props: data });
  // }
}

// Track service card clicks
document.addEventListener('click', (e) => {
  const card = e.target.closest('.service-card');
  if (card) {
    const serviceName = card.querySelector('h3')?.textContent;
    const status = card.getAttribute('data-status');
    trackEvent('service_card_click', { service: serviceName, status });
  }
});

// Track CTA clicks
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn')) {
    const buttonText = e.target.textContent;
    const buttonType = e.target.classList.contains('btn-primary') ? 'primary' : 'secondary';
    trackEvent('cta_click', { text: buttonText, type: buttonType });
  }
});

// ===== SERVICE WORKER (Optional, for PWA) =====
/**
 * Uncomment to enable Progressive Web App features
 */
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(reg => console.log('Service Worker registered:', reg))
//       .catch(err => console.log('Service Worker registration failed:', err));
//   });
// }
