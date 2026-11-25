import { fetchAllProducts } from '../../scripts/api.js';
import { renderProductGrid, showLoading, showEmpty } from '../../scripts/teaser-utils.js';

export default async function decorate(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  const limit = parseInt(config.limit, 10) || 8;

  showLoading(block);

  // New arrivals = latest products (highest ID = most recently added)
  const data = await fetchAllProducts(100);
  const products = (data.products || [])
    .sort((a, b) => b.id - a.id) // highest ID = newest
    .slice(0, limit);

  if (!products.length) {
    showEmpty(block, 'No new arrivals found.');
    return;
  }

  block.innerHTML = '';
  block.append(renderProductGrid(products, 'new-arrivals-grid'));
}