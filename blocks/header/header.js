import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const megaMenuImages = {
  Shoes: 'https://main--capstone--prathiksham-30.aem.live/assets/nav/shoes.jpg',
  Clothing: 'https://main--capstone--prathiksham-30.aem.live/assets/nav/clothing.jpeg',
  Accessories: 'https://main--capstone--prathiksham-30.aem.live/assets/nav/accessories.jpeg',
};

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const expanded = navSections.querySelector('[aria-expanded="true"]');
    if (expanded && isDesktop.matches) {
      expanded.setAttribute('aria-expanded', 'false');
      expanded.focus();
    } else if (!isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'false');
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (focused.classList.contains('nav-drop') && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    focused.closest('.nav-sections').querySelectorAll('.nav-drop').forEach((d) => d.setAttribute('aria-expanded', 'false'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, false);
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

function buildMegaMenu(navSection, label) {
  const imgUrl = megaMenuImages[label];
  const existingUl = navSection.querySelector(':scope > ul');
  if (!existingUl) return;

  // Mark nav-subdrop on nested items
  existingUl.querySelectorAll(':scope > li').forEach((subItem) => {
    if (subItem.querySelector('ul')) subItem.classList.add('nav-subdrop');
  });

  // Create the panel
  const panel = document.createElement('div');
  panel.className = imgUrl ? 'mega-menu-panel has-image' : 'mega-menu-panel';

  // Links column — move the ul into it
  const linksCol = document.createElement('div');
  linksCol.className = 'mega-menu-links';
  linksCol.append(existingUl.cloneNode(true));

  panel.append(linksCol);

  // Image column
  if (imgUrl) {
    const imgCol = document.createElement('div');
    imgCol.className = 'mega-menu-image';
    imgCol.innerHTML = `
      <img src="${imgUrl}" alt="${label}" loading="lazy">
      <p class="mega-menu-label">${label}</p>
    `;
    panel.append(imgCol);
  }

  // Replace the original ul with the panel
  existingUl.replaceWith(panel);
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
  const brandLink = navBrand?.querySelector('.default-content-wrapper > p > a');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.default-content-wrapper').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('aria-expanded', 'false');

        const labelEl = navSection.querySelector(':scope > p')
          || navSection.querySelector(':scope > a');
        const label = labelEl
          ? labelEl.textContent.replace(/[›»>\u203a]/g, '').trim()
          : '';

        buildMegaMenu(navSection, label);
      }

      navSection.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isDesktop.matches) {
          if (navSection.classList.contains('nav-drop')) {
            toggleAllNavSections(navSections, false);
            navSection.setAttribute('aria-expanded', 'true');
          } else {
            toggleAllNavSections(navSections, false);
          }
        }
      });
      navSection.addEventListener('mouseenter', () => {
        if (isDesktop.matches && navSection.classList.contains('nav-drop')) {
          toggleAllNavSections(navSections, false);
          navSection.setAttribute('aria-expanded', 'true');
        }
      });
      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches && navSection.classList.contains('nav-drop')) {
          navSection.setAttribute('aria-expanded', 'false');
        }
      });
      navSection.addEventListener('focus', focusNavSection);
    });

    document.addEventListener('click', () => {
      toggleAllNavSections(navSections, false);
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
    '.nav-search-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    '.nav-account-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    '.nav-cart-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
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

  updateCartCount();
  window.addEventListener('cart-updated', updateCartCount);
}
