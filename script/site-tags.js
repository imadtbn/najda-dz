/*
 * Najda DZ — Central tags and advertising loader
 *
 * Google Site Verification موجود في <head> كل صفحة.
 * Google Analytics 4 يعمل عبر Google tag المباشر لأن أداة Google لم تكتشفه داخل GTM.
 * إذا أُضيف GA4 لاحقاً داخل GTM، غيّر ga4Mode إلى gtm وأوقف Google tag المباشر لمنع تكرار page_view.
 * Microsoft Clarity يحتاج معرفه من لوحة Clarity؛ أبقيناه xxxxxxxx إلى حين توفيره.
 * AdSense: تم اعتماد معرّف الناشر ووحدات الإعلان الواردة في adsbygoogle.txt.
 */
(function () {
    'use strict';

    const CONFIG = Object.freeze({
        // معرف حاوية Google Tag Manager المقدم من المستخدم
        gtmId: 'GTM-WS74969S',
        // معرف Google Analytics 4 المقدم من المستخدم، ويُستخدم مباشرة لاكتشاف Google tag
        ga4Id: 'G-P957LE5SYX',
        // وضع direct مطلوب حالياً لاكتشاف Google tag بالمعرف المقدم.
        ga4Mode: 'direct',
        // ضع هنا معرف Microsoft Clarity: xxxxxxxxxx
        clarityId: 'xxxxxxxx',
        adsenseClient: 'ca-pub-5656416032906373'
    });

    const state = { gtm: false, ga4: false, clarity: false, adsense: false };
    const PLACEHOLDER = /^x+$/i;
    const hasValue = (value) => Boolean(value && !PLACEHOLDER.test(value));

    function runWhenIdle(callback, timeout) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: timeout || 1800 });
        } else {
            window.setTimeout(callback, 120);
        }
    }

    function hasScriptMatching(pattern) {
        return Array.from(document.scripts).some((script) => pattern.test(script.src));
    }

    function appendScript({ src, id, onLoad }) {
        const existing = document.getElementById(id) || Array.from(document.scripts).find((script) => script.src === src);
        if (existing) return existing;

        const script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.src = src;
        if (typeof onLoad === 'function') script.addEventListener('load', onLoad, { once: true });
        document.head.appendChild(script);
        return script;
    }

    function loadGtm() {
        if (state.gtm || !hasValue(CONFIG.gtmId) || hasScriptMatching(/googletagmanager\.com\/gtm\.js/i)) return;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': Date.now(),
            event: 'gtm.js'
        });
        if (hasValue(CONFIG.ga4Id) && CONFIG.ga4Mode === 'gtm') {
            window.dataLayer.push({
                event: 'najda.config',
                ga4_measurement_id: CONFIG.ga4Id
            });
        }
        appendScript({
            id: 'najda-gtm-loader',
            src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CONFIG.gtmId)}`
        });
        state.gtm = true;
    }

    function loadDirectGa4() {
        if (state.ga4 || CONFIG.ga4Mode !== 'direct' || !hasValue(CONFIG.ga4Id) || hasScriptMatching(/googletagmanager\.com\/gtag\/js/i)) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', CONFIG.ga4Id);
        appendScript({
            id: 'najda-ga4-loader',
            src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`
        });
        state.ga4 = true;
    }

    function loadClarity() {
        // عند توفر GTM، يجب أن تُدار Clarity من داخل الحاوية وليس من محمّل مباشر موازٍ.
        if (state.clarity || hasValue(CONFIG.gtmId) || !hasValue(CONFIG.clarityId) || hasScriptMatching(/clarity\.ms/i)) return;

        const clarity = function () {
            clarity.q.push(arguments);
        };
        clarity.q = [];
        window.clarity = window.clarity || clarity;
        appendScript({
            id: 'najda-clarity-loader',
            src: `https://www.clarity.ms/tag/${encodeURIComponent(CONFIG.clarityId)}`
        });
        state.clarity = true;
    }

    function getAdElements() {
        return Array.from(document.querySelectorAll('ins.adsbygoogle[data-ad-client]'));
    }

    function getAdContainer(ad) {
        return ad.closest('.ad-container, .ad-grid-break') || ad.parentElement;
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

    function initializeAdElements() {
        if (!window.adsbygoogle) window.adsbygoogle = [];
        getAdElements().forEach((ad) => {
            if (ad.dataset.siteTagQueued === 'true') return;
            const container = getAdContainer(ad);
            ad.dataset.siteTagQueued = 'true';
            if (container) watchAdStatus(container, ad);
            try {
                window.adsbygoogle.push({});
            } catch (error) {
                delete ad.dataset.siteTagQueued;
                console.warn('تعذر تهيئة وحدة AdSense:', error);
            }
        });
    }

    function loadAdSense() {
        const ads = getAdElements();
        if (!ads.length || state.adsense || !hasValue(CONFIG.adsenseClient)) return;

        const initialize = () => initializeAdElements();
        if (hasScriptMatching(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i)) {
            initialize();
            state.adsense = true;
            return;
        }

        const script = appendScript({
            id: 'najda-adsense-loader',
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CONFIG.adsenseClient)}`,
            onLoad: initialize
        });
        script.setAttribute('crossorigin', 'anonymous');
        state.adsense = true;
    }

    function setupAdsenseLazyLoading() {
        const containers = Array.from(document.querySelectorAll('.ad-container, .ad-grid-break'))
            .filter((container) => container.querySelector('ins.adsbygoogle[data-ad-client]'));
        if (!containers.length) return;

        if (!('IntersectionObserver' in window)) {
            runWhenIdle(loadAdSense, 2200);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                observer.disconnect();
                loadAdSense();
            }
        }, { rootMargin: '360px 0px', threshold: 0.01 });
        containers.forEach((container) => observer.observe(container));
    }

    function init() {
        loadGtm();
        loadDirectGa4();
        setupAdsenseLazyLoading();
        runWhenIdle(loadClarity, 2200);
    }

    window.NajdaSiteTags = {
        config: CONFIG,
        init,
        loadGtm,
        loadDirectGa4,
        loadClarity,
        loadAdSense
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
