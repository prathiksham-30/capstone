/**
 * ShopEdge — Footer Block
 * File: blocks/footer/footer.js
 */

export default async function decorate(block) {
  // 1. Dynamic copyright year
  const copyright = block.querySelector('.footer-bottom p');
  if (copyright) {
    copyright.textContent = copyright.textContent.replace(
      /\d{4}/,
      new Date().getFullYear(),
    );
  }

  // 2. Mark active link based on current page path
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

  // 3. Smooth scroll-to-top on brand heading click
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

  // 4. Hide footer on checkout page
  const hiddenPaths = ['/eds-ecommerce/checkout'];
  if (hiddenPaths.some((p) => currentPath.startsWith(p))) {
    block.closest('footer')?.remove();
  }
}