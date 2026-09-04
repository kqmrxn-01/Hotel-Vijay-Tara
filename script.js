// ============================================
//  HOTEL VIJAY TARA — Framer Motion Engine
//  Spring animations, Magnetic buttons,
//  Parallax, Counter, Particles, Stagger
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCursorGlow();
    initMotionEngine();
    initNavbar();
    initParallaxHero();
    initParticles();
    initCounterAnimation();
    initMagneticButtons();
    initBookingForm();
    initLightbox();
    initTestimonials();
    initBackToTop();
    initSmoothScroll();
});

// ===== PRELOADER =====
function initPreloader() {
    const preloader = document.getElementById('preloader');

    const hidePreloader = () => {
        setTimeout(() => preloader.classList.add('hidden'), 1200);
    };

    window.addEventListener('load', hidePreloader);
    // Fallback
    setTimeout(() => preloader.classList.add('hidden'), 3500);
}

// ===== CURSOR GLOW (Desktop only) =====
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || window.innerWidth < 768) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '0.4';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    // Smooth follow with spring-like physics
    function animateGlow() {
        const dx = mouseX - glowX;
        const dy = mouseY - glowY;
        // Spring constant — smaller = smoother
        glowX += dx * 0.08;
        glowY += dy * 0.08;
        glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

// ===== FRAMER MOTION ENGINE =====
// Intersection Observer-based staggered reveal
function initMotionEngine() {
    const elements = document.querySelectorAll('.motion-element');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const stagger = el.dataset.stagger;
                const delay = el.dataset.delay || 0;

                // Calculate stagger delay
                const staggerDelay = stagger !== undefined ? parseFloat(stagger) * 0.12 : 0;
                const totalDelay = parseFloat(delay) + staggerDelay;

                el.style.transitionDelay = `${totalDelay}s`;
                el.classList.add('in-view');

                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
        updateActiveLink();
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// ===== PARALLAX HERO =====
function initParallaxHero() {
    const heroBg = document.querySelector('.hero-bg img');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        if (scrollY < heroHeight) {
            // Parallax: image moves slower than scroll
            const translateY = scrollY * 0.35;
            const scale = 1 + scrollY * 0.0003;
            heroBg.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
    }, { passive: true });
}

// ===== FLOATING PARTICLES =====
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = (60 + Math.random() * 40) + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== COUNTER ANIMATION =====
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const start = performance.now();

    // Easing function — spring-like deceleration
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = target * easedProgress;

        if (isDecimal) {
            el.textContent = current.toFixed(1);
        } else {
            el.textContent = Math.floor(current).toLocaleString('en-IN');
        }

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            if (isDecimal) {
                el.textContent = target.toFixed(1);
            } else {
                el.textContent = target.toLocaleString('en-IN');
            }
        }
    }

    requestAnimationFrame(step);
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    if (window.innerWidth < 768) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic pull strength
            const strength = 0.25;
            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ===== BOOKING FORM =====
