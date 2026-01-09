/**
 * SPRAXXX Hub - Contact Form Handler
 * Cloudflare Worker for processing contact form submissions
 *
 * Deploy to: /api/contact
 * Sends emails via MailChannels (free on Cloudflare Workers)
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      // Parse form data
      const data = await request.json();

      // Validate required fields
      if (!data.name || !data.email || !data.service) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
          }
        });
      }

      // Validate email format
      if (!isValidEmail(data.email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
          }
        });
      }

      // Send email via MailChannels
      const emailSent = await sendEmail(data);

      if (emailSent) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
          }
        });
      } else {
        throw new Error('Email sending failed');
      }

    } catch (error) {
      console.error('Contact form error:', error);

      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        }
      });
    }
  }
};

/**
 * Send email via MailChannels
 * MailChannels is free for Cloudflare Workers
 */
async function sendEmail(data) {
  const emailContent = `
New Contact Request from SPRAXXX Hub
=====================================

Name: ${data.name}
Email: ${data.email}
Service: ${data.service}
Timestamp: ${data.timestamp}
Source: ${data.source}

Message:
${data.message || '(No message provided)'}

=====================================
Reply to: ${data.email}
  `.trim();

  const emailPayload = {
    personalizations: [
      {
        to: [{ email: 'hello@spraxxx.com', name: 'SPRAXXX Team' }],
        reply_to: { email: data.email, name: data.name }
      }
    ],
    from: {
      email: 'noreply@spraxxx.com',
      name: 'SPRAXXX Hub'
    },
    subject: `[SPRAXXX] Contact Request: ${data.service}`,
    content: [
      {
        type: 'text/plain',
        value: emailContent
      }
    ]
  };

  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    return response.ok;
  } catch (error) {
    console.error('MailChannels error:', error);
    return false;
  }
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}
