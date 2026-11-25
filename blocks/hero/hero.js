import { fetchProductsByApiCategory } from '../../scripts/api.js';

function getCategoryTitle(category) {
  const titles = {
    'womens-dresses': 'New Season\nDresses',
    'mens-shoes': 'Step Up\nYour Style',
    'womens-jewellery': 'Shine\nBright',
    'mens-watches': 'Timeless\nElegance',
    'womens-shoes': 'Walk\nin Style',
    'mens-shirts': 'Sharp\n& Smart',
    tops: 'Fresh\nTops',
    beauty: 'Glow\nUp',
    fragrances: 'Find Your\nScent',
    'skin-care': 'Healthy\nSkin',
    'womens-bags': 'Carry\nin Style',
    'womens-watches': 'Elegant\nTimepieces',
    sunglasses: 'Look\nSharp',
    smartphones: 'Latest\nSmartphones',
    laptops: 'Power Your\nWorld',
    tablets: 'Work &\nPlay',
    'mobile-accessories': 'Gear\nUp',
    groceries: 'Fresh\nEssentials',
    furniture: 'Style Your\nSpace',
    'home-decoration': 'Decorate\nYour Home',
    'kitchen-accessories': 'Cook\nSmart',
  };
  return titles[category] || 'Shop\nShopEdge';
}

function getCategorySubtitle(category) {
  const subtitles = {
    'womens-dresses': 'Explore the latest dresses for every occasion.',
    'mens-shoes': 'From sneakers to formal — find your perfect pair.',
    'womens-jewellery': 'Rings, necklaces, bracelets and more.',
    'mens-watches': 'Classic and modern watches for every wrist.',
    'womens-shoes': 'Heels, flats, sandals and more.',
    'mens-shirts': 'Formal, casual and everything in between.',
    tops: 'Trending tops for every style.',
    beauty: 'Makeup and beauty essentials.',
    fragrances: 'Discover your signature scent.',
    'skin-care': 'Glow with premium skincare.',
    'womens-bags': 'Handbags, totes, clutches and more.',
    'womens-watches': 'Elegant watches for every occasion.',
    sunglasses: 'UV protection meets style.',
    smartphones: 'Latest phones from Apple, Samsung and more.',
    laptops: 'Powerful laptops for work and gaming.',
    tablets: 'iPads and Android tablets for every need.',
    'mobile-accessories': 'Cases, chargers, earphones and more.',
    groceries: 'Fresh and packaged food essentials.',
    furniture: 'Sofas, chairs and tables for every room.',
    'home-decoration': 'Beautiful decor for your living space.',
    'kitchen-accessories': 'Smart tools for your kitchen.',
  };
  return subtitles[category] || 'Discover top-rated products at ShopEdge.';
}

const SLIDE_CONFIG = [
  {
    category: 'womens-dresses',
    cta: 'Shop Dresses',
    link: '/category/womens-dresses',
    accent: '#e94560',
  },
  {
    category: 'mens-shoes',
    cta: 'Shop Shoes',
    link: '/category/mens-shoes',
    accent: '#1a1a2e',
  },
  {
    category: 'womens-jewellery',
    cta: 'Shop Jewellery',
    link: '/category/womens-jewellery',
    accent: '#c0a060',
  },
  {
    category: 'mens-watches',
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
        title: getCategoryTitle(config.category),
        subtitle: getCategorySubtitle(config.category),
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