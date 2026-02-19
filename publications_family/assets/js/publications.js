/* global fetch */
document.addEventListener('DOMContentLoaded', () => {
  includePartials()
    .then(() => {
      initMobileNav();
      initFooterYear();
      initAuthorFilters();
      initScrollReveal();
    })
    .catch((error) => {
      // Surface a warning in the console without breaking the UI.
      console.warn('Partial loading encountered an issue:', error);
    });
});

/**
 * Replace placeholder nodes with fetched partial HTML.
 */
const PARTIAL_FALLBACKS = {
  header: `
<header class="bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
  <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    <a href="../index.html" class="flex items-center gap-3 text-deepBlue-700 dark:text-white">
      <img src="../assets/images/exports/lg_axeldevlab_icon.png" alt="Axel Dev Lab logo" class="h-10 w-auto">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Axel Dev Lab</p>
        <p class="text-lg font-semibold text-deepBlue-900 dark:text-white">Mapping Ideas, Powering Progress</p>
      </div>
    </a>
    <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-200 lg:flex" aria-label="Primary">
      <a href="../index.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">Home</a>
      <a href="../projects.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">Projects</a>
      <a href="../data.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">Data</a>
      <a href="../publications.html" class="text-deepBlue-800 dark:text-axelGold font-semibold">Publications</a>
      <a href="../collaborate.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">Collaborate</a>
      <a href="../media.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">Media</a>
      <a href="../about.html" class="hover:text-deepBlue-700 dark:hover:text-axelGold transition">About</a>
      <a href="../contacts.html" class="inline-flex items-center gap-2 rounded-full border border-deepBlue-600 px-4 py-2 text-deepBlue-700 hover:bg-deepBlue-600 hover:text-white dark:border-axelGold/70 dark:text-axelGold dark:hover:bg-axelGold/20 transition">Contact</a>
    </nav>
    <button class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 lg:hidden" data-mobile-nav-toggle>
      <span class="sr-only">Toggle navigation</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>
  <div class="hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 lg:hidden" data-mobile-nav>
    <div class="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
      <a href="../index.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">Home</a>
      <a href="../projects.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">Projects</a>
      <a href="../data.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">Data</a>
      <a href="../publications.html" class="font-semibold text-deepBlue-800 dark:text-axelGold">Publications</a>
      <a href="../collaborate.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">Collaborate</a>
      <a href="../media.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">Media</a>
      <a href="../about.html" class="transition hover:text-deepBlue-700 dark:hover:text-axelGold">About</a>
      <a href="../contacts.html" class="rounded-full border border-deepBlue-600 dark:border-axelGold/70 px-4 py-2 text-center text-deepBlue-700 dark:text-axelGold transition hover:bg-deepBlue-600 hover:text-white dark:hover:bg-axelGold/20">Contact</a>
    </div>
  </div>
</header>`.trim(),
  footer: `
<footer class="bg-[#0b1f3a] text-gray-200 py-14 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <img src="../assets/images/exports/lg_axeldevlab_icon.png" alt="Axel Dev Lab logo" class="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
          <div class="leading-tight">
            <div class="text-lg sm:text-xl font-bold tracking-tight text-white">Axel Dev Lab</div>
            <div class="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-brand-200">Axel Dev Group LLC</div>
          </div>
        </div>
        <p class="opacity-80 text-sm">Transforming global development through data intelligence and strategic policy insights.</p>
        <p class="text-sm opacity-80">502 W 7th St, Ste 100</p>
        <p class="text-sm opacity-80">Erie, PA 16502</p>
        <p class="text-sm opacity-80">United States</p>
      </div>
      <div>
        <h4 class="font-semibold mb-4 text-white">Navigate</h4>
        <ul class="space-y-2 text-sm opacity-90">
          <li><a href="../index.html" class="hover:text-brand-200 transition">Home</a></li>
          <li><a href="../projects.html" class="hover:text-brand-200 transition">Projects</a></li>
          <li><a href="../data.html" class="hover:text-brand-200 transition">Data</a></li>
          <li><a href="../publications.html" class="hover:text-brand-200 transition">Publications</a></li>
          <li><a href="../collaborate.html" class="hover:text-brand-200 transition">Collaborate</a></li>
          <li><a href="../media.html" class="hover:text-brand-200 transition">Media</a></li>
          <li><a href="../about.html" class="hover:text-brand-200 transition">About</a></li>
          <li><a href="../contacts.html" class="hover:text-brand-200 transition">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4 text-white">Stay connected</h4>
        <p class="text-sm opacity-90">Reach the team at</p>
        <a href="mailto:info@axeldevlab.com" class="inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 transition text-sm">info@axeldevlab.com</a>
        <div class="mt-4 space-y-2">
          <p class="text-sm opacity-80">Follow Axel Dev Lab</p>
          <div class="flex flex-wrap items-center gap-3">
            <a href="https://www.youtube.com/@axeldevlab" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M21.8 8c-.2-.78-.82-1.39-1.6-1.59C18.2 6 12 6 12 6s-6.2 0-8.2.41c-.78.2-1.4.81-1.6 1.59C2 10 2 12 2 12s0 2 .2 3.99c.2.78.82 1.39 1.6 1.59C5.8 18 12 18 12 18s6.2 0 8.2-.41c.78-.2 1.4-.81 1.6-1.59C22 14 22 12 22 12s0-2-.2-4zM10 14.65V9.35L14.5 12 10 14.65z"/></svg>
            </a>
            <a href="https://x.com/axeldevlab" target="_blank" rel="noopener noreferrer" aria-label="X" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M4 4l7.53 8.08L4 20h2.73l6.13-6.73L19.27 20H22l-7.6-8.13L22 4h-2.73l-6.06 6.68L8.73 4H4z"/></svg>
            </a>
            <a href="https://github.com/axeldevlab" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.68.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.39 9.39 0 015 0c1.9-1.32 2.74-1.05 2.74-1.05.56 1.4.21 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.6.68.49A10.02 10.02 0 0022 12.26C22 6.58 17.52 2 12 2z" clip-rule="evenodd"/></svg>
            </a>
            <a href="https://substack.com/@axeldevlab" target="_blank" rel="noopener noreferrer" aria-label="Substack" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M4 6h16v2H4V6zm0 4h16v2H4v-2zm0 4l8 4 8-4v4H4v-4z"/></svg>
            </a>
            <a href="https://www.facebook.com/share/19aJ97hwBF/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.89h-2.3V22C18.34 21.12 22 16.99 22 12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/axeldevlab" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zM7 19H4v-9h3v9zM5.5 8.732c-.966 0-1.75-.79-1.75-1.764 0-.975.784-1.764 1.75-1.764s1.75.789 1.75 1.764c0 .974-.784 1.764-1.75 1.764zM20 19h-3v-4.5c0-1.074-.021-2.455-1.496-2.455-1.496 0-1.724 1.168-1.724 2.378V19h-3v-9h2.881v1.229h.041c.401-.76 1.381-1.557 2.842-1.557 3.041 0 3.6 2.003 3.6 4.605V19z"/></svg>
            </a>
            <a href="https://www.instagram.com/axeldevlab?igsh=bmt2ZGx0enN2a2Vu" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 3a1 1 0 110 2 1 1 0 010-2zM12 7.5c2.485 0 4.5 2.015 4.5 4.5S14.485 16.5 12 16.5 7.5 14.485 7.5 12 9.515 7.5 12 7.5zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-8 border-t border-white/10 text-center text-sm opacity-70">
      <p>&copy; <span data-year></span> Axel Dev Group LLC. All rights reserved.</p>
    </div>
  </div>
</footer>`.trim(),
};

