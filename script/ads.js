/*
 * Najda DZ — Smart AdSense controller
 * يوزع الوحدات حسب نوع الصفحة، ويؤجل تهيئتها إلى قرب ظهورها.
 */
(function () {
    'use strict';

    const ADSENSE_CLIENT = 'ca-pub-5656416032906373';
    const AD_SELECTOR = '[data-ad-lazy]';
    const OBSERVER_OPTIONS = { root: null, rootMargin: '360px 0px', threshold: 0.01 };
    let adObserver = null;

    const slots = {
        feedOne: { slot: '7867079394', format: 'fluid', layoutKey: '-fr+56+4k-d4+74' },
        displayOne: { slot: '3143411927', format: 'auto', responsive: true },
        feedTwo: { slot: '8546947691', format: 'fluid', layoutKey: '-h9-h+8-jr+r8' },
        displayTwo: { slot: '1760836049', format: 'auto', responsive: true },
        feedThree: { slot: '6152718642', format: 'fluid', layoutKey: '-h6-l+d-jc+qd' },
        displayThree: { slot: '5508509362', format: 'auto', responsive: true },
        articleOne: { slot: '6118497380', format: 'fluid', layout: 'in-article' },
        articleTwo: { slot: '7319898418', format: 'fluid', layout: 'in-article' },
        recommendations: { slot: '6528123169', format: 'autorelaxed' }
    };

    function runWhenIdle(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1600 });
        } else {
            window.setTimeout(callback, 120);
        }
    }

    function getPageKind() {
        const path = window.location.pathname;
        if (path.endsWith('/') || path.endsWith('/index.html') || !path.includes('/pages/')) return 'home';
        if (document.querySelector('[id$="List"], .doctor-grid, .service-grid, .hospitals-grid, .pharmacy-grid')) return 'listing';
        return 'article';
    }

    function createAdContainer(config, className, label) {
        const container = document.createElement('aside');
        container.className = `ad-container ${className || ''}`.trim();
        container.dataset.adLazy = 'true';
        container.dataset.adPlacement = label || 'content';
        container.setAttribute('aria-label', 'إعلان');

        const slot = document.createElement('div');
        slot.className = 'ad-slot';
        slot.dataset.adFormat = config.format;
        slot.dataset.adPlacement = label || 'content';

        const adLabel = document.createElement('span');
        adLabel.className = 'ad-label';
        adLabel.textContent = 'إعلان';
        slot.appendChild(adLabel);

        const ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.dataset.adClient = ADSENSE_CLIENT;
        ad.dataset.adSlot = config.slot;
        ad.dataset.adFormat = config.format;
        if (config.layoutKey) ad.dataset.adLayoutKey = config.layoutKey;
        if (config.layout) ad.dataset.adLayout = config.layout;
        if (config.responsive) ad.dataset.fullWidthResponsive = 'true';
        if (config.layout === 'in-article') ad.style.textAlign = 'center';

        slot.appendChild(ad);
        container.appendChild(slot);
        return container;
    }

    function createFeedAd(config, position) {
        const container = createAdContainer(config, 'ad-grid-break', `feed-${position}`);
        container.dataset.adFeedPosition = String(position);
        return container;
    }

    function observeAd(container) {
        if (!container) return;
        if (adObserver) adObserver.observe(container);
        else initializeAd(container);
    }

    function collapseIfUnfilled(container, ad) {
        if (ad.getAttribute('data-ad-status') === 'unfilled') {
            container.classList.add('is-empty');
            container.setAttribute('aria-hidden', 'true');
        }
    }

    function watchAdStatus(container, ad) {
        if (!('MutationObserver' in window)) return;
        const observer = new MutationObserver(() => {
            const status = ad.getAttribute('data-ad-status');
            if (status === 'filled') {
                container.classList.add('is-loaded');
                observer.disconnect();
            } else if (status === 'unfilled') {
                collapseIfUnfilled(container, ad);
                observer.disconnect();
            }
        });
        observer.observe(ad, { attributes: true, attributeFilter: ['data-ad-status'] });
    }

    function initializeAd(container) {
        if (!container || container.dataset.adInitialized === 'true') return;
        const ad = container.querySelector('ins.adsbygoogle');
        if (!ad) {
            container.classList.add('is-empty');
            return;
        }

        container.dataset.adInitialized = 'true';
        watchAdStatus(container, ad);
        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch (error) {
            container.dataset.adError = 'true';
            console.warn('تعذر تهيئة إعلان AdSense:', error);
        }

        window.setTimeout(() => collapseIfUnfilled(container, ad), 9000);
    }

    function setupAdObserver() {
        if (!('IntersectionObserver' in window)) return;
        if (adObserver) return;
        adObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                initializeAd(entry.target);
                adObserver.unobserve(entry.target);
            });
        }, OBSERVER_OPTIONS);
    }

    function addStaticPlacements() {
        const hero = document.querySelector('.hero');
        const footer = document.querySelector('footer');
        const kind = getPageKind();

        if (hero && !document.querySelector('[data-ad-placement="hero-after"]')) {
            const heroAd = createAdContainer(slots.feedOne, 'ad-container--hero', 'hero-after');
            hero.insertAdjacentElement('afterend', heroAd);
        }

        if (kind === 'home') {
            const mainContent = document.querySelector('.main-content');
            if (mainContent && !document.querySelector('[data-ad-placement="home-services-after"]')) {
                const displayAd = createAdContainer(slots.displayOne, 'ad-container--display', 'home-services-after');
                mainContent.insertAdjacentElement('afterend', displayAd);
            }
        } else if (kind === 'article' && footer && !document.querySelector('[data-ad-placement="article-middle"]')) {
            const middleAd = createAdContainer(slots.articleOne, 'ad-container--in-article', 'article-middle');
            footer.parentNode.insertBefore(middleAd, footer);
        }

        if (footer && !document.querySelector('[data-ad-placement="footer-display"]')) {
            const displayConfig = kind === 'home' ? slots.displayThree : slots.displayTwo;
            const displayAd = createAdContainer(displayConfig, 'ad-container--display', 'footer-display');
            footer.parentNode.insertBefore(displayAd, footer);
        }

        if (footer && !document.querySelector('[data-ad-placement="footer-recommendations"]')) {
            const recommendations = createAdContainer(slots.recommendations, 'ad-container--recommendations', 'footer-recommendations');
            footer.parentNode.insertBefore(recommendations, footer);
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

    function syncListingAds(grid) {
        if (!grid || grid.dataset.adsSyncing === 'true') return;
        grid.dataset.adsSyncing = 'true';
        grid.dataset.adsInternalMutation = 'true';

        grid.querySelectorAll(':scope > .ad-grid-break').forEach((ad) => ad.remove());
        const cards = Array.from(grid.children).filter((child) => {
            return !child.classList.contains('ad-grid-break') && !child.classList.contains('spinner');
        });

        cards.forEach((card, index) => {
            const position = index + 1;
            if (position % 6 !== 0 || position >= cards.length) return;
            const config = position === 6 ? slots.feedTwo : slots.feedThree;
            const ad = createFeedAd(config, position);
            card.insertAdjacentElement('afterend', ad);
            observeAd(ad);
        });

        delete grid.dataset.adsSyncing;
        window.setTimeout(() => delete grid.dataset.adsInternalMutation, 0);
    }

    function observeListing(grid) {
        syncListingAds(grid);
        if (!('MutationObserver' in window)) return;
        let timer = null;
        const observer = new MutationObserver(() => {
            if (grid.dataset.adsSyncing === 'true' || grid.dataset.adsInternalMutation === 'true') return;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => syncListingAds(grid), 70);
        });
        observer.observe(grid, { childList: true });
    }

    function initAds() {
        addStaticPlacements();
        setupAdObserver();

        document.querySelectorAll(AD_SELECTOR).forEach(observeAd);
        getListingContainers().forEach(observeListing);
    }

    function start() {
        runWhenIdle(initAds);
    }

    window.NajdaAds = { init: initAds, observe: observeAd };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
