async function fetchNavContent(navPath) {
  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return null;
  return resp.text();
}

export default async function decorate(block) {
  const navPath = '/navigation';

  // Fetch nav document content
  const html = await fetchNavContent(navPath);
  if (!html) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // --- Brand Logo ---
  const brandSection = doc.body.querySelector('div:nth-child(1) p a');
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    brand.innerHTML = `<a href="${brandSection.href}" class="nav-logo">${brandSection.textContent}</a>`;
  }

  // --- Nav Links ---
  const navSection = doc.body.querySelector('div:nth-child(2) ul');
  const nav = document.createElement('nav');
  nav.className = 'nav-links';
  if (navSection) nav.appendChild(navSection);

  // --- Cart Icon ---
  const cartBtn = document.createElement('div');
  cartBtn.className = 'nav-cart';
  cartBtn.innerHTML = `
    <a href="/cart" aria-label="Cart">
      🛒 <span class="cart-count">0</span>
    </a>
  `;

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `<span></span><span></span><span></span>`;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open');
  });

  // --- Assemble ---
  block.innerHTML = '';
  block.append(brand, hamburger, nav, cartBtn);
}