'use strict';

// SKYLINE Apple-Inspired Landing Page - Fixed & Enhanced
// Fixed: ReferenceErrors, DOM timing, intervals, events, PDF handling, modals, null safety

// Data arrays FIRST to prevent ReferenceError
const projects = [
  { title: 'Skyline Residence I', desc: 'Modern architectural excellence with sustainable materials.', location: 'Miami, FL', size: '4,200 sq ft', year: '2023', img: 'house1.webp' },
  { title: 'Skyline Residence II', desc: 'Innovative design solutions featuring smart home integration.', location: 'Los Angeles, CA', size: '5,100 sq ft', year: '2023', img: 'house2.webp' },
  { title: 'Skyline Residence III', desc: 'Sustainable living spaces with solar panels and green roof.', location: 'Seattle, WA', size: '3,800 sq ft', year: '2024', img: 'house3.webp' },
  { title: 'Skyline Residence IV', desc: 'Luxury contemporary homes with panoramic ocean views.', location: 'Malibu, CA', size: '6,500 sq ft', year: '2022', img: 'house4.webp' },
  { title: 'Skyline Residence V', desc: 'Precision engineering and minimalist Japanese influences.', location: 'San Francisco, CA', size: '4,800 sq ft', year: '2023', img: 'house5.webp' },
  { title: 'Skyline Residence VI', desc: 'Elevated architecture with cantilevered design elements.', location: 'Austin, TX', size: '5,600 sq ft', year: '2024', img: 'house6.webp' },
  { title: 'Skyline Residence VII', desc: 'Future-forward designs incorporating biophilic principles.', location: 'Denver, CO', size: '4,000 sq ft', year: '2023', img: 'house7.webp' },
  { title: 'Skyline Residence VIII', desc: 'Timeless elegance meets cutting-edge technology.', location: 'New York, NY', size: '7,200 sq ft', year: '2022', img: 'house8.webp' },
  { title: 'Skyline Residence IX', desc: 'Architectural mastery with sculptural concrete forms.', location: 'Chicago, IL', size: '5,900 sq ft', year: '2024', img: 'house9.webp' },
  { title: 'Skyline Residence X', desc: 'Urban oasis with rooftop infinity pool.', location: 'Boston, MA', size: '3,500 sq ft', year: '2023', img: 'image10.webp' },
  { title: 'Skyline Residence XI', desc: 'Mountain modern retreat with floor-to-ceiling glass.', location: 'Aspen, CO', size: '6,200 sq ft', year: '2024', img: 'house11.webp' }
];

const featuredImages = [
  'house1.webp', 'house2.webp', 'house3.webp', 'house4.webp', 'house5.webp',
  'house6.webp', 'house7.webp', 'house8.webp', 'house9.webp', 'image10.webp', 'house11.webp'
];

function initApp() {
  // Global state - scoped now
  let currentIndex = 0;
  let featuredIndex = 0;
  let carouselInterval = null;
  let featuredInterval = null;
  let ticking = false;
  let uploadedPdfs = [];
  let currentProjectIndex = 0;
  let observer = null;

  // DOM Elements with null checks
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const carouselInner = document.querySelector('.carousel-inner');
  const carouselItems = document.querySelectorAll('.carousel-item');
  const carouselPrev = document.querySelector('.carousel-prev');
  const carouselNext = document.querySelector('.carousel-next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  const contactForm = document.getElementById('contactForm');
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const ctaButton = document.querySelector('.cta-button');
  const pdfDropZone = document.getElementById('pdfDropZone');
  const pdfPreviewList = document.getElementById('pdfPreviewList');
  const pdfProgress = document.getElementById('pdfProgress');
  const scrollBtn = document.getElementById('scrollToTop');
  const carouselContainer = document.querySelector('.carousel');
  const modal = document.getElementById('projectModal');
  const contactPopup = document.getElementById('contactPopup');

  if (!hamburger || !navLinks || carouselItems.length === 0) {
    console.warn('Missing critical DOM elements');
    return;
  }

  const totalItems = carouselItems.length;

  // Standard email regex - accepts all valid emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  // Featured photo helper
  function setFeaturedPhoto(index) {
    const featuredPhoto = document.getElementById('featured-photo');
    if (!featuredPhoto) return;
    featuredIndex = index % featuredImages.length;
    featuredPhoto.src = featuredImages[featuredIndex];
    featuredPhoto.alt = `House ${featuredIndex + 1}`;
    featuredPhoto.dataset.index = featuredIndex;
  }

  // Interval helpers - FIXED: always clear first
  function clearCarouselInterval() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  function clearFeaturedInterval() {
    if (featuredInterval) {
      clearInterval(featuredInterval);
      featuredInterval = null;
    }
  }

  function startCarouselInterval() {
    clearCarouselInterval();
    carouselInterval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % totalItems;
      showSlide(nextIndex);
    }, 5000);
  }

  function startFeaturedInterval() {
    clearFeaturedInterval();
    featuredInterval = setInterval(cycleFeaturedPhoto, 3000);
  }

