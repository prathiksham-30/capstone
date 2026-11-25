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

  // Use the full product image instead of the smaller thumbnail.
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByApiCategory(cat.slug, 3);
      const product = products[0];
      return {
        ...cat,
        image: product?.images?.[0] || product?.thumbnail || '',
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
          <span class="promo-grid-card-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M7 7h10v10"/></svg>
          </span>
        </div>
        <h3 class="promo-grid-title">${cat.name}</h3>
      </a>
    `;
    track.append(card);
  });

  wrapper.append(track);

  // Arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'promo-grid-arrow promo-grid-arrow-prev';
  prevBtn.setAttribute('aria-label', 'Scroll left');
  prevBtn.disabled = true;
  prevBtn.setAttribute('aria-disabled', 'true');
  prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'promo-grid-arrow promo-grid-arrow-next';
  nextBtn.setAttribute('aria-label', 'Scroll right');
  nextBtn.setAttribute('aria-disabled', 'false');
  nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;

  const controls = document.createElement('div');
  controls.className = 'promo-grid-controls';

  const progress = document.createElement('div');
  progress.className = 'promo-grid-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Category carousel position');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');

  const progressThumb = document.createElement('span');
  progressThumb.className = 'promo-grid-progress-thumb';
  progress.append(progressThumb);
  controls.append(progress, prevBtn, nextBtn);
  block.append(wrapper, controls);

  const scrollBy = () => track.querySelector('.promo-grid-card')?.offsetWidth + 20 || 300;

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));

  function updateArrows() {
    if (!track.clientWidth) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 4;
    const atEnd = maxScroll <= 4 || track.scrollLeft >= maxScroll - 4;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.setAttribute('aria-disabled', String(atStart));
    nextBtn.setAttribute('aria-disabled', String(atEnd));

    const scrollProgress = maxScroll > 4 ? track.scrollLeft / maxScroll : 0;
    const thumbWidth = track.scrollWidth
      ? Math.min(100, (track.clientWidth / track.scrollWidth) * 100)
      : 100;
    progressThumb.style.width = `${thumbWidth}%`;
    progressThumb.style.left = `${scrollProgress * (100 - thumbWidth)}%`;
    progress.setAttribute('aria-valuenow', String(Math.round(scrollProgress * 100)));
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  const resizeObserver = new ResizeObserver(updateArrows);
  resizeObserver.observe(track);
  const visibilityObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      updateArrows();
      observer.disconnect();
    }
  });
  visibilityObserver.observe(block);
  updateArrows();
  requestAnimationFrame(updateArrows);
}