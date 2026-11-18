export default async function decorate(block) {
  // Dynamic copyright year
  const rows = block.querySelectorAll(':scope > div');
  const bottomRow = rows[2];
  if (bottomRow) {
    const p = bottomRow.querySelector('p');
    if (p) p.textContent = p.textContent.replace(/\d{4}/, new Date().getFullYear());
  }

  // Mark active link
  const currentPath = window.location.pathname;
  block.querySelectorAll('a').forEach((link) => {
    try {
      const linkPath = new URL(link.href).pathname;
      if (currentPath.startsWith(linkPath) && linkPath !== '/') {
        link.setAttribute('aria-current', 'page');
        link.closest('li')?.classList.add('active');
      }
    } catch { /* ignore */ }
  });

  // Scroll to top on brand heading click
  const brand = block.querySelector('h2');
  if (brand) {
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