/* ============================================================
   CONTACT.JS — Form validation + Formspree submission
   ============================================================
   HOW TO CONFIGURE FORMSPREE:
   1. Go to https://formspree.io and create a free account.
   2. Create a new form for your email address.
   3. Copy the form endpoint URL (e.g. https://formspree.io/f/abcdefgh).
   4. Replace the FORMSPREE_ENDPOINT value below with your actual URL.
   ============================================================ */

(function () {
  'use strict';

  /* ── Formspree endpoint — REPLACE with your own ─────────── */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgopoero';

  /* ── Email regex ─────────────────────────────────────────── */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ── Field validation rules ──────────────────────────────── */
  const RULES = {
    fname:   { required: true, minLen: 2,  label: 'Prénom' },
    lname:   { required: true, minLen: 2,  label: 'Nom' },
    email:   { required: true, email: true, label: 'Email' },
    subject: { required: true, minLen: 3,  label: 'Sujet' },
    message: { required: true, minLen: 10, label: 'Message' },
  };

  /* ── Validate a single field; returns error string or null ─ */
  function validateField(id) {
    const rule  = RULES[id];
    if (!rule) return null;

    const el    = document.getElementById(id);
    const value = el ? el.value.trim() : '';

    if (rule.required && !value) {
      return `${rule.label} est requis.`;
    }
    if (rule.minLen && value.length < rule.minLen) {
      return `${rule.label} doit contenir au moins ${rule.minLen} caractères.`;
    }
    if (rule.email && !EMAIL_RE.test(value)) {
      return 'Adresse email invalide.';
    }
    return null;
  }

  /* ── Show / clear error for a field ─────────────────────── */
  function showError(id, message) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`${id}_error`);
    if (input)  input.classList.add('error');
    if (errEl)  { errEl.textContent = message; errEl.classList.add('visible'); }
  }

  function clearError(id) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`${id}_error`);
    if (input)  input.classList.remove('error');
    if (errEl)  { errEl.textContent = ''; errEl.classList.remove('visible'); }
  }

  /* ── Validate entire form; returns true if valid ─────────── */
  function validateForm() {
    let valid = true;
    Object.keys(RULES).forEach(id => {
      const err = validateField(id);
      if (err) { showError(id, err); valid = false; }
      else       clearError(id);
    });
    return valid;
  }

  /* ── Set loading state on submit button ──────────────────── */
  function setLoading(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="btn-spinner"></span> Envoi en cours...';
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || 'Envoyer le message';
    }
  }

  /* ── Show form status message ────────────────────────────── */
  function showStatus(el, type, message) {
    el.className = `form-status ${type}`;
    el.textContent = message;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── DOMContentLoaded ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const form       = document.getElementById('contactForm');
    const submitBtn  = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (!form) return;

    /* Real-time validation on blur */
    Object.keys(RULES).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () {
        const err = validateField(id);
        if (err) showError(id, err);
        else     clearError(id);
      });
      /* Clear error on input once touched */
      el.addEventListener('input', function () {
        if (el.classList.contains('error')) {
          const err = validateField(id);
          if (!err) clearError(id);
        }
      });
    });

    /* Form submit handler */
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      /* Honeypot check — silently abort if bot filled it */
      const hp = document.getElementById('hp_field');
      if (hp && hp.value) return;

      /* Validate */
      if (!validateForm()) return;

      setLoading(submitBtn, true);
      formStatus.className = 'form-status'; // reset

      const data = new FormData(form);

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method:  'POST',
          body:    data,
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          showStatus(
            formStatus,
            'success',
            '✓ Message envoyé avec succès ! Je vous répondrai dans les 48h.'
          );
          form.reset();
        } else {
          const json = await response.json().catch(() => ({}));
          const msg  = (json.errors && json.errors[0] && json.errors[0].message)
            ? json.errors[0].message
            : 'Une erreur est survenue. Veuillez réessayer.';
          showStatus(formStatus, 'error', msg);
        }
      } catch (_err) {
        showStatus(
          formStatus,
          'error',
          'Impossible d\'envoyer le message. Vérifiez votre connexion et réessayez.'
        );
      } finally {
        setLoading(submitBtn, false);
      }
    });
  });

})();
