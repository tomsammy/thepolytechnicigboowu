document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header scroll effect
  const header = document.querySelector('.header-area');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check immediately on load

  // 2. Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  // 3. Mobile Dropdown toggle
  const dropdownParents = document.querySelectorAll('.has-dropdown');
  
  dropdownParents.forEach(parent => {
    const link = parent.querySelector('.nav-link');
    
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Prevent standard navigation
        parent.classList.toggle('active');
      }
    });
  });

  // 4. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Animates once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // --- PHASE 1 ADMISSIONS GROWTH TRACKING & LEAD INTAKE ---

  // Event Helper Dispatcher (GA4 + Meta Pixel)
  const trackConversionEvent = (eventName, params = {}) => {
    console.log(`[Event Tracked: ${eventName}]`, params);
    
    // GA4 Dispatcher
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    
    // Meta Pixel Dispatcher
    if (typeof window.fbq === 'function') {
      if (eventName === 'generate_lead') {
        window.fbq('track', 'Lead', params);
      } else if (eventName === 'begin_checkout') {
        window.fbq('track', 'InitiateCheckout', params);
      } else if (eventName === 'contact') {
        window.fbq('track', 'Contact', params);
      } else {
        window.fbq('trackCustom', eventName, params);
      }
    }
  };

  // Track WhatsApp Clicks
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      trackConversionEvent('generate_lead', {
        method: 'whatsapp',
        destination: link.getAttribute('href')
      });
    });
  });

  // Track Direct Phone Call Clicks
  document.querySelectorAll('a[href*="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      trackConversionEvent('contact', {
        method: 'phone_call',
        phone: link.getAttribute('href')
      });
    });
  });

  // Track Online Form Apply Clicks
  document.querySelectorAll('a[href*="edukate.ng"]').forEach(link => {
    link.addEventListener('click', () => {
      trackConversionEvent('begin_checkout', {
        method: 'edukate_portal',
        url: link.getAttribute('href')
      });
    });
  });

  // Quick Enquiry Modal Handler
  const modalOverlay = document.getElementById('enquiryModalOverlay');
  const modalCloseBtn = document.getElementById('enquiryModalClose');
  const enquiryForm = document.getElementById('quickEnquiryForm');
  
  // Open Modal Triggers
  document.querySelectorAll('.open-enquiry-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        trackConversionEvent('open_enquiry_form');
      }
    });
  });

  // Close Modal Handler
  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Submit Enquiry Form -> Track Event + Redirect to Pre-filled WhatsApp
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('enquiryName').value.trim();
      const phone = document.getElementById('enquiryPhone').value.trim();
      const course = document.getElementById('enquiryCourse').value;
      const mode = document.getElementById('enquiryMode').value;
      const state = document.getElementById('enquiryState').value;

      trackConversionEvent('generate_lead', {
        lead_name: name,
        lead_phone: phone,
        course_interest: course,
        study_mode: mode,
        applicant_state: state
      });

      // Construct Pre-filled WhatsApp Message
      const whatsappMsg = `Hello Admissions Team! My name is ${name} (${phone}) from ${state} State. I am interested in enrolling for ${course} (${mode}) at The Polytechnic Igbo-Owu. Please guide me on admissions procedures.`;
      const encodedMsg = encodeURIComponent(whatsappMsg);
      const whatsappUrl = `https://wa.me/2348035257332?text=${encodedMsg}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Close Modal & Reset Form
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }
      enquiryForm.reset();
    });
  }
});
