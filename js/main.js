// HYGGE — The Block Puffer, No. 07
// Smooth scroll (Lenis) + scroll animations (GSAP / ScrollTrigger)

(() => {
  // Colour picker
  const colourName = document.querySelector('.colour-name');
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      swatches.forEach((s) => {
        s.classList.toggle('is-active', s === swatch);
        s.setAttribute('aria-checked', s === swatch ? 'true' : 'false');
      });
      colourName.textContent = swatch.dataset.name;
    });
  });

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  if (window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.12, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const ease = 'power4.out';
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/—_';

  // Scramble a short label, then settle on the real text
  const scramble = (el, delay = 0) => {
    const node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    const text = node.nodeValue;
    if (!text || text.length > 48) return;
    const state = { p: 0 };
    gsap.to(state, {
      p: 1, duration: 0.9, delay, ease: 'none',
      onUpdate: () => {
        const n = Math.floor(state.p * text.length);
        let out = text.slice(0, n);
        for (let i = n; i < text.length; i++) {
          out += text[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
        }
        node.nodeValue = out;
      },
      onComplete: () => { node.nodeValue = text; }
    });
  };

  // Hero: shutter opens on the photo, title wipes in, meta scrambles, number counts up
  const intro = gsap.timeline({ defaults: { ease } });
  intro
    .fromTo('.hero-photo', { clipPath: 'inset(46% 0% 46% 0%)', scale: 1.18 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.6, ease: 'expo.inOut' }, 0)
    .fromTo('.title-hero .line', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'steps(12)', stagger: 0.18 }, 1.1)
    .from('.title-hero .line', { yPercent: 40, duration: 1.1, stagger: 0.18 }, 1.1)
    .add(() => gsap.utils.toArray('.hero-meta .line').forEach((el, i) => scramble(el, i * 0.12)), 1.5)
    .from('.hero-meta .line', { opacity: 0, duration: 0.01, stagger: 0.12 }, 1.5)
    .from('.site-header', { yPercent: -100, duration: 0.8, ease: 'power3.out' }, 1.4);

  const count = document.querySelector('.count');
  if (count) {
    const target = parseInt(count.dataset.count, 10) || 0;
    const c = { v: 0 };
    intro.to(c, {
      v: target, duration: 1, ease: `steps(${Math.max(1, target)})`,
      onUpdate: () => { count.textContent = String(Math.round(c.v)).padStart(2, '0'); }
    }, 1.3);
  }

  // Ticker runs constantly; scroll direction flips it
  const ticker = gsap.to('.ticker-track', { xPercent: -50, repeat: -1, duration: 26, ease: 'none' });
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => gsap.to(ticker, { timeScale: self.direction === 1 ? 1 : -1, duration: 0.4, overwrite: true })
  });

  // Header hides scrolling down, returns scrolling up, gets a solid background past the hero
  const header = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 'top -120', end: 'max',
    onUpdate: (self) => gsap.to(header, { yPercent: self.direction === 1 ? -100 : 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }),
    onToggle: (self) => {
      header.dataset.mode = self.isActive ? 'page' : 'hero';
      gsap.to(header, { backgroundColor: self.isActive ? 'rgba(248,248,246,0.96)' : 'rgba(248,248,246,0)', duration: 0.3 });
    }
  });

  gsap.to('.hero-photo', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.title-hero', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Headings: lines rise in, staggered
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el.querySelectorAll('.line'), { yPercent: 110, duration: 1, ease, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // Section labels scramble in
  gsap.utils.toArray('p.label').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el) });
  });
  gsap.utils.toArray('.fade').forEach((el) => {
    gsap.from(el, { opacity: 0, duration: 0.6, ease: 'steps(4)', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Spec rows draw across
  gsap.utils.toArray('.spec').forEach((el) => {
    gsap.from(el, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.8, ease: 'steps(10)', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Photos: a black block lifts off in hard steps while the photo settles
  gsap.utils.toArray('.photo-frame').forEach((frame) => {
    const cover = frame.querySelector('.cover');
    const img = frame.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 82%', once: true } });
    if (cover) tl.fromTo(cover, { scaleY: 1 }, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.9, ease: 'steps(6)', immediateRender: true }, 0);
    if (img) tl.from(img, { scale: 1.25, duration: 1.4, ease: 'power3.out' }, 0);
  });

  // Ways to wear: the four blocks lift one after another
  gsap.timeline({ scrollTrigger: { trigger: '.ways', start: 'top 70%', once: true } })
    .fromTo('.way-cover', { scaleY: 1 }, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.8, ease: 'steps(6)', stagger: 0.15, immediateRender: true }, 0)
    .from('.way-photo img', { scale: 1.2, duration: 1.3, ease: 'power3.out', stagger: 0.15 }, 0);

  // Parallax
  gsap.utils.toArray('.parallax').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax) || 8;
    gsap.fromTo(el, { yPercent: -amount }, { yPercent: amount, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.fromTo('.bleed-photo', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.bleed', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // Ways to wear: pinned horizontal scroll on desktop
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = document.querySelector('.ways-track');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: '.ways', start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 1, invalidateOnRefresh: true }
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
