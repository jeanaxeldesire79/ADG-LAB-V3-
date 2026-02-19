// ==================================================
// GLOBAL VARIABLES & CONFIGURATION
// ==================================================
const CONFIG = {
    keycloak: {
        url: "http://localhost:8089",
        realm: "axel-dev-lab",
        clientId: "frontend-web"
    },
    animations: {
        scrollOffset: 100,
        staggerDelay: 80
    },
    typewriter: {
        messages: [
            "Latest insights from global development data",
            "New datasets and visualizations available",
            "Explore our research and policy recommendations"
        ],
        typingSpeed: 100,
        deletingSpeed: 50,
        pauseTime: 2000
    }
};

function formatPrimaryNumber(value, decimals = 0) {
    if (!Number.isFinite(value)) return '—';
    const rounded = Number(value.toFixed(decimals));
    const minFractionDigits = decimals && Math.abs(rounded - Math.round(rounded)) > 1e-9 ? decimals : 0;
    return rounded.toLocaleString(undefined, {
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: decimals
    });
}

function formatPercent(value, decimals = 1) {
    if (!Number.isFinite(value)) return '—';
    return `${formatPrimaryNumber(value, decimals)}%`;
}

function formatCurrency(value) {
    if (!Number.isFinite(value)) return '—';
    const rounded = Math.round(value);
    return `$${rounded.toLocaleString()}`;
}

function formatMillion(value, decimals = 1) {
    if (!Number.isFinite(value)) return '—';
    return `${formatPrimaryNumber(value, decimals)}M`;
}

const SNAPSHOT_REGIONS = {
    'west-africa': {
        countryCodes: ['BEN','BFA','CPV','CIV','GMB','GHA','GIN','GNB','LBR','MLI','MRT','NER','NGA','SEN','SLE','TGO']
    },
    'africa': {
        countryCodes: ['DZA','AGO','BEN','BWA','BFA','BDI','CMR','CPV','CAF','TCD','COM','COG','COD','CIV','DJI','EGY','GNQ','ERI','SWZ','ETH','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MUS','MAR','MOZ','NAM','NER','NGA','RWA','STP','SEN','SYC','SLE','SOM','ZAF','SSD','SDN','TZA','TGO','TUN','UGA','ZMB','ZWE']
    },
    'europe': {
        countryCodes: ['ALB','AND','ARM','AUT','AZE','BLR','BEL','BIH','BGR','HRV','CYP','CZE','DNK','EST','FIN','FRA','GEO','DEU','GRC','HUN','ISL','IRL','ITA','KAZ','LVA','LIE','LTU','LUX','MLT','MDA','MCO','MNE','NLD','MKD','NOR','POL','PRT','ROU','RUS','SMR','SRB','SVK','SVN','ESP','SWE','CHE','TUR','UKR','GBR']
    },
    'asia': {
        countryCodes: ['AFG','ARM','AZE','BHR','BGD','BTN','BRN','KHM','CHN','GEO','HKG','IND','IDN','IRN','IRQ','ISR','JPN','JOR','KAZ','KWT','KGZ','LAO','LBN','MAC','MYS','MDV','MNG','MMR','NPL','OMN','PAK','PHL','QAT','SAU','SGP','KOR','LKA','SYR','TWN','TJK','THA','TLS','TUR','TKM','ARE','UZB','VNM','YEM']
    },
    'latin-america': {
        countryCodes: ['ARG','ABW','BHS','BRB','BLZ','BOL','BRA','CHL','COL','CRI','CUB','DMA','DOM','ECU','SLV','GRD','GTM','GUY','HTI','HND','JAM','MEX','NIC','PAN','PRY','PER','KNA','LCA','VCT','SUR','TTO','URY','VEN']
    }
};

const SNAPSHOT_INDICATORS = {
    'gdp-growth': {
        wbIndicator: 'NY.GDP.MKTP.KD.ZG',
        transform: (value) => value,
        aggregate: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
        primaryDecimals: 1,
        animateTarget: (value) => Math.round(value),
        primaryFormatter: (value) => formatPrimaryNumber(value, 1),
        minFormatter: (value) => formatPercent(value, 1),
        maxFormatter: (value) => formatPercent(value, 1)
    },
    'gdp-capita': {
        wbIndicator: 'NY.GDP.PCAP.CD',
        transform: (value) => value,
        aggregate: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
        primaryDecimals: 0,
        animateTarget: (value) => Math.round(value),
        primaryFormatter: (value) => formatPrimaryNumber(value, 0),
        minFormatter: (value) => formatCurrency(value),
        maxFormatter: (value) => formatCurrency(value)
    },
    'population': {
        wbIndicator: 'SP.POP.TOTL',
        transform: (value) => value / 1e6,
        aggregate: (values) => values.reduce((acc, val) => acc + val, 0),
        primaryDecimals: 0,
        animateTarget: (value) => Math.round(value),
        primaryFormatter: (value) => formatPrimaryNumber(value, 0),
        minFormatter: (value) => formatMillion(value, 1),
        maxFormatter: (value) => formatMillion(value, 1)
    },
    'literacy': {
        wbIndicator: 'SE.ADT.LITR.ZS',
        transform: (value) => value,
        aggregate: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
        primaryDecimals: 1,
        animateTarget: (value) => Math.round(value),
        primaryFormatter: (value) => formatPrimaryNumber(value, 1),
        minFormatter: (value) => formatPercent(value, 1),
        maxFormatter: (value) => formatPercent(value, 1)
    }
};

