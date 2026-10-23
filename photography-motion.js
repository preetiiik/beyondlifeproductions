// Enlarge the text mask over a stationary photograph, matching the reference reveal.
(() => {
  const hero = document.querySelector('body:is([data-page="photography.html"],[data-page="films.html"]) .photography-type-hero');
  if (!hero) return;
  const gallery = hero.nextElementSibling;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const artwork = hero.querySelector('.love-letter-art');
  const letters = artwork.querySelector('text');
  const mask = artwork.querySelector('mask');
  const panels = artwork.querySelectorAll('rect');
  const image = artwork.querySelector('image');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  let frame = 0, previousTime = 0, displayed = 0, target = 0;
  let start = 0, distance = 1, artworkHeight = 300, baseline = 265, enabled = false;
  let galleryFade = 0;
  const fadeItems = gallery.querySelectorAll('.moment-journey-heading > *, .emotion-caption, .emotion-main, .emotion-inset, .featured-reel, .films-page-heading > *, .film-grid > figure, .films-page > .sample-note, .films-page > .outline-button');
  let fadeObserver;
  if ('IntersectionObserver' in window) {
    fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gallery-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold:.08 });
    fadeItems.forEach((item, index) => {
      item.classList.add('gallery-fade-item');
      item.style.setProperty('--fade-delay', `${(index % 3) * 50}ms`);
    });
  }
  let observing = false;
  function measure() {
    enabled = !reduced.matches && !document.body.classList.contains('motion-paused');
    hero.classList.toggle('has-scroll-zoom', enabled);
    gallery.classList.toggle('has-love-overlay', enabled);
    gallery.classList.toggle('gallery-motion-enabled', enabled);
    const height = enabled ? 1000 * innerHeight / Math.max(1, document.documentElement.clientWidth) : 300;
    artwork.setAttribute('viewBox', `0 0 1000 ${height}`);
    const viewportWidth = Math.max(1, document.documentElement.clientWidth);
    baseline = enabled ? 255 + 20 * 1000 / viewportWidth : 265;
    letters.setAttribute('y', String(baseline));
    hero.style.setProperty('--love-copy-top', `${baseline * viewportWidth / 1000 + 24}px`);
    mask.setAttribute('height', String(height));
    panels.forEach(panel => panel.setAttribute('height', String(height)));
    artworkHeight = height;
    image.setAttribute('height', String(height));
    start = hero.getBoundingClientRect().top + scrollY;
    distance = Math.max(1, hero.offsetHeight - innerHeight);
    if (!enabled) {
      gallery.inert = false;
      cancelAnimationFrame(frame); frame = 0;
      letters.removeAttribute('transform');
      return;
    }
    updateTarget();
  }
  function paint(time) {
    frame = 0;
    const delta = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    displayed += (target - displayed) * (1 - Math.exp(-delta / 85));
    if (Math.abs(target - displayed) < .0001) displayed = target;
    const growth = ease(clamp(displayed / .56));
    const scale = Math.exp(growth * Math.log(65));
    const focusX = 65;
    const focusY = baseline - 120;
    const centerX = focusX + (500 - focusX) * growth;
    const centerY = focusY + (artworkHeight / 2 - focusY) * growth;
    letters.setAttribute('transform', `matrix(${scale} 0 0 ${scale} ${centerX - focusX * scale} ${centerY - focusY * scale})`);
    const requestedReveal = ease(clamp((displayed - .52) / .4));
    galleryFade += (requestedReveal - galleryFade) * (1 - Math.exp(-delta / 100));
    if (Math.abs(requestedReveal - galleryFade) < .0001) galleryFade = requestedReveal;
    const reveal = galleryFade;
    // The opaque gallery covers the photo; do not fade to empty paper underneath.
    hero.style.setProperty('--love-opacity', '1');
    gallery.style.setProperty('--gallery-reveal', String(reveal));
    gallery.style.setProperty('--gallery-paper', String(reveal));
    gallery.style.setProperty('--gallery-visibility', reveal > .001 ? 'visible' : 'hidden');
    gallery.style.setProperty('--gallery-rise', `${(1 - reveal) * 18}px`);
    if (reveal > .02 && !observing && fadeObserver) {
      observing = true;
      fadeItems.forEach(item => fadeObserver.observe(item));
    }
    gallery.inert = reveal < .01;
    hero.style.setProperty('--love-copy-opacity', String(1 - ease(clamp(displayed / .3))));
    hero.style.setProperty('--love-copy-y', `${-displayed * 60}px`);
    if (displayed !== target || galleryFade !== requestedReveal) frame = requestAnimationFrame(paint);
    else previousTime = 0;
  }
  function updateTarget() {
    if (!enabled) return;
    target = clamp((scrollY - start) / distance);
    if (!frame) frame = requestAnimationFrame(paint);
  }
  addEventListener('scroll', updateTarget, { passive:true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  reduced.addEventListener('change', measure);
  new MutationObserver(measure).observe(document.body, { attributes:true, attributeFilter:['class'] });
  measure();
  document.fonts.ready.then(measure);
})();
