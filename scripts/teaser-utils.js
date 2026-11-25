import { addToCart } from './api.js';

export function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-teaser-card';

  const discount = product.discountPercentage > 0
    ? Math.round(product.discountPercentage)
    : 0;
  const originalPrice = discount > 0
    ? (product.price / (1 - discount / 100)).toFixed(2)
    : null;
  const stars = '★'.repeat(Math.round(product.rating))
    + '☆'.repeat(5 - Math.round(product.rating));

  // Use best available image
  const imgSrc = product.thumbnail
    || (product.images && product.images[0])
    || 'https://placehold.co/400x400/f8f8f8/999?text=No+Image';

  let badge = '';
  if (discount > 10) badge = `<span class="product-teaser-badge">-${discount}%</span>`;

  card.innerHTML = `
    <a href="/product/${product.id}" class="product-teaser-link">
      <div class="product-teaser-image">
        <img
          src="${imgSrc}"
          alt="${product.title}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='https://placehold.co/400x400/f0f0f0/999?text=Image+Not+Found'"
        >
        ${badge}
        ${product.stock < 10 ? `<span class="product-teaser-stock">Only ${product.stock} left</span>` : ''}
      </div>
      <div class="product-teaser-info">
        <p class="product-teaser-brand">${product.brand || product.category || ''}</p>
        <h3 class="product-teaser-title">${product.title}</h3>
        <p class="product-teaser-desc">${product.description.slice(0, 80)}...</p>
        <div class="product-teaser-pricing">
          <span class="product-teaser-price">$${product.price}</span>
          ${originalPrice ? `<span class="product-teaser-original">$${originalPrice}</span>` : ''}
          ${discount > 0 ? `<span class="product-teaser-discount">${discount}% off</span>` : ''}
        </div>
        <div class="product-teaser-rating">
          <span class="product-teaser-stars">${stars}</span>
          <span class="product-teaser-reviews">(${product.reviews?.length || 0})</span>
        </div>
      </div>
    </a>
    <div class="product-teaser-actions">
      <a href="/product/${product.id}" class="product-teaser-view">View Details</a>
      <button class="product-teaser-cta" data-id="${product.id}">Add to Cart</button>
    </div>
  `;

  card.querySelector('.product-teaser-cta').addEventListener('click', (e) => {
    e.preventDefault();
    addToCart(product, 1); // ✅ pass full product object
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

export function renderProductGrid(products, className = 'product-teaser-grid') {
  const grid = document.createElement('div');
  grid.className = className;
  products.forEach((p) => grid.append(renderProductCard(p)));
  return grid;
}

export function showLoading(block) {
  block.innerHTML = `
    <div class="product-teaser-loading">
      <div class="product-teaser-spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

export function showEmpty(block, message = 'No products found.') {
  block.innerHTML = `<p class="product-teaser-empty">${message}</p>`;
}