const BASE_TRANSLATIONS = {
    en: {
        brand_lab_name: 'Axel Dev Lab',
        brand_group: 'Axel Dev Group LLC',
        brand_consulting_name: 'Axel Dev Consulting',
        brand_consulting_tagline: 'Strategic Solutions, Grounded in Data.',
        brand_contact_email: 'info@axeldevlab.com',
        motto_lab: 'Mapping Ideas, Powering Progress.',
        nav_home: 'Home',
        nav_projects: 'Projects',
        nav_wb: 'AIX Exchange: Country Benchmarking',
        nav_data: 'Data',
        nav_data_portal: 'Data Portal',
        nav_data_dashboards: 'Dashboards',
        nav_data_maps: 'Maps',
        nav_data_datasets: 'Datasets',
        nav_data_note: 'Note: AIX requires secure sign-in.',
        nav_methodology: 'Methodology',
        nav_publications: 'Publications',
        nav_collaborate: 'Collaborate',
        nav_media: 'Media',
        nav_about: 'About',
        footer_nav_heading: 'Navigate',
        footer_contact_heading: 'Contact',
        footer_contact_text: 'Reach the team at',
        footer_tagline: 'Transforming global development through data intelligence and strategic policy insights.',
        footer_address_line1: '502 W 7th St, Ste 100',
        footer_address_line2: 'Erie, PA 16502',
        footer_address_line3: 'United States',
        footer_rights: '© <span id="year"></span> Axel Dev Group LLC. All rights reserved.'
    },
    fr: {
        brand_lab_name: 'Axel Dev Lab',
        brand_group: 'Axel Dev Group LLC',
        brand_consulting_name: 'Axel Dev Consulting',
        brand_consulting_tagline: 'Des solutions stratégiques fondées sur les données.',
        brand_contact_email: 'info@axeldevlab.com',
        motto_lab: 'Cartographier les idées, alimenter le progrès.',
        nav_home: 'Accueil',
        nav_projects: 'Projets',
        nav_wb: 'AIX Exchange : Benchmark pays',
        nav_data: 'Données',
        nav_data_portal: 'Portail Données',
        nav_data_dashboards: 'Tableaux de bord',
        nav_data_maps: 'Cartes',
        nav_data_datasets: 'Jeux de données',
        nav_data_note: 'Note : AIX nécessite une connexion sécurisée.',
        nav_methodology: 'Méthodologie',
        nav_publications: 'Publications',
        nav_collaborate: 'Collaborer',
        nav_media: 'Médias',
        nav_about: 'À propos',
        footer_nav_heading: 'Navigation',
        footer_contact_heading: 'Contact',
        footer_contact_text: 'Contactez l’équipe à',
        footer_tagline: 'Transformer le développement mondial grâce à l’intelligence des données et à des analyses stratégiques.',
        footer_address_line1: '502 W 7th St, Ste 100',
        footer_address_line2: 'Erie (Pennsylvanie) 16502',
        footer_address_line3: 'États-Unis',
        footer_rights: '© <span id="year"></span> Axel Dev Group LLC. Tous droits réservés.'
    }
};

let currentLanguage = (localStorage.getItem('lang') || 'en').toLowerCase();

let policyChart = null;

function getMergedTranslations(lang) {
    const base = BASE_TRANSLATIONS[lang] || {};
    const page = (window.PAGE_TRANSLATIONS && (window.PAGE_TRANSLATIONS[lang] || {})) || {};
    return { ...base, ...page };
}

function applyTranslations(lang) {
    const langKey = lang.toLowerCase();
    const translations = getMergedTranslations(langKey);
    document.documentElement.setAttribute('lang', langKey);

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((el) => {
        const key = el.dataset.i18n;
        if (!key) return;

        const attrType = el.dataset.i18nAttr;

        if (!el.dataset.i18nEn) {
            if (attrType === 'placeholder' && 'placeholder' in el) {
                el.dataset.i18nEn = el.placeholder || '';
            } else if (attrType === 'value' && 'value' in el) {
                el.dataset.i18nEn = el.value || '';
            } else if (attrType === 'html') {
                el.dataset.i18nEn = el.innerHTML.trim();
            } else if (attrType) {
                el.dataset.i18nEn = el.getAttribute(attrType) || '';
            } else {
                el.dataset.i18nEn = el.textContent.trim();
            }
        }

        const fallback = langKey === 'fr' ? (el.dataset.i18nFr || el.dataset.i18nEn) : el.dataset.i18nEn;
        const translation = translations[key]
            || (langKey === 'fr' ? el.dataset.i18nFr : el.dataset.i18nEn)
            || fallback;

        if (!translation) return;

        if (attrType === 'placeholder' && 'placeholder' in el) {
            el.placeholder = translation;
        } else if (attrType === 'value' && 'value' in el) {
            el.value = translation;
        } else if (attrType === 'html') {
            el.innerHTML = translation;
        } else if (attrType) {
            el.setAttribute(attrType, translation);
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });

    const titleKey = translations.page_title || translations.title;
    if (titleKey) {
        document.title = titleKey;
    }

    const updateMeta = (selector, value) => {
        if (!value) return;
        document.querySelectorAll(selector).forEach((meta) => {
            meta.setAttribute('content', value);
        });
    };

    updateMeta('meta[name="description"]', translations.meta_description);
    updateMeta('meta[property="og:title"]', translations.og_title || titleKey);
    updateMeta('meta[property="og:description"]', translations.og_description || translations.meta_description);
    updateMeta('meta[name="twitter:title"]', translations.twitter_title || titleKey);
    updateMeta('meta[name="twitter:description"]', translations.twitter_description || translations.meta_description);

    const selectorMap = translations.__selectors;
    if (selectorMap && typeof selectorMap === 'object') {
        Object.entries(selectorMap).forEach(([selector, value]) => {
            if (!selector) return;
            const targets = document.querySelectorAll(selector);
            if (!targets.length) return;
            targets.forEach((el) => {
                if (value && typeof value === 'object') {
                    if (Object.prototype.hasOwnProperty.call(value, 'text')) {
                        el.textContent = value.text;
                    }
                    if (Object.prototype.hasOwnProperty.call(value, 'html')) {
                        el.innerHTML = value.html;
                    }
                    if (value.attr && typeof value.attr === 'object') {
                        Object.entries(value.attr).forEach(([attr, attrVal]) => {
                            el.setAttribute(attr, attrVal);
                        });
                    }
                } else if (value !== undefined && value !== null) {
                    el.textContent = value;
                }
            });
        });
    }
}

// ==================================================
// INITIALIZATION
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
console.log('Axel Dev Lab — Initializing application');
    
    // Initialize all modules
    initializeKeycloak();
    initializeTheme();
    initializeTypewriter();
    initializeScrollAnimations();
    initializeGSAPAnimations();
    initializeInteractiveElements();
    initializeCardGradientInteractions();
    initializeMobileMenu();
    applyTranslations(currentLanguage);
    document.dispatchEvent(new CustomEvent('axel:language-change', { detail: { lang: currentLanguage } }));
    initializeLanguageToggle();
    initSnapshot();
    initializeGlobe();
    initializeSnapLanding();
    initializeStickyScene();
    initializeHeroVideo();
    initializePillNavigation();
    
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Fade in body
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('✅ Application initialized successfully');
});

