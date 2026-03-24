/* Lina Hernandez - Global Component & Translation Engine */

// Add this helper at the top of your components file
const getBasePath = () => {
    // If the URL contains '/pages/' or any subfolder, we need to go up one level
    // This is a simple way to detect if we are in a subfolder
    const path = window.location.pathname;
    
    // If we are on the main index.html or root
    if (path.endsWith('/') || path.endsWith('index.html') || !path.includes('/', 1)) {
        return './';
    }
    // If we are in /pages/about.html, we need to go up
    return '../';
};

/* Lina Hernandez - Global Component & Translation Engine */

document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.getElementById('global-nav');
    const footerPlaceholder = document.getElementById('global-footer');

    // 1. SMART PATH DETECTION for Pretty URLs (/about/, /contact/)
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/') || path.includes('/portfolio/');
    const basePath = isSubfolder ? '../' : '';

    const savedLang = localStorage.getItem('preferredLang') || 'en';

    // 2. INJECT NAVIGATION (With CloudCannon Bindings)
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <nav class="glass-nav">
                <div class="nav-name">Lina Hernandez</div>
                <div class="nav-links">
                    <a href="${basePath}portfolio/" data-i18n="nav_portfolio" data-cms-bind="data.translations.es.nav_portfolio">Portfolio</a>
                    <a href="${basePath}about/" data-i18n="nav_about" data-cms-bind="data.translations.es.nav_about">About Lina</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact" data-cms-bind="data.translations.es.nav_contact">Contact</a>
                    
                    <span class="lang-switcher">
                        <button onclick="setLanguage('en')" id="btn-en" class="lang-btn">EN</button> | 
                        <button onclick="setLanguage('es')" id="btn-es" class="lang-btn">ES</button>
                    </span>
                </div>
            </nav>
        `;
    }

    // 3. INJECT FOOTER (With Dynamic Year & CloudCannon Bindings)
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="nude-footer">
                <div class="footer-divider"></div>
                <h2 class="footer-heading" data-i18n="hero_title" data-cms-bind="data.translations.es.hero_title">LINA HERNANDEZ</h2>
                <div class="footer-socials">
                    <a href="https://instagram.com/lina.hernandez02" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://tiktok.com/@linahernandez021" target="_blank"><i class="fab fa-tiktok"></i></a>
                </div>
                <nav class="footer-nav">
                    <a href="${basePath}portfolio/" data-i18n="nav_portfolio">Home</a>
                    <a href="${basePath}about/" data-i18n="nav_about">About</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact">Contact</a>
                </nav>
                <p class="copyright">© ${new Date().getFullYear()} Lina Hernandez. <span data-i18n="copyright_rights" data-cms-bind="data.translations.es.copyright_rights">All rights reserved.</span></p>
            </footer>
        `;
    }

    updatePageText(savedLang);
});

// --- TRANSLATION CORE LOGIC ---

async function updatePageText(lang) {
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/');
    const basePath = isSubfolder ? '../' : '';

    try {
        // Updated path to match CloudCannon config (translations.json)
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

        // Update persistence
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

        localStorage.setItem('preferredLang', lang);
        window.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Translation Engine Error:", err);
    }
}

// Fixed the name to match the 'onclick' calls in the HTML
function setLanguage(lang) {
    updatePageText(lang);
}