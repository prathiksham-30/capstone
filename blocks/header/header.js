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
  block.append(navWrapper);
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
  const resp = await fetch('/nav.html');
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main navigation');

  const brand = doc.querySelector('main > div:first-child');
  const links = doc.querySelector('main > div:nth-child(2)');

  if (brand) {
    const brandDiv = document.createElement('div');
    brandDiv.className = 'nav-brand';
    brandDiv.innerHTML = brand.innerHTML;
    nav.append(brandDiv);
  }

  if (links) {
    const linksDiv = document.createElement('div');
    linksDiv.className = 'nav-links';
    linksDiv.innerHTML = links.innerHTML;
    nav.append(linksDiv);
  }

  block.append(nav);

  // Update cart count after nav is rendered
  updateCartCount();

  // Listen for cart updates from other pages (e.g. add to cart)
  window.addEventListener('cart-updated', updateCartCount);
}