// ==================================================
// KEYCLOAK AUTHENTICATION
// ==================================================
function initializeKeycloak() {
    if (typeof Keycloak === 'undefined') {
        console.warn('Keycloak library not loaded');
        return;
    }

    const keycloak = new Keycloak({
        url: CONFIG.keycloak.url,
        realm: CONFIG.keycloak.realm,
        clientId: CONFIG.keycloak.clientId
    });

    keycloak.init({ onLoad: 'check-sso' }).then(authenticated => {
        console.log("Keycloak initialized, authenticated:", authenticated);
        updateAuthUI(authenticated, keycloak);
    }).catch(err => {
        console.error("Keycloak init failed:", err);
        // Fallback: show login button even if Keycloak fails
        document.getElementById('loginBtn').style.display = 'inline-flex';
    });

    function updateAuthUI(authenticated, keycloak) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const logoutBtn = document.getElementById('logoutBtn');

        if (authenticated) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.classList.remove('hidden');
            if (userName) userName.textContent = keycloak.tokenParsed?.preferred_username || 'User';
            
            // Check for admin role
            if (keycloak.tokenParsed?.roles?.includes('admin')) {
                const adminLink = document.getElementById('adminLink');
                if (adminLink) adminLink.classList.remove('hidden');
            }
        } else {
            // User is logged out
            if (loginBtn) {
                loginBtn.style.display = 'inline-flex';
                loginBtn.addEventListener('click', () => window.location.href = '/logins/index.html');
            }
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                keycloak.logout({ redirectUri: window.location.origin });
            });
        }

        // User dropdown functionality
        const userChip = document.getElementById('userChip');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userChip && userDropdown) {
            userChip.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }
    }
}

// ==================================================
// THEME MANAGEMENT (DARK/LIGHT MODE)
// ==================================================
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    // Load saved theme or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);
    
    // Desktop theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile theme toggle
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    function toggleTheme() {
        startThemeTransition();
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    function setThemeMeta(theme) {
        const lightMeta = document.querySelector('meta[name="theme-color"][media*="light"]');
        const darkMeta = document.querySelector('meta[name="theme-color"][media*="dark"]');
        if (theme === 'dark') {
            if (darkMeta) darkMeta.setAttribute('content', '#111827');
            if (lightMeta) lightMeta.setAttribute('content', '#ffffff');
        } else {
            if (lightMeta) lightMeta.setAttribute('content', '#ffffff');
            if (darkMeta) darkMeta.setAttribute('content', '#111827');
        }
    }

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');
        const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');
        
        if (isDark) {
            document.documentElement.classList.add('dark');
            updateThemeIcons(true);
        } else {
            document.documentElement.classList.remove('dark');
            updateThemeIcons(false);
        }

        setThemeMeta(theme);
        updatePolicyChartTheme();

        function updateThemeIcons(isDark) {
            if (isDark) {
                if (darkIcon) darkIcon.classList.add('hidden');
                if (lightIcon) lightIcon.classList.remove('hidden');
                if (mobileDarkIcon) mobileDarkIcon.classList.add('hidden');
                if (mobileLightIcon) mobileLightIcon.classList.remove('hidden');
            } else {
                if (lightIcon) lightIcon.classList.add('hidden');
                if (darkIcon) darkIcon.classList.remove('hidden');
                if (mobileLightIcon) mobileLightIcon.classList.add('hidden');
                if (mobileDarkIcon) mobileDarkIcon.classList.remove('hidden');
            }
        }
    }

    // Adds a short-lived class to smoothly animate color changes
    function startThemeTransition() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const root = document.documentElement;
        root.classList.add('theme-transition');
        window.setTimeout(() => root.classList.remove('theme-transition'), 250);
    }
}

// ==================================================
// TYPEWRITER EFFECT
// ==================================================
function initializeTypewriter() {
    const typeTarget = document.getElementById('typeTarget');
    if (!typeTarget) return;

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function typeWriter() {
        if (isPaused) return;

        const currentMessage = CONFIG.typewriter.messages[messageIndex];
        
        if (isDeleting) {
            typeTarget.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typeTarget.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? CONFIG.typewriter.deletingSpeed : CONFIG.typewriter.typingSpeed;

        if (!isDeleting && charIndex === currentMessage.length) {
            typeSpeed = CONFIG.typewriter.pauseTime;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % CONFIG.typewriter.messages.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    // Start typewriter
    typeWriter();

    // Pause typewriter when tab is not visible
    document.addEventListener('visibilitychange', function() {
        isPaused = document.hidden;
        if (!isPaused) {
            typeWriter();
        }
    });
}

// ==================================================
// SCROLL ANIMATIONS
// ==================================================
function initializeScrollAnimations() {
    // Reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('in');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Fade and slide animations
    const fadeElems = document.querySelectorAll('.fade-in');
    const slideLeftElems = document.querySelectorAll('.slide-in-left');
    const slideRightElems = document.querySelectorAll('.slide-in-right');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    [...fadeElems, ...slideLeftElems, ...slideRightElems].forEach(elem => {
        scrollObserver.observe(elem);
    });

    // Header scroll effect
    const header = document.getElementById('siteHeader');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
}

// ==================================================
// PILL NAVIGATION (21st DEV style)
// ==================================================
function initializePillNavigation() {
    const nav = document.querySelector('.pill-nav-v2');
    if (!nav) return;

    const buttons = Array.from(nav.querySelectorAll('button[data-target]'));
    if (!buttons.length) return;

    const sections = buttons
        .map(btn => document.querySelector(btn.dataset.target))
        .filter(Boolean);

    const setActive = (activeBtn) => {
        buttons.forEach(btn => btn.classList.toggle('is-active', btn === activeBtn));
    };

    buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.querySelector(button.dataset.target);
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setActive(button);
        });
    });

    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = `#${entry.target.id}`;
                const button = buttons.find(btn => btn.dataset.target === id);
                if (button) setActive(button);
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }
}

