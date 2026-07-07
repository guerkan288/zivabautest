// Scroll progress bar
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    if (!progressBar) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function closeMenu(){
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Count-up stats
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el){
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1100;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const statsIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); statsIo.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statsIo.observe(el));
  } else {
    statNums.forEach(el => el.textContent = el.getAttribute('data-count'));
  }

  // Tabs
  const tabNav = document.getElementById('tabNav');
  const tabIndicator = document.getElementById('tabIndicator');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function moveIndicator(btn){
    if (!btn || !tabIndicator) return;
    tabIndicator.style.width = btn.offsetWidth + 'px';
    tabIndicator.style.left = btn.offsetLeft + 'px';
  }
  function activateTab(name){
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    tabPanels.forEach(p => {
      const match = p.dataset.panel === name;
      p.classList.toggle('active', match);
      if (match) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (activeBtn) moveIndicator(activeBtn);
  }
  tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
  document.querySelectorAll('.mini-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activateTab(pill.dataset.tab);
      document.getElementById('leistungen').scrollIntoView({ behavior: 'smooth' });
    });
  });
  window.addEventListener('resize', () => {
    const active = document.querySelector('.tab-btn.active');
    if (active) moveIndicator(active);
  });
  window.addEventListener('load', () => moveIndicator(document.querySelector('.tab-btn.active')));

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  function handleSubmit(e){
    e.preventDefault();
    const status = document.getElementById('form-status');
    status.textContent = 'Danke! Ihre Anfrage wurde übermittelt — wir melden uns in Kürze.';
    e.target.reset();
    return false;
  }
  // ===================================================================
  // COOKIE-CONSENT / EXTERNE SCHRIFTARTEN (Google Fonts)
  // -------------------------------------------------------------------
  // Diese Website setzt von sich aus KEINE Cookies und lädt ohne
  // Zustimmung KEINE Inhalte von Drittanbietern nach. Die einzige
  // optionale Komponente sind die Google-Schriftarten (Bricolage
  // Grotesque, Plus Jakarta Sans, IBM Plex Mono). Werden sie geladen,
  // baut der Browser eine Verbindung zu Google-Servern auf und übermittelt
  // dabei automatisch die IP-Adresse — deshalb fragen wir vorher nach.
  // Die Zustimmungs-Entscheidung selbst wird technisch notwendig in
  // localStorage gespeichert (kein Consent dafür nötig, siehe Datenschutz-
  // erklärung Abschnitt "Cookies & lokaler Speicher").
  // ===================================================================
  (function () {
    const STORAGE_KEY = 'ziva-bau-cookie-consent';
    const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';

    const banner = document.getElementById('cookieBanner');
    const modalOverlay = document.getElementById('cookieModalOverlay');
    const fontsToggle = document.getElementById('cookieFontsToggle');
    if (!banner) return; // Banner-Markup nicht vorhanden (z. B. ältere Seite ohne Cookie-UI)

    function readConsent() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null; // z. B. privater Modus ohne Storage-Zugriff -> Banner erscheint erneut
      }
    }

    function writeConsent(consent) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (err) { /* Storage nicht verfügbar - Wahl gilt nur für diesen Seitenaufruf */ }
    }

    function loadGoogleFonts() {
      if (document.getElementById('googleFontsLink')) return; // schon geladen
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      const link = document.createElement('link');
      link.id = 'googleFontsLink';
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(preconnect1);
      document.head.appendChild(preconnect2);
      document.head.appendChild(link);

      // Google-Font-Namen VOR den System-Stack setzen
      const root = document.documentElement.style;
      root.setProperty('--font-body', "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      root.setProperty('--font-heading', "'Bricolage Grotesque', Georgia, sans-serif");
      root.setProperty('--font-mono', "'IBM Plex Mono', ui-monospace, SFMono-Regular, Consolas, monospace");
    }

    function applyConsent(consent) {
      if (consent && consent.fonts) loadGoogleFonts();
      if (fontsToggle) fontsToggle.checked = !!(consent && consent.fonts);
    }

    function showBanner() { banner.classList.add('is-visible'); }
    function hideBanner() { banner.classList.remove('is-visible'); }
    function showModal() { if (modalOverlay) modalOverlay.classList.add('is-visible'); }
    function hideModal() { if (modalOverlay) modalOverlay.classList.remove('is-visible'); }

    function saveAndApply(fontsAllowed) {
      const consent = { fonts: fontsAllowed, date: new Date().toISOString() };
      writeConsent(consent);
      applyConsent(consent);
      hideBanner();
      hideModal();
    }

    // Buttons im Banner
    const btnAcceptAll = document.getElementById('cookieAcceptAll');
    const btnRejectAll = document.getElementById('cookieRejectAll');
    const btnSettings = document.getElementById('cookieOpenSettings');
    if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => saveAndApply(true));
    if (btnRejectAll) btnRejectAll.addEventListener('click', () => saveAndApply(false));
    if (btnSettings) btnSettings.addEventListener('click', () => { hideBanner(); showModal(); });

    // Buttons im Einstellungen-Modal
    const btnModalSave = document.getElementById('cookieModalSave');
    const btnModalAcceptAll = document.getElementById('cookieModalAcceptAll');
    const btnModalClose = document.getElementById('cookieModalClose');
    if (btnModalSave) btnModalSave.addEventListener('click', () => saveAndApply(!!(fontsToggle && fontsToggle.checked)));
    if (btnModalAcceptAll) btnModalAcceptAll.addEventListener('click', () => saveAndApply(true));
    if (btnModalClose) btnModalClose.addEventListener('click', hideModal);
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

    // Footer-Link "Cookie-Einstellungen" -> Modal jederzeit wieder öffnen
    document.querySelectorAll('[data-open-cookie-settings]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const existing = readConsent();
        if (fontsToggle) fontsToggle.checked = !!(existing && existing.fonts);
        showModal();
      });
    });

    // Beim Laden: gespeicherte Wahl anwenden, sonst Banner zeigen
    const existingConsent = readConsent();
    if (existingConsent) {
      applyConsent(existingConsent);
    } else {
      window.addEventListener('load', () => setTimeout(showBanner, 400));
    }
  })();
