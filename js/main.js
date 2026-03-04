/**
 * Fundacja Biegusiem — main.js
 * Interakcje: nawigacja, reveal animacje, licznik,
 * przycisk scroll-to-top, formularz kontaktowy.
 */

'use strict';

/* ============================================================
   UTILITY
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   1. NAWIGACJA — sticky + mobile toggle
   ============================================================ */
(function initNav() {
  const header  = $('#site-header');
  const toggle  = $('#nav-toggle');
  const menu    = $('#nav-menu');
  const navLinks = $$('.nav__link', menu);

  if (!header || !toggle || !menu) return;

  /* Sticky shadow on scroll */
  const handleScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  /* Mobile toggle */
  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  /* Close on nav link click */
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Active link highlight on scroll */
  const sections = $$('section[id]');

  const updateActiveLink = () => {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let activeId = null;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid) activeId = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav__link--active', href === `#${activeId}`);
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();


/* ============================================================
   2. SCROLL REVEAL (Intersection Observer)
   ============================================================ */
(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. LICZNIK ANIMOWANY (Impact numbers)
   ============================================================ */
(function initCounters() {
  const counters = $$('.liczby__number[data-target]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1800; // ms
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.floor(easeOut(progress) * target);

      el.textContent = value.toLocaleString('pl-PL') + suffix;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. SCROLL TO TOP
   ============================================================ */
(function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;

  const toggle = () => {
    const show = window.scrollY > 400;
    btn.hidden = !show;
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   5. DONATION AMOUNT BUTTONS
   ============================================================ */
(function initAmountButtons() {
  const buttons = $$('.amount-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('amount-btn--active'));
      btn.classList.add('amount-btn--active');

      if (btn.dataset.amount === 'custom') {
        // Could open a custom input field in a real implementation
        btn.textContent = 'Inna kwota ✎';
      }
    });
  });
})();


/* ============================================================
   6. FORMULARZ KONTAKTOWY — walidacja
   ============================================================ */
(function initContactForm() {
  const form = $('.kontakt__form');
  if (!form) return;

  const showError = (input, msg) => {
    let errEl = input.parentElement.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error';
      errEl.style.cssText = 'color:#DD2C88;font-size:0.78rem;margin-top:0.25rem;';
      input.parentElement.appendChild(errEl);
    }
    errEl.textContent = msg;
    input.style.borderColor = '#DD2C88';
  };

  const clearError = (input) => {
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) errEl.remove();
    input.style.borderColor = '';
  };

  const validateField = (input) => {
    clearError(input);

    if (input.required && !input.value.trim()) {
      showError(input, 'To pole jest wymagane.');
      return false;
    }

    if (input.type === 'email' && input.value.trim()) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) {
        showError(input, 'Podaj poprawny adres e-mail.');
        return false;
      }
    }

    return true;
  };

  /* Real-time validation on blur */
  $$('.form-input', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearError(input));
  });

  /* Submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = $$('.form-input[required]', form);
    let valid = true;

    inputs.forEach(input => {
      if (!validateField(input)) valid = false;
    });

    if (!valid) return;

    /* Simulate send (replace with real fetch/API call) */
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie…';

    setTimeout(() => {
      form.innerHTML = `
        <div style="
          text-align:center;
          padding:3rem 1rem;
          animation: fadeIn .5s ease;
        ">
          <div style="
            font-size:3rem;
            margin-bottom:1rem;
            animation: bounceIn .6s cubic-bezier(.34,1.56,.64,1);
          ">💌</div>
          <h3 style="
            font-family:var(--font-heading);
            font-size:1.5rem;
            margin-bottom:.75rem;
            color:var(--color-black);
          ">Wiadomość wysłana!</h3>
          <p style="color:var(--color-gray-text);max-width:38ch;margin:0 auto;">
            Dziękujemy za kontakt. Odpiszemy najszybciej jak to możliwe — zazwyczaj w ciągu 48 godzin.
          </p>
        </div>
      `;
    }, 1400);
  });
})();


/* ============================================================
   7. HERO — entrance animations (CSS fallback polyfill)
   ============================================================ */
(function initHeroEntrance() {
  const text = $('.hero__text');
  if (!text) return;

  // Add entrance classes after a tiny delay to ensure paint
  requestAnimationFrame(() => {
    text.style.animation = 'heroTextEntrance 0.7s cubic-bezier(.25,.46,.45,.94) 0.1s both';
  });

  // Inject keyframe if not already present
  if (!document.querySelector('#hero-keyframe-style')) {
    const style = document.createElement('style');
    style.id = 'hero-keyframe-style';
    style.textContent = `
      @keyframes heroTextEntrance {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes bounceIn {
        from { transform: scale(0.5); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      /* Active nav link */
      .nav__link--active {
        color: var(--color-prancing-pony) !important;
        background: var(--color-soft-rose) !important;
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ============================================================
   8. SMOOTH SCROLL dla wewnętrznych linków (fallback)
   ============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without scroll jump
      history.pushState(null, '', `#${id}`);
    });
  });
})();
