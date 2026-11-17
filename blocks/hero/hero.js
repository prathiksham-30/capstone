export default function decorate(block) {
  const row = block.firstElementChild;
  const cell = row?.firstElementChild;
  if (!cell) return;

  // Wrap content in a semantic container
  const content = document.createElement('div');
  content.className = 'hero-content';
  content.append(...cell.childNodes);
  block.innerHTML = '';
  block.appendChild(content);

  // Turn the last <a> into a styled CTA button
  const cta = content.querySelector('a');
  if (cta) cta.classList.add('button', 'primary');
}