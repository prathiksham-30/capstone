export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const h1 = rows[0]?.querySelector('h1');
  const desc = rows[0]?.querySelector('p');

  // Check for tag filter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const tagFilter = urlParams.get('tag');

  // Update title if tag filter is present
  if (tagFilter && h1) {
    const tagLabel = tagFilter.charAt(0).toUpperCase() + tagFilter.slice(1);
    h1.textContent = `${tagLabel} — Groceries`;
  }
}