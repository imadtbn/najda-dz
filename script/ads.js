/*
 * Najda DZ — Empty content placeholders
 * يحتفظ بمواقع الحاويات السابقة فقط، من دون تحميل أو عرض أي إعلان.
 */
(function () {
    'use strict';

    const PLACEHOLDER_SELECTOR = '[data-placeholder-slot]';
    let placeholderObserver = null;

    function runWhenIdle(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1200 });
        } else {
            window.setTimeout(callback, 100);
        }
    }

    function createPlaceholder(className, placement) {
        const container = document.createElement('aside');
        container.className = `ad-container ${className || ''}`.trim();
        container.dataset.placeholderSlot = 'true';
        container.dataset.placeholderPlacement = placement || 'content';
        container.setAttribute('aria-hidden', 'true');

        const slot = document.createElement('div');
        slot.className = 'ad-slot ad-slot--empty';
        container.appendChild(slot);
        return container;
    }

    function observePlaceholder(container) {
        if (!container || !placeholderObserver) return;
        placeholderObserver.observe(container);
    }

    function setupObserver() {
        if ('IntersectionObserver' in window) {
            placeholderObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) placeholderObserver.unobserve(entry.target);
                });
            }, { rootMargin: '240px 0px', threshold: 0.01 });
        }
    }

    function getPageKind() {
        const path = window.location.pathname;
        if (path.endsWith('/') || path.endsWith('/index.html') || !path.includes('/pages/')) return 'home';
        if (document.querySelector('[id$="List"], .doctor-grid, .service-grid, .hospitals-grid, .pharmacy-grid')) return 'listing';
        return 'article';
    }

    function addStaticPlaceholders() {
        const hero = document.querySelector('.hero');
        const footer = document.querySelector('footer');
        const kind = getPageKind();

        if (hero && !document.querySelector('[data-placeholder-placement="hero-after"]')) {
            hero.insertAdjacentElement('afterend', createPlaceholder('ad-container--hero', 'hero-after'));
        }

        if (kind === 'home') {
            const mainContent = document.querySelector('.main-content');
            if (mainContent && !document.querySelector('[data-placeholder-placement="home-services-after"]')) {
                mainContent.insertAdjacentElement('afterend', createPlaceholder('ad-container--display', 'home-services-after'));
            }
        } else if (kind === 'article' && footer && !document.querySelector('[data-placeholder-placement="article-middle"]')) {
            footer.parentNode.insertBefore(createPlaceholder('ad-container--in-article', 'article-middle'), footer);
        }

        if (footer && !document.querySelector('[data-placeholder-placement="footer-display"]')) {
            footer.parentNode.insertBefore(createPlaceholder('ad-container--display', 'footer-display'), footer);
        }

        if (footer && !document.querySelector('[data-placeholder-placement="footer-recommendations"]')) {
            footer.parentNode.insertBefore(createPlaceholder('ad-container--recommendations', 'footer-recommendations'), footer);
        }
    }

    function getListingContainers() {
        const selectors = [
            '#hospitalsList', '#laboratoriesList', '#doctorList', '#pharmacyList',
            '#policeList', '#militaryList', '#civilDefenseList', '#depannageList',
            '.doctor-grid', '.service-grid', '.hospitals-grid', '.pharmacy-grid',
            '.laboratories-grid', '.police-grid', '.gendarmerie-grid', '.depannage-grid'
        ];
        return selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    }

    function syncListingPlaceholders(grid) {
        if (!grid || grid.dataset.placeholderSyncing === 'true') return;
        grid.dataset.placeholderSyncing = 'true';
        grid.dataset.placeholderMutation = 'true';

        grid.querySelectorAll(':scope > .ad-grid-break').forEach((placeholder) => placeholder.remove());
        const cards = Array.from(grid.children).filter((child) => {
            return !child.classList.contains('ad-grid-break') && !child.classList.contains('spinner');
        });

        cards.forEach((card, index) => {
            const position = index + 1;
            if (position % 6 !== 0 || position >= cards.length) return;
            const placeholder = createPlaceholder('ad-grid-break', `feed-${position}`);
            card.insertAdjacentElement('afterend', placeholder);
            observePlaceholder(placeholder);
        });

        delete grid.dataset.placeholderSyncing;
        window.setTimeout(() => delete grid.dataset.placeholderMutation, 0);
    }

    function observeListing(grid) {
        syncListingPlaceholders(grid);
        if (!('MutationObserver' in window)) return;
        let timer = null;
        const observer = new MutationObserver(() => {
            if (grid.dataset.placeholderSyncing === 'true' || grid.dataset.placeholderMutation === 'true') return;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => syncListingPlaceholders(grid), 70);
        });
        observer.observe(grid, { childList: true });
    }

    function initPlaceholders() {
        addStaticPlaceholders();
        setupObserver();
        document.querySelectorAll(PLACEHOLDER_SELECTOR).forEach(observePlaceholder);
        getListingContainers().forEach(observeListing);
    }

    function start() {
        runWhenIdle(initPlaceholders);
    }

    window.NajdaPlaceholders = { init: initPlaceholders, observe: observePlaceholder };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
