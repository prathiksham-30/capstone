import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children].map((c) => c.textContent.trim());
  const category = cells[1] || 'womens-dresses';
  const title = cells[2] || 'Special Offer';
  const desc = cells[3] || '';
  const cta = cells[4] || 'Shop Now';
  const link = cells[5] || `/category/${category}`;

  const products = await fetchProductsByApiCategory(category, 5);
  const img = products[Math.floor(Math.random() * products.length)]?.images?.[0]
    || products[0]?.thumbnail || '';

  block.innerHTML = `
    <div class="promo-banner-inner">
      ${img ? `<div class="promo-banner-bg"><img src="${img}" alt="${title}" loading="lazy"></div>` : ''}
      <div class="promo-banner-content">
        <span class="promo-banner-eyebrow">Limited Time</span>
        <h2>${title}</h2>
        <p>${desc}</p>
        <a href="${link}" class="promo-banner-cta">${cta}</a>
      </div>
    </div>
  `;
}