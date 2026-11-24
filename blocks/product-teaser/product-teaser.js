import { fetchProductsByCategory, fetchProductsByApiCategory } from '../../scripts/api.js';
import { renderProductGrid, showLoading, showEmpty } from '../../scripts/teaser-utils.js';

export default async function decorate(block) {
  // Read config rows
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  const category = config.category || 'all';
  const limit = parseInt(config.limit, 10) || 12;

  showLoading(block);

  // Check if it's a direct API category slug or a ShopEdge mapped category
  const SHOPEDGE_CATEGORIES = ['all', 'shoes', 'clothing', 'accessories'];
  const products = SHOPEDGE_CATEGORIES.includes(category)
    ? await fetchProductsByCategory(category, limit)
    : await fetchProductsByApiCategory(category, limit);

  if (!products.length) {
    showEmpty(block);
    return;
  }

  block.innerHTML = '';
  block.append(renderProductGrid(products));
}