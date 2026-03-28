/* ============================================================
   HOME.JS — Matrix rain, TypeWriter, animated counters,
             quick-card hover glow
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════════════════
     1. MATRIX RAIN CANVAS
  ══════════════════════════════════════════════════════════ */
  (function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Character set: binary digits
    const CHARS = '01';

    const FONT_SIZE   = 14;
    const COLOR_HEAD  = '#ffffff';   // bright white for leading char
    const COLOR_TRAIL = '#b0b0b0';   // lighter gray for trail

    let columns = [];
    let animFrame;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      const colCount = Math.floor(canvas.width / FONT_SIZE);

      // Re-initialise columns (preserve existing where possible)
      columns = [];
      for (let i = 0; i < colCount; i++) {
        columns.push({
          y: Math.random() * -(canvas.height / FONT_SIZE) // start above viewport
        });
      }
    }

    function drawFrame() {
      // Semi-transparent black overlay creates the fade/trail effect
      ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = FONT_SIZE + 'px "JetBrains Mono", monospace';

      columns.forEach(function (col, i) {
        const x = i * FONT_SIZE;
        const y = col.y * FONT_SIZE;

        // Draw the leading (bright) character
        ctx.fillStyle = COLOR_HEAD;
        const headChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(headChar, x, y);

        // Draw a trail character slightly behind
        if (col.y > 1) {
          ctx.fillStyle = COLOR_TRAIL;
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(trailChar, x, y - FONT_SIZE);
        }

        // Advance column down
        col.y += 10;

        // Reset column when it goes off-screen (random chance for variety)
        if (y > canvas.height && Math.random() > 0.975) {
          col.y = -Math.floor(Math.random() * 20);
        }
      });

      animFrame = requestAnimationFrame(drawFrame);
    }

    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animFrame);
        resize();
        drawFrame();
      }, 200);
    });

    // Initialise
    resize();
    drawFrame();
  })();


  /* ══════════════════════════════════════════════════════════
     2. TYPEWRITER — Hero subtitle
  ══════════════════════════════════════════════════════════ */
  (function initTypeWriter() {
    const el = document.getElementById('typed-text');
    if (!el) return;

    const WORDS = [
      'Développeur Web Full Stack',
      'Étudiant en Cybersécurité',
      'Passionné d\'informatique',
      'CTF Player & Researcher',
      'Apprenant sur TryHackMe'
    ];

    const SPEED_TYPE   = 80;   // ms per character typed
    const SPEED_DELETE = 40;   // ms per character deleted
    const PAUSE_END    = 2000; // ms pause at end of word
    const PAUSE_START  = 300;  // ms pause before typing next word

    let wordIdx   = 0;
    let charIdx   = 0;
    let deleting  = false;

    function tick() {
      const word = WORDS[wordIdx];

      if (deleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      el.textContent = word.substring(0, charIdx);

      let delay = deleting ? SPEED_DELETE : SPEED_TYPE;

      if (!deleting && charIdx === word.length) {
        // Finished typing — pause then start deleting
        delay    = PAUSE_END;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        // Finished deleting — move to next word
        deleting = false;
        wordIdx  = (wordIdx + 1) % WORDS.length;
        delay    = PAUSE_START;
      }

      setTimeout(tick, delay);
    }

    // Small initial delay so the page feels settled before typing starts
    setTimeout(tick, 600);
  })();


  /* ══════════════════════════════════════════════════════════
     3. ANIMATED COUNTERS
  ══════════════════════════════════════════════════════════ */
  (function initCounters() {
    const DURATION = 2000; // ms

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounter(el) {
      const raw    = el.getAttribute('data-target') || '0';
      const target = parseInt(raw, 10);
      const suffix = el.getAttribute('data-suffix') || '';

      if (isNaN(target)) return;

      const startTime = performance.now();

      function step(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased    = easeOutCubic(progress);
        const current  = Math.floor(eased * target);

        el.textContent = current + (progress >= 1 ? suffix : '');

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    statNumbers.forEach(function (el) {
      observer.observe(el);
    });
  })();


  /* ══════════════════════════════════════════════════════════
     4. QUICK CARDS — hover glow effect
  ══════════════════════════════════════════════════════════ */
  (function initQuickCards() {
    const cards = document.querySelectorAll('.quick-card');

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add('glow');
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('glow');
      });
    });
  })();

});