async function includePartials() {
  const includeNodes = Array.from(document.querySelectorAll('[data-include]'));
  const scriptElement =
    document.currentScript || document.querySelector('script[src*="assets/js/publications.js"]');

  await Promise.all(
    includeNodes.map(async (node) => {
      const partialName = node.getAttribute('data-include');
      if (!partialName) return;

      const candidateUrls = buildPartialUrls(partialName, scriptElement);
      let markup = '';
      let lastError;

      for (const url of candidateUrls) {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (!response.ok) throw new Error(`Failed to load partial: ${url} (status ${response.status})`);
          markup = await response.text();
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!markup && PARTIAL_FALLBACKS[partialName]) {
        markup = PARTIAL_FALLBACKS[partialName];
      }

      if (markup) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = markup.trim();
        node.replaceWith(...wrapper.childNodes);
        return;
      }

      const fallback = document.createElement('div');
      fallback.innerHTML = `<p class="px-6 py-4 text-sm text-red-600">Unable to load ${partialName}.</p>`;
      node.replaceWith(fallback);
      console.warn(`Partial ${partialName} could not be loaded.`, lastError);
    })
  );
}

function buildPartialUrls(partialName, scriptElement) {
  const urls = [];

  if (scriptElement && scriptElement.src) {
    urls.push(new URL(`../partials/${partialName}.html`, scriptElement.src).href);
  }

  urls.push(new URL(`./partials/${partialName}.html`, window.location.href).href);

  if (window.location.protocol !== 'file:') {
    urls.push(new URL(`/publications_family/partials/${partialName}.html`, window.location.origin).href);
  }

  return Array.from(new Set(urls));
}

/**
 * Handle mobile navigation toggles inside the injected header.
 */
function initMobileNav() {
  const toggle = document.querySelector('[data-mobile-nav-toggle]');
  const drawer = document.querySelector('[data-mobile-nav]');

  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const expanded = drawer.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', (!expanded).toString());
  });
}

/**
 * Update the footer copyright year.
 */
function initFooterYear() {
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

/**
 * Basic filtering for author cards on the Authors page.
 */
function initAuthorFilters() {
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const authorCards = Array.from(document.querySelectorAll('.author-card'));

  if (!filterButtons.length || !authorCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const target = button.dataset.filter;
      authorCards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = target === 'all' || category === target;
        card.style.display = shouldShow ? '' : 'none';
        card.classList.toggle('opacity-50', !shouldShow);
      });
    });
  });
}

/**
 * Subtle fade & lift on scroll for larger cards.
 */
function initScrollReveal() {
  const revealNodes = Array.from(
    document.querySelectorAll('.publication-card, .memo-card, .paper-card, .report-card, .author-card, .axis-card__inner, .press-article')
  );

  if (!revealNodes.length || typeof IntersectionObserver === 'undefined') return;

  revealNodes.forEach((node) => {
    node.classList.add('will-reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}
