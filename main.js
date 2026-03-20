// This runs automatically every time ANY page loads
document.addEventListener('DOMContentLoaded', () => {
    // 1. Look in the "Global Memory" (localStorage)
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    
    // 2. Apply that language immediately
    applyTranslations(savedLang);
});

// This is called when someone clicks the EN or ES buttons
async function setLanguage(lang) {
    // 1. Update the "Global Memory"
    localStorage.setItem('preferredLang', lang);
    
    // 2. Update the current page's text
    await applyTranslations(lang);
}

async function applyTranslations(lang) {
    try {
        const response = await fetch('translations.json');
        const allTrans = await response.json();
        const trans = allTrans[lang];

        // Swap all text marked with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (trans[key]) {
                el.innerHTML = trans[key];
            }
        });

        // Toggle the 'active' class on your buttons for visual feedback
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `btn-${lang}`);
        });

    } catch (err) {
        console.error("Translation Error:", err);
    }
}
