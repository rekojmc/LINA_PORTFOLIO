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
        // We detect if we are in a subfolder and adjust the fetch path
        const path = window.location.pathname;
        const isSubfolder = path.includes('/about/') || path.includes('/contact/');
        const basePath = isSubfolder ? '../' : '';

        // 2. FETCH THE JSON FROM THE CORRECT LEVEL
        const response = await fetch(`${basePath}translations.json`);
        
        if (!response.ok) throw new Error("Translation file not found.");
        
        const allTrans = await response.json();
        const trans = allTrans[lang];

        // 3. SWAP TEXT (including injected components)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (trans[key]) {
                // If it's an input/textarea, update placeholder
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

    } catch (err) {
        console.error("Translation Error:", err);
    }
}
