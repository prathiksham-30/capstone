import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Parse config rows — each row: category slug | name | description
  const categories = rows.map((row) => ({
    slug: row.children[0]?.textContent.trim(),
    name: row.children[1]?.textContent.trim(),
    description: row.children[2]?.textContent.trim(),
  })).filter((c) => c.slug && c.name);

  if (!categories.length) return;

  block.innerHTML = '<div class="promo-grid-loading">Loading categories...</div>';

  // Fetch one product per category for the image
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByApiCategory(cat.slug, 1);
      return { ...cat, image: products[0]?.thumbnail || '' };
    })
  );

  const grid = document.createElement('div');
  grid.className = 'promo-grid-inner';

  enriched.forEach((cat) => {
    const card = document.createElement('div');
    card.className = 'promo-grid-card';
    card.innerHTML = `
      <a href="/category/${cat.slug}" class="promo-grid-link">
        <div class="promo-grid-image">
          ${cat.image ? `<img src="${cat.image}" alt="${cat.name}" loading="lazy">` : ''}
          <div class="promo-grid-overlay">
            <h3>${cat.name}</h3>
            <p>${cat.description || ''}</p>
            <span class="promo-grid-cta">Shop Now</span>
          </div>
        </div>
      </a>
    `;
    grid.append(card);
  });

  block.innerHTML = '';
  block.append(grid);
}