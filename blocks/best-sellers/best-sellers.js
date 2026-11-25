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

  const intro = block.closest('.best-sellers-container')
    ?.querySelector(':scope > .default-content-wrapper');
  if (intro && !intro.querySelector('.best-sellers-kicker')) {
    const heading = intro.querySelector('h2');
    const kicker = document.createElement('p');
    kicker.className = 'best-sellers-kicker';
    kicker.textContent = 'CUSTOMER FAVORITES';
    const description = document.createElement('p');
    description.className = 'best-sellers-description';
    description.textContent = 'Top-rated finds our shoppers keep coming back for.';
    const link = document.createElement('a');
    link.className = 'best-sellers-cta';
    link.href = '/category/all';
    link.textContent = 'Explore best sellers';

    intro.classList.add('best-sellers-intro');
    if (heading) {
      heading.textContent = 'Our best sellers';
      intro.insertBefore(kicker, heading);
    } else {
      intro.prepend(kicker);
    }
    intro.append(description, link);
  }

  block.innerHTML = '';
  block.append(renderProductGrid(products, 'best-sellers-grid'));
}
