/* ============================================================
   MAIN.JS — Navigation, scroll effects, reveal animations,
   back-to-top, active link detection
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM Ready ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavbar();
    setupScrollReveal();
    setupBackToTop();
    setActiveNavLink();
    setupSmoothScroll();
  }

  /* ── Navbar: scroll blur + mobile toggle ─────────────────── */
  function setupNavbar() {
    const navbar   = document.getElementById('navbar');
    const toggle   = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navbar) return;

    // Scroll handler — add .scrolled class
    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // Mobile hamburger toggle
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
      });

      // Close nav when clicking a link
      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });

      // Close nav on outside click
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
          navLinks.classList.remove('open');
          toggle.classList.remove('open');
        }
      });
    }
  }

  /* ── Set active nav link based on current page ───────────── */
  function setActiveNavLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Scroll Reveal (Intersection Observer) ───────────────── */
  function setupScrollReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }

  /* ── Back To Top button ───────────────────────────────────── */
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Animate number counters ─────────────────────────────── */
  window.animateCounter = function (el, target, duration = 1600) {
    const start = 0;
    const startTime = performance.now();
    const suffix = el.dataset.suffix || '';

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ── Animate skill bars on scroll ───────────────────────── */
  window.initSkillBars = function () {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fill = entry.target;
            const value = fill.dataset.value || '0';
            fill.style.width = value + '%';
            observer.unobserve(fill);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach(b => observer.observe(b));
  };

  /* ── Star rating renderer ─────────────────────────────────── */
  window.renderStars = function (rating, max = 5) {
    let html = '<div class="stars">';
    for (let i = 1; i <= max; i++) {
      html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return html + '</div>';
  };

  /* ── Typed text utility (simple) ─────────────────────────── */
  window.TypeWriter = class {
    constructor(el, words, speed = 90, pause = 1800) {
      this.el    = el;
      this.words = words;
      this.speed = speed;
      this.pause = pause;
      this.wordIdx = 0;
      this.charIdx = 0;
      this.deleting = false;
      this.type();
    }
    type() {
      const word = this.words[this.wordIdx];
      if (this.deleting) {
        this.charIdx--;
      } else {
        this.charIdx++;
      }
      this.el.textContent = word.substring(0, this.charIdx);

      let delay = this.deleting ? this.speed / 2 : this.speed;

      if (!this.deleting && this.charIdx === word.length) {
        delay = this.pause;
        this.deleting = true;
      } else if (this.deleting && this.charIdx === 0) {
        this.deleting = false;
        this.wordIdx  = (this.wordIdx + 1) % this.words.length;
        delay = 300;
      }
      setTimeout(() => this.type(), delay);
    }
  };

  /* ── Toast notification ───────────────────────────────────── */
  window.showToast = function (msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        z-index: 9999; display: flex; flex-direction: column; gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = { success: '#39d353', error: '#ff4757', info: '#00d4ff' };
    toast.style.cssText = `
      background: rgba(13,17,23,0.95); border: 1px solid ${colors[type]};
      color: #e6edf3; padding: 12px 24px; border-radius: 10px;
      font-size: 0.9rem; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      pointer-events: all; animation: fadeUp 0.3s ease;
      backdrop-filter: blur(12px);
    `;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

})();