// ==================================================
// SNAP DOT NAV + PARALLAX
// ==================================================
function initializeSnapLanding() {
    const container = document.getElementById('snap');
    const dots = document.querySelectorAll('.dot-nav a');
    if (!container || !dots.length) return;

    const sections = Array.from(container.querySelectorAll('.snap-section'));
    if (!sections.length) return;

    // Click-to-scroll
    dots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(dot.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Active state via IntersectionObserver
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.dot-nav a[href="#${id}"]`);
            if (!link) return;
            if (entry.isIntersecting) {
                document.querySelectorAll('.dot-nav a').forEach(a => a.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        });
    }, { root: container, threshold: 0.6 });

    sections.forEach((sec) => io.observe(sec));

    // Basic parallax on scroll for elements with data-parallax
    container.addEventListener('scroll', () => {
        const y = container.scrollTop;
        document.querySelectorAll('[data-parallax]')
            .forEach((el) => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
                el.style.transform = `translateY(${y * speed * -1}px)`;
            });
    }, { passive: true });
}

// Sticky feature scene (Apple-like)
function initializeStickyScene() {
    const scene = document.querySelector('#s2 .sticky-scene');
    if (!scene) return;

    const media = scene.querySelector('.sticky-media');
    const layers = media ? media.querySelectorAll('.layer') : [];
    const steps = scene.querySelectorAll('.step[data-state]');
    if (!media || !layers.length || !steps.length) return;

    const section = document.getElementById('s2');
    const progressBar = document.getElementById('sceneProgress');

    const setState = (state) => {
        layers.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-state') === state));
        steps.forEach(s => s.classList.toggle('is-active', s.getAttribute('data-state') === state));
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const state = entry.target.getAttribute('data-state');
                setState(state);
                // Stage background color transition
                const bg = entry.target.getAttribute('data-bg');
                if (bg && section) {
                    section.style.backgroundColor = bg;
                }
                // Progress update
                if (progressBar) {
                    const activeIndex = Array.from(steps).indexOf(entry.target) + 1;
                    const pct = Math.max(0, Math.min(100, (activeIndex / steps.length) * 100));
                    progressBar.style.height = pct + '%';
                }
            }
        });
    }, { root: null, threshold: 0.6 });

    steps.forEach(step => io.observe(step));
}

// Hero background video controller + guided caption
function initializeHeroVideo() {
    const video = document.getElementById('heroVideo');
    const caption = document.getElementById('heroCaption');
    if (!video || !caption) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        video.removeAttribute('autoplay');
        video.pause();
    }

    // Play/pause when in view
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !prefersReduced) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.4 });
        io.observe(video);
    }

    // Guided captions cycling
    const lines = CONFIG.typewriter.messages;
    let i = 0;
    function cycle() {
        caption.style.opacity = '0';
        setTimeout(() => {
            caption.textContent = lines[i % lines.length];
            caption.style.opacity = '1';
            i++;
        }, 200);
    }
    cycle();
    setInterval(cycle, CONFIG.typewriter.pauseTime);
}

// ==================================================
// GSAP ANIMATIONS
// ==================================================
function initializeGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not loaded, skipping animations');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Animate sections on scroll
    gsap.utils.toArray('section').forEach((section, index) => {
        gsap.fromTo(section, {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                id: `section-${index}`
            }
        });
    });

    // Stagger animations for cards
    gsap.utils.toArray('.stagger-item').forEach((item, index) => {
        gsap.fromTo(item, {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Hero section animations
    const heroTl = gsap.timeline();
    heroTl
        .from('.hero-title', { opacity: 0, y: 50, duration: 1 })
        .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
}

// ==================================================
// INTERACTIVE ELEMENTS
// ==================================================
function initializeInteractiveElements() {
    // Metric cards hover effects
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateX(4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateX(0)';
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    initSnapshot();
    initSimulator();
}

// ==================================================
// MOBILE MENU FUNCTIONALITY
// ==================================================
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');
    
    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', function() {
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            // Close menu
            mobileMenu.classList.add('hidden');
            if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
            if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
        } else {
            // Open menu
            mobileMenu.classList.remove('hidden');
            if (menuOpenIcon) menuOpenIcon.classList.add('hidden');
            if (menuCloseIcon) menuCloseIcon.classList.remove('hidden');
        }
    });
    
    // Close menu when clicking on links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
            if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
            mobileMenu.classList.add('hidden');
            if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
            if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
        }
    });
}

// ==================================================
// LANGUAGE TOGGLE
// ==================================================
function initializeLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const langLabel = document.getElementById('langLabel');
    const mobileLangToggle = document.getElementById('mobile-langToggle');
    const mobileLangLabel = document.getElementById('mobile-langLabel');

    function updateLabels(lang) {
        if (langLabel) langLabel.textContent = lang.toUpperCase();
        if (mobileLangLabel) mobileLangLabel.textContent = lang === 'en' ? 'English' : 'Français';
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('lang', lang);
        updateLabels(lang);
        applyTranslations(lang);
        document.dispatchEvent(new CustomEvent('axel:language-change', { detail: { lang } }));
        console.log(`Language switched to: ${lang}`);
    }

    updateLabels(currentLanguage);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            setLanguage(currentLanguage === 'en' ? 'fr' : 'en');
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', () => {
            setLanguage(currentLanguage === 'en' ? 'fr' : 'en');
        });
    }
}

// ==================================================
// CARD GRADIENT INTERACTIONS (mouse-reactive breathing)
// ==================================================
function initializeCardGradientInteractions() {
    const cards = document.querySelectorAll('.card, .glass-card, .enhanced-card, .tilt-card');
    if (!cards.length) return;

    const maxShift = 6; // in percent, subtle sway

    cards.forEach(card => {
        let raf = null;
        let targetDX = 0, targetDY = 0;
        let currentDX = 0, currentDY = 0;

        function update() {
            // simple easing toward target
            currentDX += (targetDX - currentDX) * 0.12;
            currentDY += (targetDY - currentDY) * 0.12;
            card.style.setProperty('--ocean-dx', currentDX.toFixed(2) + '%');
            card.style.setProperty('--ocean-dy', currentDY.toFixed(2) + '%');
            raf = requestAnimationFrame(update);
        }

        function onMove(e) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;  // 0..1
            const y = (e.clientY - rect.top) / rect.height;  // 0..1
            const xr = (x - 0.5) * 2; // -1..1
            const yr = (y - 0.5) * 2; // -1..1
            targetDX = xr * maxShift;
            targetDY = yr * maxShift;
        }

        function onEnter() {
            card.classList.add('ocean-fast');
            if (!raf) raf = requestAnimationFrame(update);
        }

        function onLeave() {
            card.classList.remove('ocean-fast');
            targetDX = 0; targetDY = 0;
            // Smoothly settle then stop the loop after it’s nearly zero
            setTimeout(() => {
                if (Math.abs(currentDX) < 0.1 && Math.abs(currentDY) < 0.1) {
                    if (raf) cancelAnimationFrame(raf);
                    raf = null;
                }
            }, 300);
        }

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
    });
}

// ==================================================
// 3D GLOBE VISUALIZATION
// ==================================================
function initializeGlobe() {
    const globeContainer = document.getElementById('globe-container');
    if (!globeContainer) return;

    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.warn('Reduced motion enabled: skipping globe initialization');
        return;
    }

    // Defer heavy init until container is visible and THREE is available
    let started = false;
    const startGlobe = () => {
        if (started) return;
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not available yet, retrying shortly');
            // Retry shortly if scripts are deferred
            setTimeout(startGlobe, 200);
            return;
        }
        started = true;
        try {
        // Set up scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        globeContainer.appendChild(renderer.domElement);

        // Create earth sphere
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const textureLoader = new THREE.TextureLoader();
        
        // Fallback texture in case external texture fails
        const earthTexture = textureLoader.load(
            'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
            undefined,
            undefined,
            (err) => {
                console.warn('Failed to load earth texture:', err);
                // Could create a procedural texture here as fallback
            }
        );
        
        const material = new THREE.MeshPhongMaterial({ 
            map: earthTexture,
            shininess: 5
        });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Position camera
        camera.position.z = 5;

        // Add data points (random for demo)
        const points = createDataPoints(50);
        points.forEach(point => {
            const { x, y, z } = sphericalToCartesian(point.lat, point.lng, 2.1);
            const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
            const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
            pointMesh.position.set(x, y, z);
            scene.add(pointMesh);
        });

        // Animation
        function animate() {
            requestAnimationFrame(animate);
            earth.rotation.y += 0.001;
            renderer.render(scene, camera);
        }
        animate();

        // Handle resize
        function handleResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', handleResize);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        });

        } catch (error) {
            console.error('Error initializing globe:', error);
            globeContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-white">
                <div class="text-center">
                    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M2 12h20" />
                            <path d="M12 3a15 15 0 010 18" />
                            <path d="M12 3a15 15 0 010 18" transform="rotate(90 12 12)" />
                        </svg>
                    </div>
                    <p class="text-sm">Interactive globe unavailable</p>
                </div>
            </div>
        `;
        }
    };

    // If IntersectionObserver is supported, wait until visible
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    io.disconnect();
                    startGlobe();
                }
            });
        }, { rootMargin: '100px' });
        io.observe(globeContainer);
    } else {
        // Fallback: start after a short delay
        setTimeout(startGlobe, 200);
    }
}

function createDataPoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const point = {
            lat: (90 - (phi * 180) / Math.PI) * 0.9,
            lng: ((theta * 180) / Math.PI) % 360
        };
        points.push(point);
    }
    return points;
}

function sphericalToCartesian(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (180 - lng) * Math.PI / 180;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return { x, y, z };
}

// ==================================================
// SNAPSHOT COUNTERS (WORLD BANK)
// ==================================================
function initSnapshot() {
    const sections = document.querySelectorAll('[data-snapshot]');
    if (!sections.length) return;

    sections.forEach(section => {
        const regionKey = section.getAttribute('data-region');
        const regionConfig = SNAPSHOT_REGIONS[regionKey];
        if (!regionConfig) {
            console.warn('Snapshot region not configured:', regionKey);
            return;
        }

        const cards = {};
        section.querySelectorAll('[data-indicator]').forEach(card => {
            const indicatorKey = card.getAttribute('data-indicator');
            if (!SNAPSHOT_INDICATORS[indicatorKey]) return;
            cards[indicatorKey] = {
                valueEl: card.querySelector('[data-role="value"]'),
                yearEl: card.querySelector('[data-role="year"]'),
                minEl: card.querySelector('[data-role="min"]'),
                maxEl: card.querySelector('[data-role="max"]')
            };
        });

        const indicatorKeys = Object.keys(cards);
        if (!indicatorKeys.length) return;

        const yearLabelEl = section.querySelector('[data-role="year-label"]');
        const countryListEl = section.querySelector('[data-role="country-list"]');

        const fetchPromises = indicatorKeys.map(key => fetchIndicatorStatsForRegion(regionConfig.countryCodes, SNAPSHOT_INDICATORS[key]));

        Promise.all(fetchPromises)
            .then(results => {
                const years = [];
                const countrySet = new Set();

                results.forEach((stats, index) => {
                    const indicatorKey = indicatorKeys[index];
                    const card = cards[indicatorKey];
                    const config = SNAPSHOT_INDICATORS[indicatorKey];
                    if (!card || !config) return;

                    if (stats) {
                        if (Number.isFinite(stats.year)) years.push(stats.year);
                        stats.countries?.forEach(country => countrySet.add(country));

                        const targetValue = config.animateTarget(stats.aggregate);
                        if (card.valueEl) {
                            animateCounter(card.valueEl, targetValue, {
                                onComplete: () => {
                                    card.valueEl.textContent = config.primaryFormatter(stats.aggregate);
                                }
                            });
                            animateCounter(card.valueEl, stats.aggregate, config.primaryDecimals);
                        }

                        if (card.yearEl) card.yearEl.textContent = stats.year ?? '—';
                        if (card.minEl) card.minEl.textContent = config.minFormatter(stats.min);
                        if (card.maxEl) card.maxEl.textContent = config.maxFormatter(stats.max);
                    } else {
                        if (card.valueEl) card.valueEl.textContent = '—';
                        if (card.yearEl) card.yearEl.textContent = '—';
                        if (card.minEl) card.minEl.textContent = '—';
                        if (card.maxEl) card.maxEl.textContent = '—';
                    }
                });

                if (yearLabelEl) {
                    yearLabelEl.textContent = years.length ? Math.max(...years) : '—';
                }

                if (countryListEl) {
                    if (countrySet.size) {
                        countryListEl.textContent = Array.from(countrySet).sort((a, b) => a.localeCompare(b)).join(', ');
                    } else {
                        countryListEl.textContent = '—';
                    }
                }
            })
            .catch(error => {
                console.error(`Snapshot fetch failed for region ${regionKey}`, error);
            });
    });
}

