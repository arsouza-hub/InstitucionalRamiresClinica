/* ============================================
   Dra. Érika Ramires — Odontologia Infantil
   Main JavaScript — Premium Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  PageLoader.init();
  ScrollAnimations.init();
  StickyHeader.init();
  MobileMenu.init();
  FAQAccordion.init();
  TestimonialsCarousel.init();
  LightboxGallery.init();
  CookieBanner.init();
  SmoothScroll.init();
  ActiveNav.init();
  InstagramAutoPause.init();
});

/* ============================================
   PAGE LOADER
   ============================================ */
const PageLoader = {
  init() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }, 600);
    });

    // Fallback: remove after 3s max
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 3000);
  }
};

/* ============================================
   SCROLL ANIMATIONS (IntersectionObserver)
   ============================================ */
const ScrollAnimations = {
  init() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elements.forEach((el) => observer.observe(el));
  }
};

/* ============================================
   STICKY HEADER
   ============================================ */
const StickyHeader = {
  init() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Check initial state
    handleScroll();
  }
};

/* ============================================
   MOBILE MENU
   ============================================ */
const MobileMenu = {
  init() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('mobile-menu');
    if (!toggle || !overlay) return;

    const links = overlay.querySelectorAll('.mobile-nav-link');

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
};

/* ============================================
   FAQ ACCORDION
   ============================================ */
const FAQAccordion = {
  init() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all
        items.forEach((i) => {
          i.classList.remove('active');
          const answer = i.querySelector('.faq-answer');
          if (answer) {
            answer.style.maxHeight = '0px';
          }
        });

        // Open clicked if wasn't active
        if (!isActive) {
          item.classList.add('active');
          const answer = item.querySelector('.faq-answer');
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        }
      });
    });
  }
};

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */
const TestimonialsCarousel = {
  currentIndex: 0,
  slidesPerView: 1,
  totalSlides: 0,
  autoPlayInterval: null,

  init() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    this.totalSlides = slides.length;

    this.updateSlidesPerView();
    this.createDots();
    this.bindButtons();
    this.startAutoPlay();

    window.addEventListener('resize', () => {
      this.updateSlidesPerView();
      this.goTo(Math.min(this.currentIndex, this.maxIndex()));
    });

    // Pause on hover
    const container = track.closest('.carousel-container');
    if (container) {
      container.addEventListener('mouseenter', () => this.stopAutoPlay());
      container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // Touch support
    let startX = 0;
    let isDragging = false;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
      isDragging = false;
      this.startAutoPlay();
    }, { passive: true });
  },

  updateSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1024) this.slidesPerView = 3;
    else if (width >= 768) this.slidesPerView = 2;
    else this.slidesPerView = 1;
  },

  maxIndex() {
    return Math.max(0, this.totalSlides - this.slidesPerView);
  },

  goTo(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex()));
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const offset = -(this.currentIndex * (100 / this.slidesPerView));
    track.style.transform = `translateX(${offset}%)`;
    this.updateDots();
  },

  next() {
    this.goTo(this.currentIndex >= this.maxIndex() ? 0 : this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex <= 0 ? this.maxIndex() : this.currentIndex - 1);
  },

  createDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    const totalDots = this.maxIndex() + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      dotsContainer.appendChild(dot);
    }
  },

  updateDots() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  },

  bindButtons() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
  },

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), 5000);
  },

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
};

/* ============================================
   LIGHTBOX GALLERY
   ============================================ */
const LightboxGallery = {
  init() {
    const overlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!overlay || !lightboxImg) return;

    const items = document.querySelectorAll('[data-lightbox]');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-lightbox');
        const alt = item.getAttribute('data-lightbox-alt') || '';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close handlers
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.lightbox-close')) {
        this.close(overlay);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        this.close(overlay);
      }
    });
  },

  close(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

/* ============================================
   COOKIE BANNER (LGPD)
   ============================================ */
const CookieBanner = {
  init() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    // Check if already consented
    if (localStorage.getItem('cookie-consent')) {
      const consent = JSON.parse(localStorage.getItem('cookie-consent'));
      if (consent.analytics) this.loadAnalytics();
      return;
    }

    // Show banner after 1 second
    setTimeout(() => banner.classList.add('visible'), 1000);

    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: true }));
        banner.classList.remove('visible');
        this.loadAnalytics();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: false }));
        banner.classList.remove('visible');
      });
    }
  },

  loadAnalytics() {
    // Google Analytics / GTM would be loaded here conditionally
    // Placeholder: Add your GA4/GTM script loading logic
    console.log('Analytics cookies accepted — load tracking scripts here.');
  }
};

/* ============================================
   SMOOTH SCROLL
   ============================================ */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
};

/* ============================================
   ACTIVE NAV HIGHLIGHTING
   ============================================ */
const ActiveNav = {
  init() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    let ticking = false;

    const handleScroll = () => {
      const scrollPos = window.pageYOffset + 120;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });
  }
};

/* ============================================
   INSTAGRAM AUTO-PAUSE
   Quando o usuário dá play em um vídeo, pausa
   os demais recarregando seus iframes.
   Usa window.blur: ao clicar dentro de um iframe
   cross-origin, a janela perde foco e
   document.activeElement aponta para o iframe ativo.
   ============================================ */
const InstagramAutoPause = {
  init() {
    // Aguarda embed.js do Instagram processar os blockquotes
    const setup = () => {
      window.addEventListener('blur', () => {
        // Pequeno delay para o browser atualizar activeElement
        requestAnimationFrame(() => {
          const active = document.activeElement;
          if (!active || active.tagName !== 'IFRAME') return;
          if (!active.closest('.instagram-embed-wrapper')) return;

          document.querySelectorAll('.instagram-embed-wrapper iframe').forEach(iframe => {
            if (iframe === active) return;

            // Recarrega o iframe para forçar pausa (única forma cross-origin)
            const src = iframe.src;
            iframe.src = '';
            setTimeout(() => { iframe.src = src; }, 50);
          });
        });
      });
    };

    // Garante que o embed.js já terminou de processar
    if (document.readyState === 'complete') {
      setup();
    } else {
      window.addEventListener('load', setup);
    }
  }
};
