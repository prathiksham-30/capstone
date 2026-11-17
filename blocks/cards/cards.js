export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.append(...row.children);
    ul.appendChild(li);

    // Style the first <a> as a button
    const cta = li.querySelector('a');
    if (cta) cta.classList.add('button');
  });

  block.innerHTML = '';
  block.appendChild(ul);
}
