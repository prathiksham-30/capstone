import { fetchProductsByCategory, fetchProductsByApiCategory } from '../../scripts/api.js';

const SHOPEDGE_CATEGORIES = ['all', 'shoes', 'clothing', 'accessories', 'beauty', 'home-living'];

function renderCard(product) {
  const card = document.createElement('div');
  card.className = 'product-teaser-card';

  const discount = product.discountPercentage > 0
    ? Math.round(product.discountPercentage)
    : 0;
  const originalPrice = discount > 0
    ? (product.price / (1 - discount / 100)).toFixed(2)
    : null;
  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  card.innerHTML = `
    <a href="/product/${product.id}" class="product-teaser-link">
      <div class="product-teaser-image">
        <img
          src="${product.thumbnail}"
          alt="${product.title}"
          loading="lazy"
          decoding="async"
        >
        ${discount > 10 ? `<span class="product-teaser-badge">-${discount}%</span>` : ''}
        ${product.stock < 10 ? `<span class="product-teaser-stock">Only ${product.stock} left</span>` : ''}
      </div>
      <div class="product-teaser-info">
        <p class="product-teaser-brand">${product.brand || product.category}</p>
        <h3 class="product-teaser-title">${product.title}</h3>
        <p class="product-teaser-desc">${product.description.slice(0, 80)}...</p>
        <div class="product-teaser-pricing">
          <span class="product-teaser-price">$${product.price}</span>
          ${originalPrice ? `<span class="product-teaser-original">$${originalPrice}</span>` : ''}
          ${discount > 0 ? `<span class="product-teaser-discount">${discount}% off</span>` : ''}
        </div>
        <div class="product-teaser-rating">
          <span class="product-teaser-stars">${stars}</span>
          <span class="product-teaser-reviews">(${product.reviews?.length || 0} reviews)</span>
        </div>
      </div>
    </a>
    <div class="product-teaser-actions">
      <a href="/product/${product.id}" class="product-teaser-view">View Details</a>
      <button class="product-teaser-cta" data-id="${product.id}">Add to Cart</button>
    </div>
  `;

  // Add to cart
  card.querySelector('.product-teaser-cta').addEventListener('click', (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, qty: 1 });
    localStorage.setItem('shopedge-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    const btn = e.target;
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 2000);
  });

  return card;
}

export default async function decorate(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  const category = config.category || 'all';
  const limit = parseInt(config.limit, 10) || 12;

  block.innerHTML = `
    <div class="product-teaser-loading">
      <div class="product-teaser-spinner"></div>
      <p>Loading products...</p>
    </div>
  `;

  const products = SHOPEDGE_CATEGORIES.includes(category)
    ? await fetchProductsByCategory(category, limit)
    : await fetchProductsByApiCategory(category, limit);

  if (!products.length) {
    block.innerHTML = '<p class="product-teaser-empty">No products found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'product-teaser-grid';
  products.forEach((p) => grid.append(renderCard(p)));

  block.innerHTML = '';
  block.append(grid);
}