// Hamburger Toggle - Now works on all screens
hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('nav-open');
    navLinks.classList.toggle('active');
  });

  // Smooth Scrolling & Mobile Nav Close (event delegation)
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^=\"#"]')) {
      e.preventDefault();
      const target = document.querySelector(e.target.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      navLinks.classList.remove('active');
    }
  });

  // Close mobile nav on outside click or backdrop
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('active')) return;
    
    const isNavClick = navLinks.contains(e.target) || hamburger.contains(e.target);
    if (!isNavClick) {
      document.body.classList.remove('nav-open');
      navLinks.classList.remove('active');
    }
  });

  // Hero animation - FIXED: now defined
  function animateHero() {
    if (heroTitle) heroTitle.classList.add('animate');
    if (heroSubtitle) heroSubtitle.classList.add('animate');
    if (ctaButton) ctaButton.classList.add('animate');
  }

  // Carousel Functionality - FIXED: dispatch event
  function showSlide(index) {
    carouselItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    // Dynamic indicators
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
      for (let i = 0; i < totalItems; i++) {
        const span = document.createElement('span');
        span.className = `indicator ${i === index ? 'active' : ''}`;
        span.addEventListener('click', () => showSlide(i));
        indicatorsContainer.appendChild(span);
      }
    }
    
    currentIndex = index;

    // Featured logic
    if (index === 0) {
      clearFeaturedInterval();
      setFeaturedPhoto(0);
      const featuredPhoto = document.getElementById('featured-photo');
      if (featuredPhoto) featuredPhoto.classList.remove('switching');
      setTimeout(startFeaturedInterval, 100);
    } else {
      clearFeaturedInterval();
    }

    // FIXED: Dispatch event
    document.dispatchEvent(new CustomEvent('carouselSlideChange', { detail: { index } }));
  }

  // Carousel controls
  if (carouselNext) carouselNext.addEventListener('click', () => {
    const nextIndex = (currentIndex + 1) % totalItems;
    showSlide(nextIndex);
  });

  if (carouselPrev) carouselPrev.addEventListener('click', () => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    showSlide(prevIndex);
  });

  // Initial carousel
  showSlide(0);
  startCarouselInterval();

  // Carousel hover pause/resume
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => {
      clearCarouselInterval();
      clearFeaturedInterval();
    });
    carouselContainer.addEventListener('mouseleave', () => {
      startCarouselInterval();
      if (currentIndex === 0) startFeaturedInterval();
    });
  }

  // Scroll effects
  function updateScroll() {
    const scrolled = window.pageYOffset;
    
    document.querySelectorAll('section').forEach((section, index) => {
      const rate = index * 0.2;
      section.style.transform = `translateY(${scrolled * rate * 0.1}px)`;
    });

    if (scrollBtn) {
      scrollBtn.classList.toggle('show', scrolled > 300);
    }
  }

  let rafId;
  window.addEventListener('scroll', () => {
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        updateScroll();
        rafId = null;
      });
    }
  });

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Intersection Observer for reveals
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${index * 0.1}s`;
        entry.target.style.animation = 'fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
      }
    });
  }, observerOptions);

  document.querySelectorAll('section, .stat, .testimonial, .service').forEach(el => {
    observer.observe(el);
  });

  // FIXED PDF Upload - Event Delegation + Static Structure
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async function compressPdfFile(file) {
    const compressThreshold = 50 * 1024; // 50KB
    if (!window.PDFLib || file.type !== 'application/pdf' || file.size <= compressThreshold) return file;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        useCompression: true
      });

      if (compressedBytes.byteLength > 0 && compressedBytes.byteLength < file.size) {
        return new File([compressedBytes], file.name, { type: file.type });
      }
    } catch (error) {
      console.warn('PDF compression failed:', error);
    }

    return file;
  }

  async function handlePdfFiles(files) {
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') continue;

      const compressedFile = await compressPdfFile(file);
      if (!uploadedPdfs.some(f => f.name === compressedFile.name && f.size === compressedFile.size)) {
        uploadedPdfs.push(compressedFile);
      }
    }
    updatePdfPreviews();
    syncPdfInputFiles();
  }

  function updatePdfPreviews() {
    pdfPreviewList.innerHTML = '';
    uploadedPdfs.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'pdf-preview-item';
      div.dataset.fileIndex = index;
      div.innerHTML = `
        <div class="pdf-preview-thumbnail">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div class="pdf-preview-info">
          <div class="pdf-preview-name">${file.name}</div>
          <div class="pdf-preview-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="pdf-preview-delete" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      `;
      pdfPreviewList.appendChild(div);
    });

    // Update dropzone text
    const dropText = pdfDropZone.querySelector('.drop-text');
    if (dropText) {
      dropText.textContent = uploadedPdfs.length > 0 
        ? `${uploadedPdfs.length} file${uploadedPdfs.length > 1 ? 's' : ''} selected` 
        : 'Drop your PDF files here or browse';
    }

    syncPdfInputFiles();
  }

  function syncPdfInputFiles() {
    const pdfInput = document.getElementById('pdfInput');
    if (!pdfInput) return;
    const dataTransfer = new DataTransfer();
    uploadedPdfs.forEach(file => dataTransfer.items.add(file));
    pdfInput.files = dataTransfer.files;
  }

  // PDF Event Delegation - FIXED: single listeners
  if (pdfDropZone) {
    pdfDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      pdfDropZone.classList.add('dragover');
    });

    pdfDropZone.addEventListener('dragleave', () => {
      pdfDropZone.classList.remove('dragover');
    });

pdfDropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        pdfDropZone.classList.remove('dragover');
        await handlePdfFiles(e.dataTransfer.files);
    });

    pdfDropZone.addEventListener('click', (e) => {
      if (e.target.matches('.browse-link')) {
        const pdfInput = document.getElementById('pdfInput');
        if (pdfInput) pdfInput.click();
      }
    });
  }

  const pdfInput = document.getElementById('pdfInput');
  if (pdfInput) {
    pdfInput.addEventListener('change', async (e) => {
      if (e.target.files) await handlePdfFiles(e.target.files);
    });
  }

  // PDF Preview Delegation
  document.addEventListener('click', (e) => {
    if (e.target.matches('.pdf-preview-delete, .pdf-preview-delete *')) {
      e.stopPropagation();
      const item = e.target.closest('.pdf-preview-item');
      if (item) {
        const index = parseInt(item.dataset.fileIndex);
        uploadedPdfs.splice(index, 1);
        updatePdfPreviews();
      }
    }
  });

  // Contact Form
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = contactForm.querySelector('[name="name"]');
      const emailInput = contactForm.querySelector('[name="email"]');
      const titleInput = contactForm.querySelector('[name="title"]');
      const fileField = contactForm.querySelector('[name="file"]');
      
      if (!nameInput || !emailInput || !titleInput || !fileField) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const title = titleInput.value.trim();

      if (!name || !email || !title) {
        showErrorModal('Please fill in all fields.');
        return;
      }

      if (!emailInput.checkValidity() || !emailRegex.test(email)) {
        showErrorModal('Please enter a valid email address.');
        return;
      }

      const fileSummary = uploadedPdfs.length > 0
        ? `Attached PDFs: ${uploadedPdfs.length}. ${uploadedPdfs.slice(0, 3).map(file => file.name).join(', ')}${uploadedPdfs.length > 3 ? ', ...' : ''}`
        : 'No files attached.';

      fileField.value = fileSummary;

      if (!window.emailjs || !window.emailjsConfig) {
        showErrorModal('Email service is not available. Please try again later.');
        return;
      }

      try {
        const result = await emailjs.sendForm(
          window.emailjsConfig.service_id,
          window.emailjsConfig.template_id,
          contactForm,
          window.emailjsConfig.public_key
        );

        showSuccessModal('Thank you! Your message was sent successfully.');
        contactForm.reset();
        uploadedPdfs = [];
        updatePdfPreviews();
      } catch (error) {
        console.error('EmailJS ERROR:', error);
        const errorMessage = (error && (error.text || error.message)) || 'Please try again later.';
        showErrorModal(`Unable to send your message. ${errorMessage}`);
      }
    });
  }

  // Overlap cards & Featured - FIXED: event delegation
  function cycleFeaturedPhoto() {
    const featuredPhoto = document.getElementById('featured-photo');
    if (!featuredPhoto) return;
    featuredPhoto.classList.add('switching');
    setFeaturedPhoto((featuredIndex + 1) % featuredImages.length);
    setTimeout(() => featuredPhoto.classList.remove('switching'), 200);
  }

  // Single delegation for overlap cards and project images
  document.addEventListener('click', (e) => {
    const target = e.target.closest('img[data-index], .overlap-card');
    if (!target || !modal) return;

    const index = parseInt(target.dataset.index);
    if (isNaN(index) || index < 0 || index >= projects.length) return;

    if (target.id === 'featured-photo' || target.classList.contains('overlap-card')) {
      // Update featured if overlap card
      if (target.classList.contains('overlap-card')) {
        setFeaturedPhoto(index);
      }
      openModal(index);
    }
  });

  // FIXED Modal - Single implementation, no duplicates
  function openModal(index) {
    currentProjectIndex = index;
    const project = projects[index];
    if (!project) return;

    if (modal) {
      document.getElementById('modalImage').src = project.img;
      document.getElementById('modalTitle').textContent = project.title;
      document.getElementById('modalDesc').textContent = project.desc;
      document.getElementById('modalLocation').textContent = project.location;
      document.getElementById('modalSize').textContent = project.size;
      document.getElementById('modalYear').textContent = project.year;
      modal.style.display = 'flex';
    }
  }

  // Modal controls delegation
  document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-close, [data-modal-close]')) {
      const modalEl = document.getElementById('projectModal');
      if (modalEl) modalEl.style.display = 'none';
    } else if (e.target.id === 'projectModal') {
      e.target.style.display = 'none';
    } else if (e.target.matches('#modalPrev')) {
      currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
      openModal(currentProjectIndex);
    } else if (e.target.matches('#modalNext')) {
      currentProjectIndex = (currentProjectIndex + 1) % projects.length;
      openModal(currentProjectIndex);
    }
  });

  // Re-init overlap on slide change
  document.addEventListener('carouselSlideChange', (e) => {
    if (e.detail.index === 0) {
      setTimeout(() => {
        setFeaturedPhoto(0);
        startFeaturedInterval();
      }, 100);
    }
  });

  // Preloader - moved inside
  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }

  // Testimonials stars only (buttons/scroll removed)
  const testimonialsStars = document.querySelectorAll('.testimonial .stars');
  function initStars() {
    testimonialsStars.forEach(starsContainer => {
      if (starsContainer) {
        const rating = parseInt(starsContainer.dataset.rating);
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('i');
          star.className = i <= rating ? 'fas fa-star' : 'far fa-star';
          starsContainer.appendChild(star);
        }
      }
    });
  }

  // Initialize stars on load
  initStars();

