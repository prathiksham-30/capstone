/**
 * ShopEdge — Footer Block
 * File: blocks/footer/footer.js
 *
 * AEM Boilerplate loads /footer.html, wraps its <main> content
 * inside a <footer> element, then calls this decorator.
 */

import { loadCSS } from '../../scripts/aem.js';

/**
 * Decorate the footer block.
 * @param {HTMLElement} block  The <footer> element injected by scripts.js
 */
export default async function decorate(block) {
  // 1. Load footer-specific CSS
  loadCSS(`${window.hlx.codeBasePath}/blocks/footer/footer.css`);

  // 2. Inject current year into the copyright line dynamically
  const copyright = block.querySelector('.footer-bottom p');
  if (copyright) {
    copyright.textContent = copyright.textContent.replace(
      /\d{4}/,
      new Date().getFullYear(),
    );
  }

  // 3. Mark active nav link based on current path
  const currentPath = window.location.pathname;
  block.querySelectorAll('.footer-links a').forEach((link) => {
    try {
      const linkPath = new URL(link.href).pathname;
      if (currentPath.startsWith(linkPath) && linkPath !== '/') {
        link.setAttribute('aria-current', 'page');
        link.closest('li')?.classList.add('active');
      }
    } catch {
      // ignore malformed hrefs
    }
  });

  // 4. Smooth-scroll to top when ShopEdge brand heading is clicked
  const brand = block.querySelector('.footer-brand h2');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.setAttribute('role', 'button');
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('aria-label', 'Scroll to top');
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    brand.addEventListener('click', scrollTop);
    brand.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') scrollTop();
    });
  }
}