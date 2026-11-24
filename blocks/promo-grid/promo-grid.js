import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const configs = rows.map((row) => ({
    category: row.children[1]?.textContent.trim() || row.children[0]?.textContent.trim(),
    name: row.children[2]?.textContent.trim() || '',
    desc: row.children[3]?.textContent.trim() || '',
  })).filter((c) => c.category && c.category !== 'category');

  if (!configs.length) return;
  block.innerHTML = '<div class="promo-grid-loading"></div>';

  const enriched = await Promise.all(
    configs.map(async (cfg) => {
      const products = await fetchProductsByApiCategory(cfg.category, 3);
      const img = products[Math.floor(Math.random() * products.length)]?.thumbnail || '';
      return { ...cfg, img };
    })
  );

  const grid = document.createElement('div');
  grid.className = 'promo-grid-inner';

  enriched.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'promo-grid-card';
    card.innerHTML = `
      <a href="/category/${item.category}" class="promo-grid-link">
        <div class="promo-grid-img">
          ${item.img ? `<img src="${item.img}" alt="${item.name}" loading="lazy">` : ''}
        </div>
        <div class="promo-grid-info">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <span class="promo-grid-btn">Shop Now →</span>
        </div>
      </a>
    `;
    grid.append(card);
  });

  block.innerHTML = '';
  block.append(grid);
}
