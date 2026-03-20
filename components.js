/* Lina Hernandez - Global Component & Translation Engine */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Target the placeholders in your HTML
    const navPlaceholder = document.getElementById('global-nav');
    const footerPlaceholder = document.getElementById('global-footer');

    // 2. Identify initial language (Check storage or default to English)
    const savedLang = localStorage.getItem('preferredLang') || 'en';

    // 3. Inject Navigation (Preserving your root-relative paths and adding translation tags)
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <nav class="glass-nav">
                <div class="nav-name">Lina Hernandez</div>
                <div class="nav-links">
                    <a href="index.html#gallery" data-i18n="nav_portfolio">Portfolio</a>
                    <a href="about/about.html" data-i18n="nav_about">About Lina</a>
                    <a href="contact/contact.html" data-i18n="nav_contact">Contact</a>
                    
                    <span class="lang-switcher">
                        <button onclick="toggleLanguage('en')" id="btn-en" class="lang-btn">EN</button> | 
                        <button onclick="toggleLanguage('es')" id="btn-es" class="lang-btn">ES</button>
                    </span>
                </div>
            </nav>
        `;
    }

    // 4. Inject Footer (Preserving your social links and dynamic year)
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="nude-footer">
                <div class="footer-divider"></div>
                <h2 class="footer-heading" data-i18n="hero_title">LINA HERNANDEZ</h2>
                <div class="footer-socials">
                    <a href="https://instagram.com/lina.hernandez02" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://tiktok.com/@linahernandez021" target="_blank"><i class="fab fa-tiktok"></i></a>
                </div>
                <nav class="footer-nav">
                    <a href="index.html" data-i18n="nav_portfolio">Home</a>
                    <a href="about/about.html" data-i18n="nav_about">About</a>
                    <a href="contact/contact.html" data-i18n="nav_contact">Contact</a>
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
    try {
        const response = await fetch('translations.json');
        const translations = await response.json();
        const data = translations[lang];

        // Update all standard text elements tagged with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key]) {
                // If it's an input or textarea, update the placeholder
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = data[key];
                } else {
                    el.innerText = data[key];
                }
            }
        });

        // Update Document Title (Browser Tab)
        if (data['site_title']) {
            document.title = data['site_title'];
        }

        // Visual Feedback: Bold the active language button
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Persist the choice
        localStorage.setItem('preferredLang', lang);

        // Notify specific pages to reload their .txt files (Bio/Contact Intro)
        window.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Translation Engine Error:", err);
    }
}

// Function called by the EN | ES buttons
function toggleLanguage(lang) {
    updatePageText(lang);
}
