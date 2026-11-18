export default async function decorate(block) {
  const paras = block.querySelectorAll('p');
  paras.forEach((p) => {
    p.textContent = p.textContent.replace(/\d{4}/, new Date().getFullYear());
  });
}