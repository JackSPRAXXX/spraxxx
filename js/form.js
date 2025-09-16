// js/form.js
(function () {
  const form = document.getElementById('email-form');
  if (!form) return;

  const msg  = document.getElementById('form-msg');
  const btn  = document.getElementById('email-submit');
  const email = document.getElementById('email');
  const honeypot = document.getElementById('company');

  function say(text, ok=false){
    msg.textContent = text;
    msg.className = ok ? 'ok' : 'err';
  }

  function validEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (honeypot && honeypot.value.trim() !== '') {
      form.reset();
      say('Thanks! You’re on the list.', true);
      return;
    }

    const value = (email?.value || '').trim();
    if (!validEmail(value)){
      say('Please enter a valid email address.');
      email?.focus();
      return;
    }

    btn.disabled = true;
    say('Submitting…');

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok){
        form.reset();
        say('Got it! Check your inbox for confirmation.', true);
      } else {
        let detail = '';
        try { detail = (await res.json())?.error || ''; } catch {}
        say(detail || 'Something went wrong. Please try again.');
      }
    } catch {
      say('Network error. Try again later.');
    } finally {
      btn.disabled = false;
    }
  });
})();