function animateCounter(element, finalValue, decimals = 0) {
    if (!element || !Number.isFinite(finalValue)) return;
    let start = 0;
    const duration = 1500; // ms
    const range = finalValue - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = start + range * progress;

        element.textContent = currentValue.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

async function fetchIndicatorStatsForRegion(countryCodes, indicatorConfig) {
    if (!indicatorConfig || !Array.isArray(countryCodes) || !countryCodes.length) return null;

    const codeSet = new Set(countryCodes.map(code => code.toUpperCase()));
    const url = `https://api.worldbank.org/v2/country/${countryCodes.join(';')}/indicator/${indicatorConfig.wbIndicator}?date=2015:2024&format=json&per_page=1000`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`WB API request failed for ${indicatorConfig.wbIndicator}: ${res.status}`);
            return null;
        }
        const data = await res.json();
        const entries = data[1] || [];

        const valuesByYear = new Map();

        entries.forEach(entry => {
            if (entry.value == null) return;
            const code = entry.country?.id?.toUpperCase();
            if (!code || !codeSet.has(code)) return;
            const year = parseInt(entry.date, 10);
            if (Number.isNaN(year)) return;

            const countryName = entry.country?.value || code;
            const transformedValue = indicatorConfig.transform(Number(entry.value));
            if (!Number.isFinite(transformedValue)) return;

            const bucket = valuesByYear.get(year) || [];
            bucket.push({ value: transformedValue, country: countryName });
            valuesByYear.set(year, bucket);
        });

        if (!valuesByYear.size) return null;

        const latestYear = Math.max(...valuesByYear.keys());
        const yearEntries = valuesByYear.get(latestYear) || [];
        if (!yearEntries.length) return null;

        const values = yearEntries.map(entry => entry.value);
        const aggregate = indicatorConfig.aggregate(values);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const countries = Array.from(new Set(yearEntries.map(entry => entry.country))).sort((a, b) => a.localeCompare(b));

        return { aggregate, min, max, year: latestYear, countries };
    } catch (error) {
        console.error('WB fetch error', indicatorConfig.wbIndicator, error);
        return null;
    }
}

// ==================================================
// POLICY SIMULATOR (CHART.JS)
// ==================================================
function updatePolicyChartTheme() {
    if (!policyChart) return;
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const labelColor = isDark ? '#94a3b8' : '#4b5563';
    const legendColor = isDark ? '#cbd5e1' : '#4b5563';
    const datasetStroke = isDark ? '#60a5fa' : '#1e3a8a';

    // Update chart gradients and colors
    const gradient = policyChart.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isDark ? 'rgba(59,130,246,0.3)' : 'rgba(30,58,138,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    policyChart.data.datasets[1].backgroundColor = gradient;
    policyChart.data.datasets[1].borderColor = datasetStroke;

    ['x', 'y'].forEach(axis => {
        policyChart.options.scales[axis].grid.color = gridColor;
        policyChart.options.scales[axis].ticks.color = labelColor;
        policyChart.options.scales[axis].title.color = labelColor;
    });

    policyChart.options.plugins.legend.labels.color = legendColor;
    policyChart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    policyChart.options.plugins.tooltip.titleColor = isDark ? '#cbd5e1' : '#374151';
    policyChart.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#374151';
    policyChart.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e5e7eb';

    policyChart.update();
}

