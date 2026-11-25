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

  // New arrivals = latest products (highest ID = most recently added)
  const data = await fetchAllProducts(100);
  const products = (data.products || [])
    .sort((a, b) => b.id - a.id) // highest ID = newest
    .slice(0, limit);

  if (!products.length) {
    showEmpty(block, 'No new arrivals found.');
    return;
  }

  const intro = block.closest('.new-arrivals-container')
    ?.querySelector(':scope > .default-content-wrapper');
  if (intro && !intro.querySelector('.new-arrivals-kicker')) {
    const heading = intro.querySelector('h2');
    const kicker = document.createElement('p');
    kicker.className = 'new-arrivals-kicker';
    kicker.textContent = 'JUST IN';
    const description = document.createElement('p');
    description.className = 'new-arrivals-description';
    description.textContent = 'Discover the latest additions to ShopEdge.';
    const link = document.createElement('a');
    link.className = 'new-arrivals-cta';
    link.href = '/category/all';
    link.textContent = 'Explore new arrivals';

    intro.classList.add('new-arrivals-intro');
    if (heading) {
      intro.insertBefore(kicker, heading);
    } else {
      intro.prepend(kicker);
    }
    intro.append(description, link);
  }

  block.innerHTML = '';
  block.append(renderProductGrid(products, 'new-arrivals-grid'));
}
