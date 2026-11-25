import { fetchAllProducts } from '../../scripts/api.js';
import {
  loadProductTeaserStyles, renderProductGrid, showLoading, showEmpty,
} from '../../scripts/teaser-utils.js';

export default async function decorate(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  const limit = parseInt(config.limit, 10) || 8;

  showLoading(block);
  await loadProductTeaserStyles();

  // Best sellers = highest rated + most reviewed products
  const data = await fetchAllProducts(100);
  const products = (data.products || [])
    .filter((p) => p.rating >= 4.5)
    .sort((a, b) => {
      // Sort by rating first, then by review count
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    })
    .slice(0, limit);

  if (!products.length) {
    showEmpty(block, 'No best sellers found.');
    return;
  }

  block.innerHTML = '';
  block.append(renderProductGrid(products, 'best-sellers-grid'));
}