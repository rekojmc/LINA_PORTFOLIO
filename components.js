/* Lina Hernandez - Global Component & Translation Engine */

// Helper to determine relative pathing for subfolders
const getBasePath = () => {
    const path = window.location.pathname;
    // Detects if we are in /about/, /contact/, or /portfolio/
    if (path.includes('/about/') || path.includes('/contact/') || path.includes('/portfolio/')) {
        return '../';
    }
    return './';
};

// Global state for the menu background pool
let portfolioPool = null;

document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.getElementById('global-nav');
    const footerPlaceholder = document.getElementById('global-footer');
    const basePath = getBasePath();
    const savedLang = localStorage.getItem('preferredLang') || 'en';

    // 1. INJECT NAVIGATION (Desktop + Mobile Overlay)
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <nav class="glass-nav">
                <div class="nav-name" onclick="window.location.href='${basePath}'" style="cursor:pointer">Lina Hernandez</div>
                
                <div class="nav-links desktop-only">
                    <a href="${basePath}portfolio/" data-i18n="nav_portfolio">Portfolio</a>
                    <a href="${basePath}about/" data-i18n="nav_about">About Lina</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact">Contact</a>
                    <span class="lang-switcher">
                        <button onclick="setLanguage('en')" id="btn-en" class="lang-btn">EN</button> | 
                        <button onclick="setLanguage('es')" id="btn-es" class="lang-btn">ES</button>
                    </span>
                </div>

                <div class="menu-toggle" onclick="toggleMobileMenu()">
                    <i class="fas fa-bars"></i>
                </div>
            </nav>

            <div id="mobile-menu-overlay" class="mobile-menu">
                <div class="menu-exit" onclick="toggleMobileMenu()">&times;</div>
                <div class="menu-links">
                    <a href="${basePath}portfolio/" data-i18n="nav_portfolio" onclick="toggleMobileMenu()">Portfolio</a>
                    <a href="${basePath}about/" data-i18n="nav_about" onclick="toggleMobileMenu()">About</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact" onclick="toggleMobileMenu()">Contact</a>
                    
                    <div class="mobile-lang-switcher">
                        <button onclick="setLanguage('en')" class="mobile-lang-btn-en">EN</button>
                        <span>/</span>
                        <button onclick="setLanguage('es')" class="mobile-lang-btn-es">ES</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. INJECT FOOTER
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="nude-footer">
                <div class="footer-divider"></div>
                <h2 class="footer-heading">LINA HERNANDEZ</h2>
                <div class="footer-socials">
                    <a href="#" data-social="instagram" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" data-social="tiktok" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                    <a href="#" data-social="facebook" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" data-social="youtube" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
                <nav class="footer-nav">
                    <a href="${basePath}portfolio/" data-i18n="nav_portfolio">Portfolio</a>
                    <a href="${basePath}about/" data-i18n="nav_about">About</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact">Contact</a>
                </nav>
                <p class="copyright">© ${new Date().getFullYear()} Lina Hernandez. <span data-i18n="copyright_rights">All rights reserved.</span></p>
            </footer>
        `;

        // THE PRINCIPAL HOOK:
        // Now that the HTML is on the page, tell socials.js to find those data-social tags.
        if (typeof updateSocialLinks === "function") {
            updateSocialLinks();
        }

        // If you're using a translation script (like applyTranslations), call it here too
        // to ensure the newly injected footer text is translated immediately.
        if (typeof applyTranslations === "function") {
            applyTranslations();
        }
    }
    // Initialize Translations and UI
    updatePageText(savedLang);
    updateLangUI(savedLang);
});

/* --- CORE ENGINE FUNCTIONS --- */

// 1. Translation Engine
async function updatePageText(lang) {
    const basePath = getBasePath();
    try {
        const response = await fetch(`${basePath}translations.json`);
        const translations = await response.json();
        const data = translations[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = data[key];
                } else {
                    el.innerText = data[key];
                }
            }
        });

        localStorage.setItem('preferredLang', lang);
        updateLangUI(lang);
    } catch (err) {
        console.error("Translation Engine Error:", err);
    }
}

// 2. Language Switcher (With Auto-Close & Highlighting)
window.setLanguage = function (lang) {
    updatePageText(lang);

    // Auto-close menu if open
    const menu = document.getElementById('mobile-menu-overlay');
    if (menu && menu.classList.contains('active')) {
        setTimeout(() => { toggleMobileMenu(); }, 300);
    }
};

// 3. Highlight Logic (Underline active language)
function updateLangUI(lang) {
    document.querySelectorAll('.lang-btn, .mobile-lang-switcher button').forEach(btn => {
        btn.classList.remove('active-lang');
    });

    // Target both desktop and mobile buttons
    const activeButtons = document.querySelectorAll(`#btn-${lang}, .mobile-lang-btn-${lang}`);
    activeButtons.forEach(btn => btn.classList.add('active-lang'));
}

// 4. Mobile Menu Toggle
window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobile-menu-overlay');
    if (!menu) return;

    menu.classList.toggle('active');

    if (menu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        setRandomMenuBackground(); // Pick fresh background on open
    } else {
        document.body.style.overflow = '';
    }
};

// 5. Random Background Generator (Pulling from Portfolio JSON)
window.setRandomMenuBackground = async function () {
    const menu = document.getElementById('mobile-menu-overlay');
    const basePath = getBasePath();
    if (!menu) return;

    if (!portfolioPool) {
        try {
            const response = await fetch(`${basePath}portfolio/portfolio-gallery.json`);
            const data = await response.json();
            // FILTER: Images only
            portfolioPool = data.filter(file => file.type === 'image');
        } catch (e) {
            console.error("Background Pool Error:", e);
            return;
        }
    }

    if (portfolioPool && portfolioPool.length > 0) {
        const randomPhoto = portfolioPool[Math.floor(Math.random() * portfolioPool.length)];

        // Cloudinary: Extreme blur and darkening for legibility
        const bgUrl = randomPhoto.url.replace('/upload/', '/upload/f_auto,q_auto,w_auto,e_gamma:-50,e_brightness:-50/');

        menu.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${bgUrl}')`;
    }
};