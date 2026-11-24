export default function decorate(block) {
  // promo-banner is purely CSS driven — no JS needed
  // Just ensure the block structure is correct
  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => row.classList.add('promo-banner-row'));
}