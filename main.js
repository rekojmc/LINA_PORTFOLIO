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
    // 1. PATH LOGIC: Looking for translations.json in the ROOT
    const isSubfolder = path.includes('/about/') || path.includes('/contact/') || path.includes('/thank-you/') || path.includes('/thankyou/');
    const basePath = isSubfolder ? '../' : '';

    try {
        // Fetch from root (removed /data/ as requested)
        const response = await fetch(`${basePath}translations.json`);
        const translations = await response.json();
        const data = translations[lang];

        if (!data) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = data[key];

            // 2. THE NINJA ICON PROTECTOR
            // We only want to hide "Structural" text elements if they are empty.
            // We NEVER hide icons (<i>), images (<img>), or links (<a>).
            const isTextElement = ['P', 'H1', 'H2', 'H3', 'DIV', 'SPAN'].includes(el.tagName);

            // 3. CONDITIONAL HIDING
            if (!translation || translation.trim() === "") {
                if (isTextElement) {
                    el.style.display = 'none'; // Hide empty text blocks
                }
                // If it's an icon or a link with no translation, 
                // we STOP here so we don't wipe out the inner HTML (the icon).
                return; 
            }

            // 4. RESTORE VISIBILITY & APPLY CONTENT
            el.style.display = ''; // Re-show if it was hidden

            if (key.includes('bio') || key.includes('body') || key.includes('intro')) {
                el.innerHTML = translation;
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                // IMPORTANT: We only update innerText if the translation isn't empty.
                // This prevents icons inside <a> tags from being overwritten by 'undefined'.
                el.innerText = translation;
            }
        });

        // 5. PERSISTENCE & UI
        localStorage.setItem('preferredLang', lang);
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

        // 6. THE SIGNAL (Uses CustomEvent for data passing)
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));

    } catch (err) { 
        console.error("Translation Error:", err); 
    }
}

function setLanguage(lang) { updatePageText(lang); }