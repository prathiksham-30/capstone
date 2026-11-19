import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const footerMeta = document.querySelector('meta[name="footer"]');
  const footerPath = footerMeta
    ? new URL(footerMeta.content, window.location).pathname
    : '/footer';

  const fragment = await loadFragment(footerPath);

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

  // Hide footer on checkout
  if (window.location.pathname === '/checkout') {
    block.closest('footer').style.display = 'none';
  }
}