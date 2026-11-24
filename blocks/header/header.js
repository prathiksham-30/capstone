import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

// Map nav label → DummyJSON API categories
const megaMenuCategories = {
  Shoes: ['mens-shoes', 'womens-shoes'],
  Clothing: ['mens-shirts', 'womens-dresses', 'tops'],
  Accessories: ['womens-jewellery', 'mens-watches', 'womens-watches', 'sunglasses'],
  Beauty: ['beauty', 'fragrances', 'skin-care'],
  Bags: ['womens-bags'],
};

async function fetchCategoryBrands(apiCategory) {
  try {
    const resp = await fetch(`https://dummyjson.com/products/category/${apiCategory}?limit=50`);
    if (!resp.ok) return { brands: [], image: null };
    const data = await resp.json();
    const brands = [...new Set(data.products.map((p) => p.brand).filter(Boolean))];
    return { brands, image: data.products[0]?.thumbnail || null };
  } catch {
    return { brands: [], image: null };
  }
}

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
    focused.closest('.nav-sections').querySelectorAll('.nav-drop')
      .forEach((d) => d.setAttribute('aria-expanded', 'false'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-drop').forEach((s) => s.setAttribute('aria-expanded', expanded));
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, false);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
  const countEl = document.querySelector('[data-cart-count]');
  if (countEl) {
    const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    countEl.textContent = total;
    countEl.dataset.cartCount = total;
  }
}

async function buildMegaMenu(navSection, label) {
  const apiCategories = megaMenuCategories[label];
  const existingUl = navSection.querySelector(':scope > ul');
  if (!existingUl) return;

  const panel = document.createElement('div');
  panel.className = 'mega-menu-panel';

  const linksCol = document.createElement('div');
  linksCol.className = 'mega-menu-links';

  // Keep original nav subcategory links
  const navList = existingUl.cloneNode(true);
  linksCol.append(navList);

  if (apiCategories) {
    // Fetch brands from first API category
    const { brands, image } = await fetchCategoryBrands(apiCategories[0]);

    if (brands.length) {
      const brandSection = document.createElement('div');
      brandSection.className = 'mega-menu-brands';
      brandSection.innerHTML = `<p class="mega-menu-brands-title">Popular Brands</p>`;
      const brandList = document.createElement('ul');
      brands.slice(0, 8).forEach((brand) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="/category/${apiCategories[0]}?brand=${encodeURIComponent(brand)}">${brand}</a>`;
        brandList.append(li);
      });
      brandSection.append(brandList);
      linksCol.append(brandSection);

      if (image) {
        panel.classList.add('has-image');
        const imgCol = document.createElement('div');
        imgCol.className = 'mega-menu-image';
        imgCol.innerHTML = `
          <img src="${image}" alt="${label}" loading="lazy">
          <p class="mega-menu-label">${label}</p>
        `;
        panel.append(linksCol);
        panel.append(imgCol);
      } else {
        panel.append(linksCol);
      }
    } else {
      panel.append(linksCol);
    }
  } else {
    panel.append(linksCol);
  }

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
    const buildPromises = [];

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('aria-expanded', 'false');

        const labelEl = navSection.querySelector(':scope > p')
          || navSection.querySelector(':scope > a');
        const label = labelEl
          ? labelEl.textContent.replace(/[›»>\u203a]/g, '').trim()
          : '';

        buildPromises.push(buildMegaMenu(navSection, label));
      }

      navSection.addEventListener('focus', focusNavSection);
    });

    await Promise.all(buildPromises);

    // Hover logic with leaveTimer — panel stays open
    let leaveTimer = null;

    navSections.querySelectorAll('.nav-drop').forEach((navSection) => {
      navSection.addEventListener('mouseenter', () => {
        clearTimeout(leaveTimer);
        if (isDesktop.matches) {
          toggleAllNavSections(navSections, false);
          navSection.setAttribute('aria-expanded', 'true');
        }
      });

      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches) {
          leaveTimer = setTimeout(() => {
            navSection.setAttribute('aria-expanded', 'false');
          }, 200);
        }
      });

      const panel = navSection.querySelector('.mega-menu-panel');
      if (panel) {
        panel.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
        panel.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            leaveTimer = setTimeout(() => {
              navSection.setAttribute('aria-expanded', 'false');
            }, 200);
          }
        });
      }

      navSection.addEventListener('click', (e) => {
        if (!isDesktop.matches) {
          e.stopPropagation();
          const isExpanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections, false);
          navSection.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        }
      });
    });

    document.addEventListener('click', () => toggleAllNavSections(navSections, false));
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

  // SVG icons — match by href (DA strips class from <a> tags)
  const iconMap = [
    {
      href: '/search',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      className: 'nav-search-icon',
    },
    {
      href: '/account',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      className: 'nav-account-icon',
    },
    {
      href: '/cart',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
      className: 'nav-cart-icon',
      badge: true,
    },
  ];

  iconMap.forEach(({ href, svg, className, badge }) => {
    const link = navWrapper.querySelector(`a[href="${href}"]`);
    if (link) {
      link.className = className;
      if (badge) {
        link.innerHTML = svg;
        const badgeEl = document.createElement('span');
        badgeEl.className = 'cart-count';
        badgeEl.setAttribute('data-cart-count', '0');
        badgeEl.textContent = '0';
        link.append(badgeEl);
      } else {
        link.innerHTML = svg;
      }
    }
  });

  block.append(navWrapper);
  updateCartCount();
  window.addEventListener('cart-updated', updateCartCount);
}