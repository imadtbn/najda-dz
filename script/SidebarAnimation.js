(() => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const header = document.querySelector('header');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const toggleBtn = document.getElementById('emergencyToggle');
    const emergencyMenu = document.getElementById('emergencyMenu');

    // Shared, accessible icons for every page's navigation links.
    // Match by destination instead of label so wording variations stay supported.
    const navIcons = {
        'index.html': 'fa-house',
        'hospitals.html': 'fa-hospital',
        'pharmacies.html': 'fa-prescription-bottle-medical',
        'doctors.html': 'fa-user-doctor',
        'laboratories.html': 'fa-flask',
        'police.html': 'fa-shield',
        'gendarmerie.html': 'fa-shield-halved',
        'protectioncivil.html': 'fa-truck-medical',
        'depannage.html': 'fa-truck-pickup',
        'about.html': 'fa-circle-info',
        'contact.html': 'fa-envelope',
        'privacy.html': 'fa-lock',
        'guide.html': 'fa-triangle-exclamation',
        'subscription.html': 'fa-id-card'
    };

    if (navLinks) {
        if (!navLinks.hasAttribute('aria-label')) {
            navLinks.setAttribute('aria-label', 'التنقل الرئيسي');
        }

        navLinks.querySelectorAll('a[href]').forEach(link => {
            const destination = new URL(link.getAttribute('href'), document.baseURI);
            const filename = destination.pathname.split('/').pop() || 'index.html';
            if (!link.querySelector('.nav-link-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid ' + (navIcons[filename] || 'fa-link') + ' nav-link-icon';
                icon.setAttribute('aria-hidden', 'true');
                link.prepend(icon);
            }
            if (link.classList.contains('active') && !link.hasAttribute('aria-current')) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }
    menuToggle?.setAttribute('aria-controls', 'navLinks');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'فتح القائمة');
    closeMenu?.setAttribute('aria-label', 'إغلاق القائمة');

    const closeNav = () => {
        navLinks?.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'فتح القائمة');
    };

    const openNav = () => {
        navLinks?.classList.add('active');
        navOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        menuToggle?.setAttribute('aria-expanded', 'true');
        menuToggle?.setAttribute('aria-label', 'القائمة مفتوحة');
        header?.classList.remove('hide-header');
    };

    menuToggle?.addEventListener('click', openNav);
    closeMenu?.addEventListener('click', closeNav);
    navOverlay?.addEventListener('click', closeNav);

    navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navLinks?.classList.contains('active')) {
            closeNav();
            menuToggle?.focus();
        }
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1120 && navLinks?.classList.contains('active')) closeNav();
    }, { passive: true });

    if (scrollBtn) {
        scrollBtn.hidden = true;
        window.addEventListener('scroll', () => {
            scrollBtn.hidden = window.scrollY <= 300;
        }, { passive: true });
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (toggleBtn && emergencyMenu) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.addEventListener('click', event => {
            event.stopPropagation();
            const isOpen = emergencyMenu.classList.toggle('is-open');
            emergencyMenu.style.display = isOpen ? 'flex' : '';
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', event => {
            if (!event.target.closest('.floating-wrapper')) {
                emergencyMenu.classList.remove('is-open');
                emergencyMenu.style.display = '';
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (header) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = Math.max(window.scrollY || 0, 0);
            if (navLinks?.classList.contains('active')) {
                header.classList.remove('hide-header');
            } else if (currentScroll > lastScrollTop && currentScroll > 100) {
                header.classList.add('hide-header');
            } else {
                header.classList.remove('hide-header');
            }
            lastScrollTop = currentScroll;
        }, { passive: true });
    }
})();
