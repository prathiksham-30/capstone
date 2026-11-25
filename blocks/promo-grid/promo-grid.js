import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const categories = rows.map((row) => ({
    slug: row.children[0]?.textContent.trim(),
    name: row.children[1]?.textContent.trim(),
    description: row.children[2]?.textContent.trim(),
  })).filter((c) => c.slug && c.name);

  if (!categories.length) return;

  block.innerHTML = '<div class="promo-grid-loading">Loading categories...</div>';

  // Fetch multiple products per category for HD images
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByApiCategory(cat.slug, 5);
      // Pick product with best quality image
      const product = products.find((p) => p.images?.length > 0) || products[0];
      return {
        ...cat,
        image: product?.images?.[0] || product?.thumbnail || '',
      };
    })
  );

  block.innerHTML = '';

  // Build scroll container
  const wrapper = document.createElement('div');
  wrapper.className = 'promo-grid-wrapper';

  const track = document.createElement('div');
  track.className = 'promo-grid-track';

  enriched.forEach((cat) => {
    const card = document.createElement('div');
    card.className = 'promo-grid-card';
    card.innerHTML = `
      <a href="/category/${cat.slug}" class="promo-grid-link">
        <div class="promo-grid-image">
          <img
            src="${cat.image}"
            alt="${cat.name}"
            loading="lazy"
            decoding="async"
          >
          <div class="promo-grid-overlay">
            <div class="promo-grid-content">
              <h3>${cat.name}</h3>
              <p>${cat.description || ''}</p>
              <span class="promo-grid-cta">Shop Now →</span>
            </div>
          </div>
        </div>
      </a>
    `;
    track.append(card);
  });

  wrapper.append(track);

  // Scroll arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'promo-grid-arrow promo-grid-arrow-prev';
  prevBtn.setAttribute('aria-label', 'Scroll left');
  prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'promo-grid-arrow promo-grid-arrow-next';
  nextBtn.setAttribute('aria-label', 'Scroll right');
  nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;

  block.append(wrapper, prevBtn, nextBtn);

  // Scroll logic
  const scrollAmount = () => track.querySelector('.promo-grid-card')?.offsetWidth + 24 || 320;

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  // Show/hide arrows based on scroll position
  function updateArrows() {
    prevBtn.style.opacity = track.scrollLeft <= 0 ? '0.3' : '1';
    prevBtn.style.pointerEvents = track.scrollLeft <= 0 ? 'none' : 'auto';
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    nextBtn.style.opacity = atEnd ? '0.3' : '1';
    nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
  }

  track.addEventListener('scroll', updateArrows);
  updateArrows();
}