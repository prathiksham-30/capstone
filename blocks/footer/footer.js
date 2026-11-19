import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer fragment
  const footerMeta = document.querySelector('meta[name="footer"]');
  const footerPath = footerMeta ? new URL(footerMeta.content, window.location).pathname : '/footer';

  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  while (fragment.firstElementChild) block.append(fragment.firstElementChild);

  // Dynamic copyright year
  const copyright = block.querySelector('.footer-bottom p');
  if (copyright) {
    copyright.innerHTML = copyright.innerHTML.replace(
      /\d{4}/,
      new Date().getFullYear(),
    );
  }

  // Highlight active page link
  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // Hide footer on checkout
  if (window.location.pathname === '/checkout') {
    block.closest('footer').style.display = 'none';
  }
}