// Scroll animations and navigation interactions
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const revealItems = document.querySelectorAll('.reveal');
  const worldNodes = document.querySelectorAll('.world-node');
  const worldCards = document.querySelectorAll('.world-card');
  const heroBg = document.querySelector('.hero-bg');

  const setHeaderState = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', () => {
    setHeaderState();
    if (heroBg) {
      const offset = window.scrollY * 0.08;
      heroBg.style.transform = `translateY(${offset}px)`;
    }
  });
  setHeaderState();

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  const smoothAnchors = document.querySelectorAll('a[href^="#"]');
  smoothAnchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const scrollToTarget = (id) => {
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
  };

  worldNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const target = node.dataset.target;
      worldNodes.forEach((n) => n.classList.remove('active'));
      node.classList.add('active');
      scrollToTarget(target);
    });
  });

  worldCards.forEach((card) => {
    card.addEventListener('click', () => {
      const target = card.dataset.world;
      worldCards.forEach((c) => c.classList.remove('expanded'));
      card.classList.add('expanded');
      scrollToTarget(target);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -60px 0px' }
  );

  revealItems.forEach((el) => observer.observe(el));
});