function initBookingForm() {
    const form = document.getElementById('bookingForm');
    const checkIn = document.getElementById('checkInDate');
    const checkOut = document.getElementById('checkOutDate');
    const roomType = document.getElementById('roomType');
    const guests = document.getElementById('guests');
    const summary = document.getElementById('bookingSummary');
    const summaryDetails = document.getElementById('summaryDetails');

    // Set min dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    checkIn.min = todayStr;
    checkIn.value = todayStr;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    checkOut.min = tomorrowStr;
    checkOut.value = tomorrowStr;

    checkIn.addEventListener('change', () => {
        const newMin = new Date(checkIn.value);
        newMin.setDate(newMin.getDate() + 1);
        checkOut.min = newMin.toISOString().split('T')[0];
        if (new Date(checkOut.value) <= new Date(checkIn.value)) {
            checkOut.value = newMin.toISOString().split('T')[0];
        }
        updateSummary();
    });

    checkOut.addEventListener('change', updateSummary);
    roomType.addEventListener('change', updateSummary);
    guests.addEventListener('change', updateSummary);

    function updateSummary() {
        if (!checkIn.value || !checkOut.value || !roomType.value) {
            summary.style.display = 'none';
            return;
        }

        const prices = { deluxe: 2499, executive: 3499, family: 4999 };
        const names = { deluxe: 'Deluxe Room', executive: 'Executive Room', family: 'Family Suite' };

        const inDate = new Date(checkIn.value);
        const outDate = new Date(checkOut.value);
        const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) { summary.style.display = 'none'; return; }

        const pricePerNight = prices[roomType.value];
        const total = pricePerNight * nights;
        const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        summaryDetails.innerHTML = `
            <div class="summary-item"><span class="label">Room</span><span class="value">${names[roomType.value]}</span></div>
            <div class="summary-item"><span class="label">Guests</span><span class="value">${guests.value}</span></div>
            <div class="summary-item"><span class="label">Check-in</span><span class="value">${fmtDate(inDate)}</span></div>
            <div class="summary-item"><span class="label">Check-out</span><span class="value">${fmtDate(outDate)}</span></div>
            <div class="summary-item"><span class="label">Duration</span><span class="value">${nights} Night${nights > 1 ? 's' : ''}</span></div>
            <div class="summary-item"><span class="label">Per Night</span><span class="value">₹${pricePerNight.toLocaleString('en-IN')}</span></div>
            <div class="summary-item summary-total"><span class="label">Total Amount</span><span class="value">₹${total.toLocaleString('en-IN')}</span></div>
        `;

        summary.style.display = 'block';
    }

    updateSummary();

    // Submit → WhatsApp
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const guestName = document.getElementById('guestName').value;
        const guestPhone = document.getElementById('guestPhone').value;
        const prices = { deluxe: 2499, executive: 3499, family: 4999 };
        const names = { deluxe: 'Deluxe Room', executive: 'Executive Room', family: 'Family Suite' };

        if (!roomType.value) { alert('Please select a room type.'); return; }

        const inDate = new Date(checkIn.value);
        const outDate = new Date(checkOut.value);
        const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        const total = prices[roomType.value] * nights;
        const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        const message = encodeURIComponent(
            `🏨 *BOOKING REQUEST — Hotel Vijay Tara*\n\n` +
            `👤 Name: ${guestName}\n` +
            `📞 Phone: ${guestPhone}\n` +
            `🛏️ Room: ${names[roomType.value]}\n` +
            `👥 Guests: ${guests.value}\n` +
            `📅 Check-in: ${fmtDate(inDate)}\n` +
            `📅 Check-out: ${fmtDate(outDate)}\n` +
            `🌙 Duration: ${nights} Night(s)\n` +
            `💰 Estimated Total: ₹${total.toLocaleString('en-IN')}\n\n` +
            `Please confirm availability. Thank you!`
        );

        window.open(`https://wa.me/918090054641?text=${message}`, '_blank');
    });
}

// Global function for room cards
function selectRoom(type) {
    const roomSelect = document.getElementById('roomType');
    roomSelect.value = type;
    roomSelect.dispatchEvent(new Event('change'));
}

// ===== LIGHTBOX =====
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    const images = [
        { src: 'images/gallery/hotel1.jpg', caption: 'Hotel Vijay Tara — Exterior' },
        { src: 'images/gallery/hotel2.jpg', caption: 'Grand Lobby' },
        { src: 'images/gallery/pool.jpg', caption: 'Swimming Pool' },
        { src: 'images/gallery/restaurant.jpg', caption: 'Fine Dining Restaurant' },
        { src: 'images/rooms/deluxe1.jpg', caption: 'Deluxe Room' },
        { src: 'images/gallery/conference.jpg', caption: 'Conference Hall' }
    ];

    let current = 0;

    window.openLightbox = function(index) {
        current = index;
        show(current);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function show(i) {
        lightboxImg.style.animation = 'none';
        lightboxImg.offsetHeight; // trigger reflow
        lightboxImg.style.animation = 'lbImgIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        lightboxImg.src = images[i].src;
        lightboxImg.alt = images[i].caption;
        lightboxCaption.textContent = images[i].caption;
        lightboxCounter.textContent = `${i + 1} / ${images.length}`;
    }

    function close() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    prevBtn.addEventListener('click', () => { current = (current - 1 + images.length) % images.length; show(current); });
    nextBtn.addEventListener('click', () => { current = (current + 1) % images.length; show(current); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
    });
}

// ===== TESTIMONIALS =====
function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    const dots = document.querySelectorAll('.t-dot');
    const prevBtn = document.getElementById('tPrev');
    const nextBtn = document.getElementById('tNext');
    const cards = track.querySelectorAll('.testimonial-card');
    let current = 0;
    let interval;

    function goTo(i) {
        current = i;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[current].classList.add('active');
    }

    function next() { goTo((current + 1) % cards.length); }
    function prev() { goTo((current - 1 + cards.length) % cards.length); }

    function startAuto() { interval = setInterval(next, 5000); }
    function stopAuto() { clearInterval(interval); }

    nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    dots.forEach(dot => {
        dot.addEventListener('click', () => { stopAuto(); goTo(parseInt(dot.dataset.i)); startAuto(); });
    });

    // Touch/swipe support
    let touchStart = 0;
    track.addEventListener('touchstart', (e) => { touchStart = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
        startAuto();
    });

    startAuto();
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
