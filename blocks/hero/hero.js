import { fetchProductsByApiCategory } from '../../scripts/api.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Parse config rows — each row has: category slug
  const slides = [];

  block.innerHTML = '<div class="hero-loading">Loading...</div>';

  // Fetch one product per row for the slide image
  await Promise.all(rows.map(async (row) => {
    const category = row.children[0]?.textContent.trim().toLowerCase() === 'category'
      ? row.children[1]?.textContent.trim()
      : row.children[0]?.textContent.trim();

    if (!category) return;

    const products = await fetchProductsByApiCategory(category, 3);
    if (!products.length) return;

    // Pick a random product image from the category
    const product = products[Math.floor(Math.random() * products.length)];

    slides.push({
      category,
      image: product.images?.[0] || product.thumbnail,
      title: getCategoryTitle(category),
      subtitle: getCategorySubtitle(category),
      link: `/category/${category}`,
    });
  }));

  if (!slides.length) {
    block.innerHTML = '';
    return;
  }

  // Build slider
  const slider = document.createElement('div');
  slider.className = 'hero-slider';

  slides.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = `hero-slide${i === 0 ? ' active' : ''}`;
    el.innerHTML = `
      <div class="hero-slide-bg">
        <img src="${slide.image}" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}">
      </div>
      <div class="hero-slide-content">
        <h1>${slide.title}</h1>
        <p>${slide.subtitle}</p>
        <a href="${slide.link}" class="hero-slide-cta">Shop Now</a>
      </div>
    `;
    slider.append(el);
  });

  // Prev / Next arrows
  const prev = document.createElement('button');
  prev.className = 'hero-arrow hero-arrow-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = '&#8592;';

  const next = document.createElement('button');
  next.className = 'hero-arrow hero-arrow-next';
  next.setAttribute('aria-label', 'Next slide');
  next.innerHTML = '&#8594;';

  // Dots
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dots.append(dot);
  });

  block.innerHTML = '';
  block.append(slider, prev, next, dots);

  // Slider logic
  let current = 0;
  let autoplay;

  function goTo(index) {
    const allSlides = slider.querySelectorAll('.hero-slide');
    const allDots = dots.querySelectorAll('.hero-dot');
    allSlides[current].classList.remove('active');
    allDots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    allSlides[current].classList.add('active');
    allDots[current].classList.add('active');
  }

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
  }

  prev.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  next.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay(); });
  dots.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAutoplay(); goTo(i); startAutoplay(); });
  });

  startAutoplay();
}

// Helper functions for titles and subtitles
function getCategoryTitle(category) {
  const titles = {
    'womens-dresses': 'New Season Dresses',
    'mens-shoes': 'Step Up Your Style',
    'womens-jewellery': 'Shine Bright',
    'mens-watches': 'Timeless Elegance',
    'womens-shoes': 'Walk in Style',
    'mens-shirts': 'Sharp & Smart',
    'tops': 'Fresh Tops',
    'beauty': 'Glow Up',
    'fragrances': 'Find Your Scent',
    'skin-care': 'Healthy Skin',
    'womens-bags': 'Carry in Style',
    'womens-watches': 'Elegant Timepieces',
    'sunglasses': 'Look Sharp',
  };
  return titles[category] || 'Shop ShopEdge';
}

function getCategorySubtitle(category) {
  const subtitles = {
    'womens-dresses': 'Explore the latest dresses for every occasion.',
    'mens-shoes': 'From sneakers to formal — find your perfect pair.',
    'womens-jewellery': 'Rings, necklaces, bracelets and more.',
    'mens-watches': 'Classic and modern watches for every wrist.',
    'womens-shoes': 'Heels, flats, sandals and more.',
    'mens-shirts': 'Formal, casual and everything in between.',
    'tops': 'Trending tops for every style.',
    'beauty': 'Makeup and beauty essentials.',
    'fragrances': 'Discover your signature scent.',
    'skin-care': 'Glow with premium skincare.',
    'womens-bags': 'Handbags, totes, clutches and more.',
    'womens-watches': 'Elegant watches for every occasion.',
    'sunglasses': 'UV protection meets style.',
  };
  return subtitles[category] || 'Discover top-rated products at ShopEdge.';
}