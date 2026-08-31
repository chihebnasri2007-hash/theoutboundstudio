/* ==========================================================================
   THE OUTBOUND STUDIO — SCRIPT
   Handles: sticky nav state, mobile menu, scroll reveals,
   FAQ accordion, metric counters. No dependencies.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Sticky nav background on scroll
     --------------------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const setNavState = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  setNavState();
  window.addEventListener('scroll', setNavState, { passive: true });

  /* ---------------------------------------------------------------------
     Mobile menu toggle
     --------------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  const toggleMobileMenu = () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };

  navToggle.addEventListener('click', toggleMobileMenu);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ---------------------------------------------------------------------
     Scroll reveal animations
     --------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.section-title, .section-sub, .problem-card, .step, .service-card, .metric-card, .compare-col, .faq-item'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach((question) => {
    const answer = question.nextElementSibling;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all other items
      faqQuestions.forEach((otherQuestion) => {
        if (otherQuestion !== question) {
          otherQuestion.setAttribute('aria-expanded', 'false');
          otherQuestion.nextElementSibling.style.maxHeight = null;
        }
      });

      // Toggle current item
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });

  /* ---------------------------------------------------------------------
     Metric counter animation
     --------------------------------------------------------------------- */
  const metricValues = document.querySelectorAll('.metric-value[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const originalText = el.textContent.trim();
    const digitCount = originalText.replace(/[^0]/g, '').length || String(target).length;

    if (prefersReducedMotion || target === 0) {
      return; // keep placeholder text as-is
    }

    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${String(value).padStart(digitCount, '0')}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (metricValues.length && 'IntersectionObserver' in window) {
    const metricObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            metricObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    metricValues.forEach((el) => metricObserver.observe(el));
  }

  /* ---------------------------------------------------------------------
     Close mobile menu on resize to desktop width
     --------------------------------------------------------------------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobileMenu();
  });
});
