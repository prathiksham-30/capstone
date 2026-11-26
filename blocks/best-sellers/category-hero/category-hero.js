export default function decorate(block) {
  // Check for tag filter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const tagFilter = urlParams.get('tag');
  const brandFilter = urlParams.get('brand');

  const h1 = block.querySelector('h1');
  const desc = block.querySelector('p');

  // Update title for tag filter (groceries types)
  if (tagFilter && h1) {
    const tagLabel = tagFilter.charAt(0).toUpperCase() + tagFilter.slice(1);
    h1.textContent = `${tagLabel} — Groceries`;
    if (desc) desc.textContent = `Browsing ${tagLabel} products from our Groceries collection.`;
  }

  // Update title for brand filter
  if (brandFilter && h1) {
    const original = h1.textContent;
    h1.textContent = `${decodeURIComponent(brandFilter)} — ${original}`;
    if (desc) desc.textContent = `Browsing all products from ${decodeURIComponent(brandFilter)}.`;
  }
}