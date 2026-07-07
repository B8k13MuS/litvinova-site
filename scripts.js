// ============================================
// MOBILE NAVIGATION
// ============================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Navbar scroll effect
if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// TESTIMONIALS SLIDER
// ============================================
const slider = document.getElementById('testimonialsSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (slider && prevBtn && nextBtn) {
    const cardWidth = slider.querySelector('.testimonial-card')?.offsetWidth + 24 || 424;

    prevBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
}

// ============================================
// CONTACT FORM VALIDATION & SUBMISSION
// ============================================
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
    const inputs = {
        name: document.getElementById('name'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email'),
        consent: document.getElementById('consent')
    };

    const errors = {
        name: document.getElementById('nameError'),
        phone: document.getElementById('phoneError'),
        email: document.getElementById('emailError'),
        consent: document.getElementById('consentError')
    };

    // Phone mask
    if (inputs.phone) {
        inputs.phone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('7') || value.startsWith('8')) {
                value = value.substring(1);
            }

            let formatted = '+7';
            if (value.length > 0) {
                formatted += ' (' + value.substring(0, 3);
            }
            if (value.length >= 3) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length >= 6) {
                formatted += '-' + value.substring(6, 8);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(8, 10);
            }

            e.target.value = formatted;
        });
    }

    // Validation functions
    function validateName(value) {
        return value.trim().length >= 2;
    }

    function validatePhone(value) {
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10;
    }

    function validateEmail(value) {
        if (!value) return true; // Optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showError(field, show) {
        const parent = field.closest('.form-group');
        if (show) {
            parent.classList.add('error');
        } else {
            parent.classList.remove('error');
        }
    }

    // Real-time validation
    Object.keys(inputs).forEach(key => {
        if (inputs[key] && key !== 'consent') {
            inputs[key].addEventListener('blur', () => {
                let isValid = false;
                switch (key) {
                    case 'name':
                        isValid = validateName(inputs[key].value);
                        break;
                    case 'phone':
                        isValid = validatePhone(inputs[key].value);
                        break;
                    case 'email':
                        isValid = validateEmail(inputs[key].value);
                        break;
                }
                showError(inputs[key], !isValid);
            });

            inputs[key].addEventListener('input', () => {
                showError(inputs[key], false);
            });
        }
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;

        if (!validateName(inputs.name.value)) {
            showError(inputs.name, true);
            isValid = false;
        }

        if (!validatePhone(inputs.phone.value)) {
            showError(inputs.phone, true);
            isValid = false;
        }

        if (!validateEmail(inputs.email.value)) {
            showError(inputs.email, true);
            isValid = false;
        }

        if (!inputs.consent.checked) {
            showError(inputs.consent, true);
            isValid = false;
        } else {
            showError(inputs.consent, false);
        }

        if (!isValid) return;

        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        // Check if Formspree is configured
        const formAction = contactForm.getAttribute('action');

        if (formAction && formAction.includes('formspree.io')) {
            // Formspree submission
            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showSuccess();
                } else {
                    showFallback();
                }
            } catch (error) {
                showFallback();
            }
        } else {
            // Fallback: simulate success or redirect to Telegram
            setTimeout(() => {
                showFallback();
            }, 1500);
        }
    });

    function showSuccess() {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        contactForm.reset();
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            formSuccess.hidden = true;
        }, 8000);
    }

    function showFallback() {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;

        // Create a mailto link or Telegram message
        const name = inputs.name.value;
        const phone = inputs.phone.value;
        const email = inputs.email.value;
        const format = document.getElementById('format')?.value || 'не указан';
        const message = document.getElementById('message')?.value || 'не указан';

        const telegramText = encodeURIComponent(
            `Заявка с сайта\n\n` +
            `Имя: ${name}\n` +
            `Телефон: ${phone}\n` +
            `Email: ${email || 'не указан'}\n` +
            `Формат: ${format}\n` +
            `Сообщение: ${message}`
        );

        // Show success message with Telegram link
        formSuccess.innerHTML = `
            <span class="success-icon">✓</span>
            <p>Спасибо! Для быстрой связи вы также можете написать мне в <a href="https://t.me/nadezhda_litvinova_coach" target="_blank" rel="noopener" style="color: var(--color-gold);">Telegram</a></p>
        `;
        formSuccess.hidden = false;
        contactForm.reset();

        // Open Telegram in new tab
        setTimeout(() => {
            window.open(`https://t.me/nadezhda_litvinova_coach?text=${telegramText}`, '_blank');
        }, 1000);

        setTimeout(() => {
            formSuccess.hidden = true;
        }, 10000);
    }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// LAZY LOAD IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ANIMATION ON SCROLL
// ============================================
if ('IntersectionObserver' in window) {
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                animateObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.problem-card, .method-card, .testimonial-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animateObserver.observe(el);
    });
}

// Add animated class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .animated {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
