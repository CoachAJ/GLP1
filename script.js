/**
 * Youngevity GLP 30-Day System
 * Core JavaScript — UID handling, sponsor rotation, animations
 */

(function () {
    'use strict';

    // ==========================================
    // APPROVED SPONSOR IDS (Database)
    // ==========================================
    const APPROVED_SPONSOR_IDS = [
        '101848575',
        '102707635',
        '102731242',
        '102807573',
        '100506163',
        '102860986'
    ];

    const CHECKOUT_BASE = 'https://ygy1.com/customer-checkout/v1.3/';
    const CHECKOUT_PARAMS = {
        'item-1': 'USYG700|1',
        'destroy': '1',
        'ga_id': 'UA-20019232-44',
        'redirect': 'http://dailywithdoc.com/thank-you'
    };

    const LEGAL_BASE = '.youngevity.com/us_en/';
    const LEGAL_PAGES = {
        'privacy-policy': 'privacy-policy',
        'terms-of-use': 'terms-of-use',
        'youngevity-data-protection-policy': 'youngevity-data-protection-policy'
    };

    // ==========================================
    // SPONSOR / UID LOGIC
    // ==========================================

    /**
     * Get a random sponsor ID from the approved list.
     */
    function getRandomSponsorId() {
        const index = Math.floor(Math.random() * APPROVED_SPONSOR_IDS.length);
        return APPROVED_SPONSOR_IDS[index];
    }

    /**
     * Check if a given UID is in the approved sponsor list.
     */
    function isApprovedUid(uid) {
        return APPROVED_SPONSOR_IDS.includes(String(uid).trim());
    }

    /**
     * Determine the active sponsor ID:
     * 1. Check URL for ?uid= parameter
     * 2. If valid (in approved list), use it and store in sessionStorage
     * 3. If not valid or not present, check sessionStorage
     * 4. If nothing stored, pick a random approved sponsor
     */
    function getActiveSponsorId() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUid = urlParams.get('uid');

        // If UID is in the URL
        if (urlUid && isApprovedUid(urlUid)) {
            sessionStorage.setItem('ygy_sponsor_uid', urlUid.trim());
            return urlUid.trim();
        }

        // Check sessionStorage for a previously stored valid UID
        const storedUid = sessionStorage.getItem('ygy_sponsor_uid');
        if (storedUid && isApprovedUid(storedUid)) {
            return storedUid;
        }

        // Fallback: random sponsor from approved list
        const randomId = getRandomSponsorId();
        sessionStorage.setItem('ygy_sponsor_uid', randomId);
        return randomId;
    }

    /**
     * Build the full checkout URL with the given sponsor ID.
     */
    function buildCheckoutUrl(sponsorId) {
        const params = new URLSearchParams();
        params.set('sponsorid', sponsorId);
        for (const [key, value] of Object.entries(CHECKOUT_PARAMS)) {
            params.set(key, value);
        }
        return CHECKOUT_BASE + '?' + params.toString();
    }

    /**
     * Update all checkout links on the page with the active sponsor ID.
     */
    function updateCheckoutLinks() {
        const sponsorId = getActiveSponsorId();
        const checkoutUrl = buildCheckoutUrl(sponsorId);

        // Update all links with class 'checkout-link'
        document.querySelectorAll('.checkout-link').forEach(function (link) {
            link.href = checkoutUrl;
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener');
        });

        // Update the hero CTA (which also links to order section, 
        // but we want the main checkout link to go directly)
        const heroCta = document.getElementById('hero-cta');
        if (heroCta) {
            heroCta.href = checkoutUrl;
            heroCta.setAttribute('target', '_blank');
            heroCta.setAttribute('rel', 'noopener');
        }

        // Update nav CTA link
        const navCta = document.querySelector('.nav-cta');
        if (navCta) {
            navCta.href = checkoutUrl;
            navCta.setAttribute('target', '_blank');
            navCta.setAttribute('rel', 'noopener');
        }
    }

    // ==========================================
    // DISTRIBUTOR ID DISPLAY
    // ==========================================

    /**
     * Display the active sponsor ID in the distributor badge
     * and in the footer distributor label.
     */
    function displayDistributorId() {
        const sponsorId = getActiveSponsorId();

        // Header badge
        var badgeId = document.getElementById('distributor-id');
        if (badgeId) {
            badgeId.textContent = sponsorId;
        }

        // Footer
        var footerId = document.getElementById('footer-distributor-id');
        if (footerId) {
            footerId.textContent = sponsorId;
        }

        // Hidden form field
        var formSponsor = document.getElementById('form-sponsor-id');
        if (formSponsor) {
            formSponsor.value = sponsorId;
        }
    }

    // ==========================================
    // LEGAL LINKS (UID-based)
    // ==========================================

    /**
     * Build legal page URLs using the active sponsor ID.
     * Format: https://{sponsorId}.youngevity.com/us_en/{page}
     */
    function updateLegalLinks() {
        var sponsorId = getActiveSponsorId();

        document.querySelectorAll('.legal-link').forEach(function (link) {
            var legalPage = link.getAttribute('data-legal');
            if (legalPage && LEGAL_PAGES[legalPage]) {
                link.href = 'https://' + sponsorId + LEGAL_BASE + LEGAL_PAGES[legalPage];
            }
        });
    }

    // ==========================================
    // CONTACT MODAL
    // ==========================================

    function initContactModal() {
        var overlay = document.getElementById('contact-modal-overlay');
        var closeBtn = document.getElementById('modal-close');
        var openBtn = document.getElementById('open-contact-modal');
        var footerBtn = document.getElementById('footer-contact-btn');

        function openModal() {
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (footerBtn) footerBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Close on overlay click (outside modal)
        if (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ==========================================
    // SCROLL REVEAL ANIMATIONS
    // ==========================================

    function initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });

            reveals.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show all
            reveals.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    // ==========================================
    // MOBILE NAV TOGGLE
    // ==========================================

    function initMobileNav() {
        const toggle = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links');

        if (toggle && links) {
            toggle.addEventListener('click', function () {
                links.classList.toggle('open');
                toggle.classList.toggle('active');
            });

            // Close menu when a link is clicked
            links.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () {
                    links.classList.remove('open');
                    toggle.classList.remove('active');
                });
            });
        }
    }

    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                // Don't smooth-scroll checkout links
                if (this.classList.contains('checkout-link')) return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ==========================================
    // NAV SCROLL EFFECT
    // ==========================================

    function initNavScroll() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', function () {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.background = 'rgba(10, 10, 15, 0.95)';
            } else {
                nav.style.background = 'rgba(10, 10, 15, 0.85)';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ==========================================
    // COPYRIGHT YEAR
    // ==========================================

    function setCopyrightYear() {
        const el = document.getElementById('copyright-year');
        if (el) {
            el.textContent = new Date().getFullYear();
        }
    }

    // ==========================================
    // PRESERVE UID ACROSS ALL LINKS
    // ==========================================

    /**
     * For any internal links on the page (non-checkout, non-anchor),
     * append the UID parameter so it carries through to other pages.
     */
    function preserveUidInLinks() {
        const urlParams = new URLSearchParams(window.location.search);
        const uid = urlParams.get('uid');

        if (uid && isApprovedUid(uid)) {
            // For any internal links that might go to other pages
            document.querySelectorAll('a').forEach(function (link) {
                const href = link.getAttribute('href');
                if (!href) return;

                // Skip anchors, checkout links, external links, pdf links, and legal links
                if (href.startsWith('#') ||
                    href.includes('ygy1.com') ||
                    href.includes('.pdf') ||
                    href.includes('youngevity.com') ||
                    link.classList.contains('checkout-link') ||
                    link.classList.contains('legal-link')) {
                    return;
                }

                // If it's a relative link (another page on the same site)
                if (href.startsWith('/') || href.startsWith('./') || (!href.startsWith('http') && !href.startsWith('mailto'))) {
                    const separator = href.includes('?') ? '&' : '?';
                    link.href = href + separator + 'uid=' + encodeURIComponent(uid);
                }
            });
        }
    }

    // ==========================================
    // INITIALIZE
    // ==========================================

    function init() {
        updateCheckoutLinks();
        displayDistributorId();
        updateLegalLinks();
        initContactModal();
        initRevealAnimations();
        initMobileNav();
        initSmoothScroll();
        initNavScroll();
        setCopyrightYear();
        preserveUidInLinks();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

