import { addToCart } from './api.js';

/**
 * Renders a single product teaser card
 * Used by: product-teaser, feature-banner, category-grid
 */
export function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-teaser-card';

  const originalPrice = product.discountPercentage > 0
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const stars = '★'.repeat(Math.round(product.rating))
    + '☆'.repeat(5 - Math.round(product.rating));

  card.innerHTML = `
    <a href="/product/${product.id}" class="product-teaser-link">
      <div class="product-teaser-image">
        <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
        ${product.discountPercentage > 10 ? `<span class="product-teaser-badge">-${Math.round(product.discountPercentage)}%</span>` : ''}
        ${product.stock < 10 ? `<span class="product-teaser-stock">Only ${product.stock} left</span>` : ''}
      </div>
      <div class="product-teaser-info">
        <p class="product-teaser-brand">${product.brand || product.category}</p>
        <h3 class="product-teaser-title">${product.title}</h3>
        <p class="product-teaser-desc">${product.description.slice(0, 70)}...</p>
        <div class="product-teaser-pricing">
          <span class="product-teaser-price">$${product.price}</span>
          ${originalPrice ? `<span class="product-teaser-original">$${originalPrice}</span>` : ''}
        </div>
        <div class="product-teaser-rating">
          <span class="product-teaser-stars">${stars}</span>
          <span class="product-teaser-reviews">(${product.reviews?.length || 0})</span>
        </div>
      </div>
    </a>
    <button class="product-teaser-cta" data-id="${product.id}">Add to Cart</button>
  `;

  card.querySelector('.product-teaser-cta').addEventListener('click', (e) => {
    e.preventDefault();
    addToCart(product.id, 1);
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

/**
 * Renders a grid of product teaser cards
 */
export function renderProductGrid(products, className = 'product-teaser-grid') {
  const grid = document.createElement('div');
  grid.className = className;
  products.forEach((product) => grid.append(renderProductCard(product)));
  return grid;
}

/**
 * Shows loading state
 */
export function showLoading(block) {
  block.innerHTML = '<div class="product-teaser-loading"><span>Loading products...</span></div>';
}

/**
 * Shows empty state
 */
export function showEmpty(block, message = 'No products found.') {
  block.innerHTML = `<p class="product-teaser-empty">${message}</p>`;
}