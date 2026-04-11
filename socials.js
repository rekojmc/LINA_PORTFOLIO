const LINA_SOCIALS = {
    instagram: "https://instagram.com/lina.hernandez02",
    tiktok: "https://tiktok.com/@linahernandez021",
    facebook: "https://www.facebook.com/people/Lina-Hern%C3%A1ndez/61555678802711/",
    email: "mailto:contact@linahernandez.com", // Optional: Centralize email too
    linkedin: "https://linkedin.com/",
    youtube: "https://www.youtube.com"
};

// Turn the logic into a named function
function updateSocialLinks() {
    const socialLinks = document.querySelectorAll("[data-social]");
    socialLinks.forEach(link => {
        const platform = link.getAttribute("data-social");
        if (LINA_SOCIALS[platform]) {
            link.href = LINA_SOCIALS[platform];
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        }
    });
}

// Keep this so it still works for links already in the HTML
document.addEventListener("DOMContentLoaded", updateSocialLinks);