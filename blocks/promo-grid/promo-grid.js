import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Each row: col0=key("category"), col1=slug, col2=name, col3=description(ignored)
  const categories = rows.map((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    return {
      slug: cols[1]?.textContent.trim(),
      name: cols[2]?.textContent.trim(),
    };
  }).filter((c) => c.slug && c.name);

  if (!categories.length) return;

  block.innerHTML = '<div class="promo-grid-loading">Loading...</div>';

  // Fetch thumbnail from API
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByApiCategory(cat.slug, 3);
      const product = products[0];
      return {
        ...cat,
        image: product?.thumbnail || '',
      };
    })
  );

  block.innerHTML = '';

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
          ${cat.image ? `<img src="${cat.image}" alt="${cat.name}" loading="lazy" decoding="async">` : '<div class="promo-grid-placeholder"></div>'}
          <div class="promo-grid-overlay">
            <h3>${cat.name}</h3>
            <span class="promo-grid-cta">Shop Now →</span>
          </div>
        </div>
      </a>
    `;
    track.append(card);
  });

  wrapper.append(track);

  // Arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'promo-grid-arrow promo-grid-arrow-prev';
  prevBtn.setAttribute('aria-label', 'Scroll left');
  prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'promo-grid-arrow promo-grid-arrow-next';
  nextBtn.setAttribute('aria-label', 'Scroll right');
  nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;

  block.append(wrapper, prevBtn, nextBtn);

  const scrollBy = () => track.querySelector('.promo-grid-card')?.offsetWidth + 20 || 300;

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));

  function updateArrows() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 4;
    const atEnd = maxScroll <= 4 || track.scrollLeft >= maxScroll - 4;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.setAttribute('aria-disabled', String(atStart));
    nextBtn.setAttribute('aria-disabled', String(atEnd));
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  const resizeObserver = new ResizeObserver(updateArrows);
  resizeObserver.observe(track);
  updateArrows();
}