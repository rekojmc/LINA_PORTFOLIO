/* Lina Hernandez - 2026 Global Engine */

document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.getElementById('global-nav');
    const footerPlaceholder = document.getElementById('global-footer');

    // 1. PATH DETECTION (Handles Pretty URLs)
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/') || path.includes('/thank-you/');
    const basePath = isSubfolder ? '../' : '';

    const savedLang = localStorage.getItem('preferredLang') || 'en';

    // 2. INJECT NAV (With CloudCannon Bindings)
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <nav class="glass-nav">
                <div class="nav-name">Lina Hernandez</div>
                <div class="nav-links">
                    <a href="${basePath}#gallery" data-i18n="nav_portfolio" data-cms-bind="data.translations.es.nav_portfolio">Portfolio</a>
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

    // 3. INJECT FOOTER
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="nude-footer">
                <div class="footer-divider"></div>
                <h2 class="footer-heading" data-i18n="hero_title" data-cms-bind="data.translations.es.hero_title">LINA HERNANDEZ</h2>
                <nav class="footer-nav">
                    <a href="${basePath}#gallery" data-i18n="nav_portfolio">Home</a>
                    <a href="${basePath}about/" data-i18n="nav_about">About</a>
                    <a href="${basePath}contact/" data-i18n="nav_contact">Contact</a>
                </nav>
                <p class="copyright">© ${new Date().getFullYear()} Lina Hernandez. <span data-i18n="copyright_rights" data-cms-bind="data.translations.es.copyright_rights">All rights reserved.</span></p>
            </footer>
        `;
    }

    updatePageText(savedLang);
});

async function updatePageText(lang) {
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/') || path.includes('/thank-you/');
    const basePath = isSubfolder ? '../' : '';

    try {
        const response = await fetch(`${basePath}data/translations.json`);
        const translations = await response.json();
        const data = translations[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key]) {
                // IMPORTANT: Use innerHTML for bios/bodies to allow styling
                if (key.includes('bio') || key.includes('body')) {
                    el.innerHTML = data[key];
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = data[key];
                } else {
                    el.innerText = data[key];
                }
            }
        });

        localStorage.setItem('preferredLang', lang);
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

        window.dispatchEvent(new Event('languageChanged'));
    } catch (err) { console.error("Translation Error:", err); }
}

function setLanguage(lang) { updatePageText(lang); }