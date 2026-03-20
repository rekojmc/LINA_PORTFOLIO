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

document.addEventListener("DOMContentLoaded", () => {
    // 1. Target the placeholders in your HTML
    const navPlaceholder = document.getElementById('global-nav');
    const footerPlaceholder = document.getElementById('global-footer');

    // 2. Identify initial language (Check storage or default to English)
    const savedLang = localStorage.getItem('preferredLang') || 'en';

    // 3. Inject Navigation (Preserving your root-relative paths and adding translation tags)
if (navPlaceholder) {
    // 1. DYNAMIC PATH CALCULATION (Same as footer for consistency)
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/');
    const basePath = isSubfolder ? '../' : '';

    navPlaceholder.innerHTML = `
        <nav class="glass-nav">
            <div class="nav-name">Lina Hernandez</div>
            <div class="nav-links">
                <a href="${basePath}index.html#gallery" data-i18n="nav_portfolio">Portfolio</a>
                <a href="${basePath}about/about.html" data-i18n="nav_about">About Lina</a>
                <a href="${basePath}contact/contact.html" data-i18n="nav_contact">Contact</a>
                
                <span class="lang-switcher">
                    <button onclick="setLanguage('en')" id="btn-en" class="lang-btn">EN</button> | 
                    <button onclick="setLanguage('es')" id="btn-es" class="lang-btn">ES</button>
                </span>
            </div>
        </nav>
    `;
}

    // 4. Inject Footer (Preserving your social links and dynamic year)
if (footerPlaceholder) {
    // 1. CALCULATE THE BASE PATH:
    // This looks at the URL. If it sees we are in a subfolder like /about/ or /contact/,
    // it sets basePath to '../' to get us back to the root.
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/');
    const basePath = isSubfolder ? '../' : '';

    footerPlaceholder.innerHTML = `
        <footer class="nude-footer">
            <div class="footer-divider"></div>
            <h2 class="footer-heading" data-i18n="hero_title">LINA HERNANDEZ</h2>
            <div class="footer-socials">
                <a href="https://instagram.com/lina.hernandez02" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://tiktok.com/@linahernandez021" target="_blank"><i class="fab fa-tiktok"></i></a>
            </div>
            <nav class="footer-nav">
                <a href="${basePath}index.html" data-i18n="nav_portfolio">Home</a>
                <a href="${basePath}about/about.html" data-i18n="nav_about">About</a>
                <a href="${basePath}contact/contact.html" data-i18n="nav_contact">Contact</a>
            </nav>
            <p class="copyright">© ${new Date().getFullYear()} Lina Hernandez. <span data-i18n="copyright_rights">All rights reserved.</span></p>
        </footer>
    `;
}

    // 5. Initial Translation Run
    updatePageText(savedLang);
});

// --- TRANSLATION CORE LOGIC ---

async function updatePageText(lang) {
    // 1. SMART PATH DETECTION
    const path = window.location.pathname;
    const isSubfolder = path.includes('/about/') || path.includes('/contact/');
    const basePath = isSubfolder ? '../' : '';

    try {
        // 2. FETCH WITH DYNAMIC BASE PATH
        // Removed the leading slash so it's relative to basePath
        const response = await fetch(`${basePath}translations.json`);
        const translations = await response.json();
        const data = translations[lang];

        // 3. UPDATE ELEMENTS
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

        // 4. UPDATE TITLE
        if (data['site_title']) {
            document.title = data['site_title'];
        }

        // 5. VISUAL FEEDBACK & PERSISTENCE
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

        localStorage.setItem('preferredLang', lang);

        // 6. NOTIFY OTHER SCRIPTS (Bio/Intro)
        window.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Translation Engine Error:", err);
    }
}

// Function called by the EN | ES buttons
function toggleLanguage(lang) {
    updatePageText(lang);
}
