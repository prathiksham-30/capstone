import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || !isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart')) || [];
  const countEl = document.querySelector('[data-cart-count]');
  if (countEl) {
    countEl.textContent = cart.length;
    countEl.dataset.cartCount = cart.length;
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.default-content-wrapper > p > a');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.default-content-wrapper').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');

      navSection.querySelectorAll('ul > li').forEach((subItem) => {
        if (subItem.querySelector('ul')) {
          subItem.classList.add('nav-subdrop');
          subItem.addEventListener('click', (e) => {
            e.stopPropagation();
            subItem.classList.toggle('open');
          });
        }
      });

      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', navSection.getAttribute('aria-expanded') !== 'true');
        }
      });
      navSection.addEventListener('focus', focusNavSection);
    });
  }

  const navHamburger = document.createElement('div');
  navHamburger.classList.add('nav-hamburger');
  navHamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  navHamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.insertBefore(navHamburger, navSections);
  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
  document.addEventListener('keydown', closeOnEscape);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  // SVG icon injection
  const icons = {
    '.nav-search-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>`,
    '.nav-account-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="3.25"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`,
    '.nav-cart-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 1.95-1.55L21 8H6.1"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>`,
  };

  Object.entries(icons).forEach(([selector, svg]) => {
    const el = navWrapper.querySelector(selector);
    if (el) {
      if (selector === '.nav-cart-icon') {
        const badge = el.querySelector('.cart-count');
        el.innerHTML = svg;
        if (badge) el.append(badge);
      } else {
        el.innerHTML = svg;
      }
    }
  });

  block.append(navWrapper);

  // Cart count logic
  updateCartCount();
  window.addEventListener('cart-updated', updateCartCount);
}
