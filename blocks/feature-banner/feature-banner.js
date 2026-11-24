import { fetchProductsByCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  // Read config from block rows
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim().toLowerCase();
    if (key && value) config[key] = value;
  });

  const category = config.category || 'all';
  const limit = parseInt(config.limit, 10) || 4;

  block.innerHTML = '<div class="feature-banner-loading">Loading featured products...</div>';

  const products = await fetchProductsByCategory(category, limit);

  if (!products.length) {
    block.innerHTML = '<p>No products found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'feature-banner-grid';

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'feature-banner-card';
    card.innerHTML = `
      <a href="/product/${product.id}" class="feature-banner-link">
        <div class="feature-banner-image">
          <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
          ${product.discountPercentage > 10 ? `<span class="feature-banner-badge">-${Math.round(product.discountPercentage)}%</span>` : ''}
        </div>
        <div class="feature-banner-info">
          <p class="feature-banner-brand">${product.brand || ''}</p>
          <h3 class="feature-banner-title">${product.title}</h3>
          <p class="feature-banner-desc">${product.description.slice(0, 60)}...</p>
          <div class="feature-banner-pricing">
            <span class="feature-banner-price">$${product.price}</span>
            ${product.discountPercentage > 0 ? `<span class="feature-banner-original">$${Math.round(product.price / (1 - product.discountPercentage / 100))}</span>` : ''}
          </div>
        </div>
      </a>
      <button class="feature-banner-cta" data-id="${product.id}">Add to Cart</button>
    `;

    card.querySelector('.feature-banner-cta').addEventListener('click', () => {
      const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: product.id, qty: 1 });
      }
      localStorage.setItem('shopedge-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      const btn = card.querySelector('.feature-banner-cta');
      btn.textContent = 'Added ✓';
      btn.style.background = '#27ae60';
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
      }, 2000);
    });

    grid.append(card);
  });

  block.innerHTML = '';
  block.append(grid);
}
