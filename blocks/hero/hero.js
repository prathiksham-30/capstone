import { fetchProductsByApiCategory } from '../../scripts/api.js';

const SLIDE_CONFIG = [
  {
    category: 'womens-dresses',
    title: 'New Season\nDresses',
    subtitle: 'Explore the latest styles for every occasion.',
    cta: 'Shop Dresses',
    link: '/category/womens-dresses',
    accent: '#e94560',
  },
  {
    category: 'mens-shoes',
    title: 'Step Up\nYour Style',
    subtitle: 'From sneakers to formals — find your perfect pair.',
    cta: 'Shop Shoes',
    link: '/category/mens-shoes',
    accent: '#1a1a2e',
  },
  {
    category: 'womens-jewellery',
    title: 'Shine\nBright',
    subtitle: 'Rings, necklaces, bracelets and more.',
    cta: 'Shop Jewellery',
    link: '/category/womens-jewellery',
    accent: '#c0a060',
  },
  {
    category: 'mens-watches',
    title: 'Timeless\nElegance',
    subtitle: 'Classic and modern watches for every wrist.',
    cta: 'Shop Watches',
    link: '/category/mens-watches',
    accent: '#2c3e50',
  },
];

export default async function decorate(block) {
  block.innerHTML = '<div class="hero-loading"></div>';

  // Fetch one product per slide for image
  const slidesData = await Promise.all(
    SLIDE_CONFIG.map(async (config) => {
      const products = await fetchProductsByApiCategory(config.category, 5);
      // Pick product with best image (use images array not just thumbnail)
      const product = products.find((p) => p.images?.length > 0) || products[0];
      return {
        ...config,
        image: product?.images?.[0] || product?.thumbnail || '',
        productTitle: product?.title || '',
        productPrice: product?.price || '',
        productBrand: product?.brand || '',
      };
    })
  );

  block.innerHTML = '';

  // Build slider
  const slider = document.createElement('div');
  slider.className = 'hero-slider';

  slidesData.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = `hero-slide${i === 0 ? ' active' : ''}`;
    el.style.setProperty('--accent', slide.accent);

    el.innerHTML = `
      <div class="hero-slide-left">
        <div class="hero-slide-tag">${slide.category.replace(/-/g, ' ')}</div>
        <h1 class="hero-slide-title">${slide.title.replace('\n', '<br>')}</h1>
        <p class="hero-slide-subtitle">${slide.subtitle}</p>
        ${slide.productBrand ? `<p class="hero-slide-brand">${slide.productBrand}</p>` : ''}
        ${slide.productPrice ? `<p class="hero-slide-price">From <strong>$${slide.productPrice}</strong></p>` : ''}
        <a href="${slide.link}" class="hero-slide-cta">${slide.cta} →</a>
      </div>
      <div class="hero-slide-right">
        ${slide.image ? `<img src="${slide.image}" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}">` : ''}
        <div class="hero-slide-bg-circle"></div>
      </div>
    `;
    slider.append(el);
  });

  // Prev / Next arrows
  const prev = document.createElement('button');
  prev.className = 'hero-arrow hero-arrow-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`;

  const next = document.createElement('button');
  next.className = 'hero-arrow hero-arrow-next';
  next.setAttribute('aria-label', 'Next slide');
  next.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;

  // Dots
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  slidesData.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dots.append(dot);
  });

  block.append(slider, prev, next, dots);

  // Slider logic
  let current = 0;
  let autoplay;

  function goTo(index) {
    const allSlides = slider.querySelectorAll('.hero-slide');
    const allDots = dots.querySelectorAll('.hero-dot');
    allSlides[current].classList.remove('active');
    allDots[current].classList.remove('active');
    current = (index + slidesData.length) % slidesData.length;
    allSlides[current].classList.add('active');
    allDots[current].classList.add('active');
  }

  function start() { autoplay = setInterval(() => goTo(current + 1), 5000); }
  function stop() { clearInterval(autoplay); }

  prev.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
  next.addEventListener('click', () => { stop(); goTo(current + 1); start(); });
  dots.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); goTo(i); start(); });
  });

  start();
}