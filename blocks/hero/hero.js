export default function decorate(block) {
  const slides = [...block.querySelectorAll(':scope > div')];
  if (slides.length === 0) return;

  const section = block.closest('.section');
  if (section && section === document.querySelector('main > .section')) {
    section.classList.add('hero-section');
    document.body.classList.add('has-hero-header');
  }

  // Wrap all slides in a slider container
  const slider = document.createElement('div');
  slider.className = 'hero-slider';

  slides.forEach((slide, i) => {
    slide.classList.add('hero-slide');
    if (i === 0) slide.classList.add('active');
    slider.append(slide);
  });

  block.textContent = '';
  block.append(slider);

  // Arrow buttons
  const prev = document.createElement('button');
  prev.className = 'hero-arrow hero-arrow-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = '&#8592;';

  const next = document.createElement('button');
  next.className = 'hero-arrow hero-arrow-next';
  next.setAttribute('aria-label', 'Next slide');
  next.innerHTML = '&#8594;';

  block.append(prev, next);

  // Dot indicators
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.append(dot);
  });
  block.append(dots);

  let current = 0;
  let autoplay;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots.children[current].classList.add('active');
  }

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
  }

  prev.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  next.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay(); });

  startAutoplay();
}