// Services see more toggle - NEW
document.addEventListener('click', (e) => {
  if (e.target.matches('.see-more-btn, .see-more-btn *')) {
    e.stopPropagation();
    const servicesSection = e.target.closest('.services');
    const servicesGrid = servicesSection.querySelector('.services-grid');
    const btn = servicesSection.querySelector('.see-more-btn');
    const isExpanded = servicesSection.classList.toggle('expanded');
    
    // Update button
    const btnText = btn.querySelector('.btn-text');
    const icon = btn.querySelector('i');
    btnText.textContent = isExpanded ? 'See Less' : 'See More';
    btn.setAttribute('aria-expanded', isExpanded);
    
    // Add hidden-service class for CSS targeting (services 4+)
    if (isExpanded) {
      servicesGrid.classList.remove('hidden-service');
    } else {
      servicesGrid.classList.add('hidden-service');
    }
  }
});

// Get In Touch Popup handling
document.addEventListener('click', (e) => {
  if (e.target.matches('.mailto-link')) {
    e.preventDefault(); // Prevent default mailto popup
    const popup = document.getElementById('contactPopup');
    if (popup) {
      popup.style.display = 'flex';
    }
  }
});

document.addEventListener('click', (e) => {
  const popup = document.getElementById('contactPopup');
  if (popup && (e.target.id === 'contactPopup' || e.target.classList.contains('popup-close'))) {
    popup.style.display = 'none';
  }
});

// Custom Modal Functions - Replaces all Chrome default alerts/popups
function showErrorModal(message) {
  const modal = document.getElementById('errorModal');
  const messageEl = document.getElementById('errorMessage');
  if (modal && messageEl) {
    messageEl.textContent = message;
    modal.style.display = 'flex';
  }
}

function showSuccessModal(message) {
  const modal = document.getElementById('successModal');
  const messageEl = document.getElementById('successMessage');
  if (modal && messageEl) {
    messageEl.textContent = message;
    modal.style.display = 'flex';
  }
}

// Close modals on backdrop click or close button (ESC key too)
document.addEventListener('click', (e) => {
  if (e.target.id === 'errorModal' || e.target.id === 'successModal' || e.target.classList.contains('modal-close') || e.target.id === 'errorCloseBtn') {
    const errorModal = document.getElementById('errorModal');
    const successModal = document.getElementById('successModal');
    if (errorModal) errorModal.style.display = 'none';
    if (successModal) successModal.style.display = 'none';
  }
});

// ESC key closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const errorModal = document.getElementById('errorModal');
    const successModal = document.getElementById('successModal');
    if (errorModal && errorModal.style.display === 'flex') errorModal.style.display = 'none';
    if (successModal && successModal.style.display === 'flex') successModal.style.display = 'none';
  }
});

// Initial animations
  setTimeout(() => {
    animateHero();
    hidePreloader();
  }, 1000);

  // Initial featured
  setFeaturedPhoto(0);
  startFeaturedInterval();
}

// FIXED: Single DOMContentLoaded wrapper for all
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

