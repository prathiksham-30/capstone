import { fetchProductsByApiCategory } from '../../scripts/api.js';

function getCategoryMeta(category) {
  const meta = {
    'womens-dresses': { title: 'New Season Dresses', subtitle: 'Elegant styles for every occasion' },
    'mens-shoes': { title: 'Step Up Your Style', subtitle: 'From sneakers to formal — find your pair' },
    'womens-jewellery': { title: 'Shine Bright', subtitle: 'Rings, necklaces, bracelets and more' },
    'mens-watches': { title: 'Timeless Elegance', subtitle: 'Classic and modern watches for every wrist' },
    'womens-shoes': { title: 'Walk in Style', subtitle: 'Heels, flats, sandals and more' },
    'mens-shirts': { title: 'Sharp & Smart', subtitle: 'Formal, casual and everything in between' },
    'tops': { title: 'Fresh Tops', subtitle: 'Trending tops for every style' },
    'beauty': { title: 'Glow Up', subtitle: 'Premium makeup and skincare essentials' },
    'fragrances': { title: 'Find Your Scent', subtitle: 'Discover your signature fragrance' },
    'skin-care': { title: 'Healthy Skin', subtitle: 'Nourish and protect your skin' },
    'womens-bags': { title: 'Carry in Style', subtitle: 'Handbags, totes, clutches and more' },
    'womens-watches': { title: 'Elegant Timepieces', subtitle: 'Watches for every occasion' },
    'sunglasses': { title: 'Look Sharp', subtitle: 'UV protection meets style' },
  };
  return meta[category] || { title: 'Shop ShopEdge', subtitle: 'Discover top-rated products' };
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  block.innerHTML = '<div class="hero-loading"></div>';

  const slideData = await Promise.all(
    rows.map(async (row) => {
      const key = row.children[0]?.textContent.trim().toLowerCase();
      const val = row.children[1]?.textContent.trim();
      const category = key === 'category' ? val : key;
      if (!category) return null;
      const products = await fetchProductsByApiCategory(category, 5);
      if (!products.length) return null;
      const product = products[Math.floor(Math.random() * products.length)];
      const { title, subtitle } = getCategoryMeta(category);
      return {
        image: product.images?.[0] || product.thumbnail,
        title,
        subtitle,
        link: `/category/${category}`,
      };
    })
  );

  const slides = slideData.filter(Boolean);
  if (!slides.length) { block.innerHTML = ''; return; }

  const slider = document.createElement('div');
  slider.className = 'hero-slider';

  slides.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = `hero-slide${i === 0 ? ' active' : ''}`;
    el.innerHTML = `
      <div class="hero-bg"><img src="${slide.image}" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}"></div>
      <div class="hero-content">
        <span class="hero-eyebrow">New Collection</span>
        <h1>${slide.title}</h1>
        <p>${slide.subtitle}</p>
        <a href="${slide.link}" class="hero-cta">Shop Now</a>
      </div>
    `;
    slider.append(el);
  });

  const prev = document.createElement('button');
  prev.className = 'hero-arrow hero-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>`;

  const next = document.createElement('button');
  next.className = 'hero-arrow hero-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>`;

  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dots.append(dot);
  });

  block.innerHTML = '';
  block.append(slider, prev, next, dots);

  let current = 0;
  let timer;

  function goTo(n) {
    slider.querySelectorAll('.hero-slide')[current].classList.remove('active');
    dots.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slider.querySelectorAll('.hero-slide')[current].classList.add('active');
    dots.children[current].classList.add('active');
  }

  function start() { timer = setInterval(() => goTo(current + 1), 5000); }
  function stop() { clearInterval(timer); }

  prev.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
  next.addEventListener('click', () => { stop(); goTo(current + 1); start(); });
  [...dots.children].forEach((dot, i) => dot.addEventListener('click', () => { stop(); goTo(i); start(); }));
  start();
}
