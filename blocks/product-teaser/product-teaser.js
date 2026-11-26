import { fetchProductsByCategory, fetchProductsByApiCategory } from '../../scripts/api.js';

// ✅ Added gadgets and groceries
const SHOPEDGE_CATEGORIES = ['all', 'shoes', 'clothing', 'accessories', 'gadgets', 'beauty', 'home-living', 'groceries'];

function renderCard(product, listing = false) {
  const card = document.createElement('div');
  card.className = 'product-teaser-card';

  const discount = product.discountPercentage > 0
    ? Math.round(product.discountPercentage)
    : 0;
  const originalPrice = discount > 0
    ? (product.price / (1 - discount / 100)).toFixed(2)
    : null;
  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  if (listing) {
    const brand = product.brand || product.category;
    const brandFilter = encodeURIComponent(brand);
    card.innerHTML = `
      <div class="product-teaser-image">
        <a href="/product/${product.id}" class="product-teaser-image-link">
          <img
            src="${product.thumbnail}"
            alt="${product.title}"
            loading="lazy"
            decoding="async"
          >
        </a>
        ${product.stock < 10 ? `<span class="product-teaser-stock">Only ${product.stock} left</span>` : ''}
        <button
          class="product-teaser-cta"
          data-id="${product.id}"
          aria-label="Add ${product.title} to cart"
        >+</button>
      </div>
      <div class="product-teaser-info">
        ${discount > 0 ? `
          <div class="product-teaser-deal">
            <span class="product-teaser-badge">${discount}% off</span>
            <span>Limited time deal</span>
          </div>
        ` : ''}
        <div class="product-teaser-pricing">
          <span class="product-teaser-price">$${product.price}</span>
          ${originalPrice ? `<span class="product-teaser-original">M.R.P. $${originalPrice}</span>` : ''}
        </div>
        <h3 class="product-teaser-title">
          <a href="/product/${product.id}" class="product-teaser-title-link">${product.title}</a>
        </h3>
        <div class="product-teaser-rating">
          <span class="product-teaser-rating-value">${(product.rating || 0).toFixed(1)}</span>
          <span class="product-teaser-stars">${stars}</span>
          <span class="product-teaser-reviews">(${product.reviews?.length || 0})</span>
        </div>
        <a class="product-teaser-brand-deals" href="/category/all?brand=${brandFilter}">
          Shop ${brand} deals
        </a>
      </div>
    `;
  } else {
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
  }

  const addToCartButton = card.querySelector('.product-teaser-cta');
  const originalAriaLabel = addToCartButton.getAttribute('aria-label');
  addToCartButton.addEventListener('click', (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, qty: 1 });
    localStorage.setItem('shopedge-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    const btn = e.target;
    btn.textContent = listing ? '✓' : 'Added ✓';
    btn.classList.add('added');
    if (listing) btn.setAttribute('aria-label', `Added ${product.title} to cart`);
    setTimeout(() => {
      btn.textContent = listing ? '+' : 'Add to Cart';
      btn.classList.remove('added');
      if (originalAriaLabel) btn.setAttribute('aria-label', originalAriaLabel);
      else btn.removeAttribute('aria-label');
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
  const isAllProducts = category === 'all';

  // ✅ Read both brand and tag filters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const brandFilter = urlParams.get('brand');
  const tagFilter = urlParams.get('tag')?.toLowerCase();

  block.innerHTML = `
    <div class="product-teaser-loading">
      <div class="product-teaser-spinner"></div>
      <p>Loading products...</p>
    </div>
  `;

  // Fetch more when filtering so we have enough after filtering
  const fetchLimit = (brandFilter || tagFilter) ? 200 : limit;
  const fetchedProducts = SHOPEDGE_CATEGORIES.includes(category)
    ? await fetchProductsByCategory(category, fetchLimit)
    : await fetchProductsByApiCategory(category, fetchLimit);

  // ✅ Apply brand filter
  let products = fetchedProducts.filter((product) =>
    !brandFilter || (product.brand || product.category) === brandFilter
  );

  // ✅ Apply tag filter (for groceries types)
  if (tagFilter) {
    products = products.filter((p) =>
      p.tags?.some((t) => t.toLowerCase().includes(tagFilter))
      || p.category?.toLowerCase().includes(tagFilter)
      || p.title?.toLowerCase().includes(tagFilter)
    );
  }

  products = products.slice(0, limit);

  if (!products.length) {
    block.innerHTML = `<p class="product-teaser-empty">No products found${tagFilter ? ` for "${tagFilter}"` : ''}.</p>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'product-teaser-grid';
  if (isAllProducts) block.classList.add('product-teaser-listing');
  products.forEach((p) => grid.append(renderCard(p, isAllProducts)));

  block.innerHTML = '';
  block.append(grid);
}