function initSimulator() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library not available – simulator skipped');
        return;
    }

    const canvas = document.getElementById('policyImpactChart');
    if (!canvas) return;

    const hdiSlider = document.getElementById('hdiSlider');
    const stabilitySlider = document.getElementById('stabilitySlider');
    const institutionSlider = document.getElementById('institutionSlider');
    const hdiValue = document.getElementById('hdiValue');
    const stabilityValue = document.getElementById('stabilityValue');
    const institutionValue = document.getElementById('institutionValue');
    const hdiDesc = document.getElementById('hdiDescription');
    const stabilityDesc = document.getElementById('stabilityDescription');
    const institutionDesc = document.getElementById('institutionDescription');
    const outcomeValue = document.getElementById('outcomeValue');
    const resetButton = document.getElementById('resetButton');
    const saveButton = document.getElementById('saveButton');
    const exportPNG = document.getElementById('exportPNG');
    const exportPDF = document.getElementById('exportPDF');
    const hdiProgress = document.getElementById('hdiProgress');
    const stabilityProgress = document.getElementById('stabilityProgress');
    const institutionProgress = document.getElementById('institutionProgress');

    if (!hdiSlider || !stabilitySlider || !institutionSlider || !hdiValue || !stabilityValue || !institutionValue || !outcomeValue) {
        console.warn('Simulator controls missing – skipping init');
        return;
    }

    const descriptions = {
        hdi: [
            { t: 0.55, d: 'Low Development. Basic literacy challenges, life expectancy below 60.' },
            { t: 0.7, d: 'Medium Development. Most children in school, basic healthcare accessible.' },
            { t: 0.8, d: 'High Development. Widespread quality education and healthcare.' },
            { t: Infinity, d: 'Very High Development. Advanced systems and safety nets.' }
        ],
        stability: [
            { t: 2, d: 'Major conflict. Severe disruption to state functions.' },
            { t: 4, d: 'High instability. Protests and elevated risk of violence.' },
            { t: 7, d: 'Moderate stability. Functioning process with tensions.' },
            { t: Infinity, d: 'High stability & peace. Strong democratic processes.' }
        ],
        institutions: [
            { t: -1.0, d: 'Very weak institutions. Pervasive corruption.' },
            { t: 0.0, d: 'Weak institutions. Inconsistent rule of law.' },
            { t: 1.0, d: 'Moderate institutions. Transparency reforms ongoing.' },
            { t: Infinity, d: 'Strong institutions. Effective government, control of corruption.' }
        ]
    };

    const getDescription = (value, type) => descriptions[type].find(item => value < item.t).d;

    const calculateAnnualGrowth = (hdi, stability, institutions) => (
        0.01 +
        ((hdi - 0.5) * 0.05) +
        ((stability - 5) * 0.005) +
        (institutions * 0.01) +
        (stability < 3 ? (3 - stability) * -0.015 : 0)
    );

    const generatePath = rate => {
        const path = [100];
        for (let i = 1; i <= 10; i++) {
            path.push(path[path.length - 1] * (1 + rate));
        }
        return path;
    };

    const updateSliderProgress = (slider, progressElement) => {
        if (!progressElement) return;
        const value = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const pct = ((value - min) / (max - min)) * 100;
        progressElement.style.width = `${pct}%`;
    };

    const baselinePath = generatePath(calculateAnnualGrowth(0.55, 5, 0.0));
    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(30,58,138,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    policyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 11 }, (_, index) => `Year ${index}`),
            datasets: [
                {
                    label: 'Baseline',
                    data: baselinePath,
                    borderColor: '#9ca3af',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Your Scenario',
                    data: [],
                    borderColor: '#1e3a8a',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 },
                        color: '#4b5563'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#ffffff',
                    titleColor: '#374151',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Relative GDP Index', color: '#4b5563' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { color: '#4b5563' }
                },
                x: {
                    title: { display: true, text: 'Time Horizon (Years)', color: '#4b5563' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { color: '#4b5563' }
                }
            }
        }
    });

    const updateSimulator = () => {
        const hdi = parseFloat(hdiSlider.value);
        const stability = parseInt(stabilitySlider.value, 10);
        const institutions = parseFloat(institutionSlider.value);

        hdiValue.textContent = hdi.toFixed(2);
        stabilityValue.textContent = stability.toString();
        institutionValue.textContent = institutions.toFixed(1);

        if (hdiDesc) hdiDesc.textContent = getDescription(hdi, 'hdi');
        if (stabilityDesc) stabilityDesc.textContent = getDescription(stability, 'stability');
        if (institutionDesc) institutionDesc.textContent = getDescription(institutions, 'institutions');

        updateSliderProgress(hdiSlider, hdiProgress);
        updateSliderProgress(stabilitySlider, stabilityProgress);
        updateSliderProgress(institutionSlider, institutionProgress);

        const rate = calculateAnnualGrowth(hdi, stability, institutions);
        const userPath = generatePath(rate);
        policyChart.data.datasets[1].data = userPath;
        policyChart.update();

        const totalGrowth = ((userPath[10] / userPath[0]) - 1) * 100;
        const baselineGrowth = ((baselinePath[10] / baselinePath[0]) - 1) * 100;

        const formatted = `${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)}%`;
        outcomeValue.textContent = formatted;
        outcomeValue.className = `text-4xl font-extrabold ${totalGrowth >= baselineGrowth ? 'text-green-600' : 'text-red-600'}`;
    };

    const resetSimulator = () => {
        hdiSlider.value = 0.55;
        stabilitySlider.value = 5;
        institutionSlider.value = 0.0;
        updateSimulator();
    };

    const saveScenario = () => {
        const scenario = {
            hdi: parseFloat(hdiSlider.value),
            stability: parseInt(stabilitySlider.value, 10),
            institutions: parseFloat(institutionSlider.value),
            timestamp: new Date().toISOString()
        };
        const originalMarkup = saveButton ? saveButton.innerHTML : '';
        if (saveButton) {
            saveButton.innerHTML = '✔ Saved!';
            saveButton.classList.add('bg-green-600', 'hover:bg-green-700');
            setTimeout(() => {
                saveButton.innerHTML = originalMarkup;
                saveButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            }, 1500);
        }
        console.log('Scenario saved:', scenario);
    };

    const exportChartPNG = () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'policy-simulator-chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    [hdiSlider, stabilitySlider, institutionSlider].forEach(slider => {
        slider.addEventListener('input', updateSimulator);
    });

    if (resetButton) resetButton.addEventListener('click', resetSimulator);
    if (saveButton) saveButton.addEventListener('click', saveScenario);
    if (exportPNG) exportPNG.addEventListener('click', exportChartPNG);
    if (exportPDF) exportPDF.addEventListener('click', () => {
        alert('PDF export can be enabled with jsPDF or a similar library in production.');
    });

    updateSimulator();
    updatePolicyChartTheme();
}

// ==================================================
// PERFORMANCE OPTIMIZATIONS
// ==================================================
// Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================================================
// POLICY SIMULATOR (CHART.JS)
// ==================================================
function updatePolicyChartTheme() {
    if (!policyChart) return;
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const labelColor = isDark ? '#94a3b8' : '#4b5563';
    const legendColor = isDark ? '#cbd5e1' : '#4b5563';
    const datasetStroke = isDark ? '#60a5fa' : '#1e3a8a';

    // Update chart gradients and colors
    const gradient = policyChart.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isDark ? 'rgba(59,130,246,0.3)' : 'rgba(30,58,138,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    policyChart.data.datasets[1].backgroundColor = gradient;
    policyChart.data.datasets[1].borderColor = datasetStroke;

    ['x', 'y'].forEach(axis => {
        policyChart.options.scales[axis].grid.color = gridColor;
        policyChart.options.scales[axis].ticks.color = labelColor;
        policyChart.options.scales[axis].title.color = labelColor;
    });

    policyChart.options.plugins.legend.labels.color = legendColor;
    policyChart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    policyChart.options.plugins.tooltip.titleColor = isDark ? '#cbd5e1' : '#374151';
    policyChart.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#374151';
    policyChart.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e5e7eb';

    policyChart.update();
}

