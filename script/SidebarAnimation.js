(() => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const header = document.querySelector('header');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const toggleBtn = document.getElementById('emergencyToggle');
    const emergencyMenu = document.getElementById('emergencyMenu');

    const closeNav = () => {
        navLinks?.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle?.setAttribute('aria-expanded', 'false');
    };

    const openNav = () => {
        navLinks?.classList.add('active');
        navOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        menuToggle?.setAttribute('aria-expanded', 'true');
    };

    menuToggle?.addEventListener('click', openNav);
    closeMenu?.addEventListener('click', closeNav);
    navOverlay?.addEventListener('click', closeNav);

    navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

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
            if (currentScroll > lastScrollTop && currentScroll > 100) {
                header.classList.add('hide-header');
            } else {
                header.classList.remove('hide-header');
            }
            lastScrollTop = currentScroll;
        }, { passive: true });
    }
})();
