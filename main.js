// This runs automatically every time ANY page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    applyTranslations(savedLang);
});

async function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    await applyTranslations(lang);
}

async function applyTranslations(lang) {
    try {
        // 1. SMART PATH CALCULATION
        const path = window.location.pathname;
        const isSubfolder = path.includes('/about/') || path.includes('/contact/');
        const basePath = isSubfolder ? '../' : '';

        // 2. FETCH THE JSON
        const response = await fetch(`${basePath}translations.json`);
        if (!response.ok) throw new Error("Translation file not found.");
        
        const allTrans = await response.json();
        const trans = allTrans[lang];

        // 3. SWAP TEXT
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (trans[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = trans[key];
                } else {
                    el.innerHTML = trans[key];
                }
            }
        });

        // 4. SYNC ACTIVE BUTTONS
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `btn-${lang}`);
        });

        // --- THE MISSING LINK ---
        // 5. BROADCAST THE CHANGE
        // This sends a signal that loadBio() and loadContactIntro() are listening for.
        window.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Translation Error:", err);
    }
}