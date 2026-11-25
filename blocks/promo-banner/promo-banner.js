import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Parse config: category, title, description, cta text, cta link
  const cols = [...(rows[0]?.querySelectorAll(':scope > div') || [])];
  const category = cols[1]?.textContent.trim() || 'womens-dresses';
  const title = cols[2]?.textContent.trim() || 'End of Season Sale';
  const description = cols[3]?.textContent.trim() || 'Up to 50% off on selected items.';
  const ctaText = cols[4]?.textContent.trim() || 'Shop Now';
  const ctaLink = cols[5]?.textContent.trim() || '/category/all';

  block.innerHTML = '<div class="promo-banner-loading"></div>';

  // Fetch product image from API
  const products = await fetchProductsByApiCategory(category, 5);
  const product = products.find((p) => p.images?.length > 0) || products[0];
  const image = product?.images?.[0] || product?.thumbnail || '';

  block.innerHTML = '';

  block.innerHTML = `
    <div class="promo-banner-inner">
      <div class="promo-banner-content">
        <span class="promo-banner-tag">Limited Time Offer</span>
        <h2 class="promo-banner-title">${title}</h2>
        <p class="promo-banner-desc">${description}</p>
        <a href="${ctaLink}" class="promo-banner-cta">${ctaText} →</a>
      </div>
      <div class="promo-banner-image">
        ${image ? `<img src="${image}" alt="${title}" loading="lazy" decoding="async">` : ''}
        <div class="promo-banner-image-overlay"></div>
      </div>
    </div>
  `;
}