function initSimulator() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library not available – simulator skipped');
        return;
    }

    const canvas = document.getElementById('policyImpactChart');
    if (!canvas) return;

    const hdiSlider = document.getElementById('hdiSlider');
    const stabilitySlider = document.getElementById('stabilitySlider');
    const institutionSlider = document.getElementById('institutionSlider');
    const hdiValue = document.getElementById('hdiValue');
    const stabilityValue = document.getElementById('stabilityValue');
    const institutionValue = document.getElementById('institutionValue');
    const hdiDesc = document.getElementById('hdiDescription');
    const stabilityDesc = document.getElementById('stabilityDescription');
    const institutionDesc = document.getElementById('institutionDescription');
    const outcomeValue = document.getElementById('outcomeValue');
    const resetButton = document.getElementById('resetButton');
    const saveButton = document.getElementById('saveButton');
    const exportPNG = document.getElementById('exportPNG');
    const exportPDF = document.getElementById('exportPDF');
    const hdiProgress = document.getElementById('hdiProgress');
    const stabilityProgress = document.getElementById('stabilityProgress');
    const institutionProgress = document.getElementById('institutionProgress');

    if (!hdiSlider || !stabilitySlider || !institutionSlider || !hdiValue || !stabilityValue || !institutionValue || !outcomeValue) {
        console.warn('Simulator controls missing – skipping init');
        return;
    }

    const descriptions = {
        hdi: [
            { t: 0.55, d: 'Low Development. Basic literacy challenges, life expectancy below 60.' },
            { t: 0.7, d: 'Medium Development. Most children in school, basic healthcare accessible.' },
            { t: 0.8, d: 'High Development. Widespread quality education and healthcare.' },
            { t: Infinity, d: 'Very High Development. Advanced systems and safety nets.' }
        ],
        stability: [
            { t: 2, d: 'Major conflict. Severe disruption to state functions.' },
            { t: 4, d: 'High instability. Protests and elevated risk of violence.' },
            { t: 7, d: 'Moderate stability. Functioning process with tensions.' },
            { t: Infinity, d: 'High stability & peace. Strong democratic processes.' }
        ],
        institutions: [
            { t: -1.0, d: 'Very weak institutions. Pervasive corruption.' },
            { t: 0.0, d: 'Weak institutions. Inconsistent rule of law.' },
            { t: 1.0, d: 'Moderate institutions. Transparency reforms ongoing.' },
            { t: Infinity, d: 'Strong institutions. Effective government, control of corruption.' }
        ]
    };

    const getDescription = (value, type) => descriptions[type].find(item => value < item.t).d;

    const calculateAnnualGrowth = (hdi, stability, institutions) => (
        0.01 +
        ((hdi - 0.5) * 0.05) +
        ((stability - 5) * 0.005) +
        (institutions * 0.01) +
        (stability < 3 ? (3 - stability) * -0.015 : 0)
    );

    const generatePath = rate => {
        const path = [100];
        for (let i = 1; i <= 10; i++) {
            path.push(path[path.length - 1] * (1 + rate));
        }
        return path;
    };

    const updateSliderProgress = (slider, progressElement) => {
        if (!progressElement) return;
        const value = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const pct = ((value - min) / (max - min)) * 100;
        progressElement.style.width = `${pct}%`;
    };

    const baselinePath = generatePath(calculateAnnualGrowth(0.55, 5, 0.0));
    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(30,58,138,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    policyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 11 }, (_, index) => `Year ${index}`),
            datasets: [
                {
                    label: 'Baseline',
                    data: baselinePath,
                    borderColor: '#9ca3af',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Your Scenario',
                    data: [],
                    borderColor: '#1e3a8a',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 },
                        color: '#4b5563'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#ffffff',
                    titleColor: '#374151',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Relative GDP Index', color: '#4b5563' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { color: '#4b5563' }
                },
                x: {
                    title: { display: true, text: 'Time Horizon (Years)', color: '#4b5563' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { color: '#4b5563' }
                }
            }
        }
    });

    const updateSimulator = () => {
        const hdi = parseFloat(hdiSlider.value);
        const stability = parseInt(stabilitySlider.value, 10);
        const institutions = parseFloat(institutionSlider.value);

        hdiValue.textContent = hdi.toFixed(2);
        stabilityValue.textContent = stability.toString();
        institutionValue.textContent = institutions.toFixed(1);

        if (hdiDesc) hdiDesc.textContent = getDescription(hdi, 'hdi');
        if (stabilityDesc) stabilityDesc.textContent = getDescription(stability, 'stability');
        if (institutionDesc) institutionDesc.textContent = getDescription(institutions, 'institutions');

        updateSliderProgress(hdiSlider, hdiProgress);
        updateSliderProgress(stabilitySlider, stabilityProgress);
        updateSliderProgress(institutionSlider, institutionProgress);

        const rate = calculateAnnualGrowth(hdi, stability, institutions);
        const userPath = generatePath(rate);
        policyChart.data.datasets[1].data = userPath;
        policyChart.update();

        const totalGrowth = ((userPath[10] / userPath[0]) - 1) * 100;
        const baselineGrowth = ((baselinePath[10] / baselinePath[0]) - 1) * 100;

        const formatted = `${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)}%`;
        outcomeValue.textContent = formatted;
        outcomeValue.className = `text-4xl font-extrabold ${totalGrowth >= baselineGrowth ? 'text-green-600' : 'text-red-600'}`;
    };

    const resetSimulator = () => {
        hdiSlider.value = 0.55;
        stabilitySlider.value = 5;
        institutionSlider.value = 0.0;
        updateSimulator();
    };

    const saveScenario = () => {
        const scenario = {
            hdi: parseFloat(hdiSlider.value),
            stability: parseInt(stabilitySlider.value, 10),
            institutions: parseFloat(institutionSlider.value),
            timestamp: new Date().toISOString()
        };
        const originalMarkup = saveButton ? saveButton.innerHTML : '';
        if (saveButton) {
            saveButton.innerHTML = '✔ Saved!';
            saveButton.classList.add('bg-green-600', 'hover:bg-green-700');
            setTimeout(() => {
                saveButton.innerHTML = originalMarkup;
                saveButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            }, 1500);
        }
        console.log('Scenario saved:', scenario);
    };

    const exportChartPNG = () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'policy-simulator-chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    [hdiSlider, stabilitySlider, institutionSlider].forEach(slider => {
        slider.addEventListener('input', updateSimulator);
    });

    if (resetButton) resetButton.addEventListener('click', resetSimulator);
    if (saveButton) saveButton.addEventListener('click', saveScenario);
    if (exportPNG) exportPNG.addEventListener('click', exportChartPNG);
    if (exportPDF) exportPDF.addEventListener('click', () => {
        alert('PDF export can be enabled with jsPDF or a similar library in production.');
    });

    updateSimulator();
    updatePolicyChartTheme();
}

// ==================================================
// PERFORMANCE OPTIMIZATIONS
// ==================================================
// Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply optimizations
window.addEventListener('scroll', throttle(() => {
    // Scroll-based optimizations
}, 100));

window.addEventListener('resize', debounce(() => {
    // Resize-based logic
}, 250));

// ==================================================
// ERROR HANDLING & LOGGING
// ==================================================
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

// Log page performance
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        initializeTheme,
        initializeTypewriter,
        initializeScrollAnimations
    };
}
