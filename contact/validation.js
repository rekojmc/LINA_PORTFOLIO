/* Lina Hernandez Official Stylesheet
   -----------------------------------
   Folder: /style.css
*/

:root {
    --primary: #1a1a1a;    /* Deep Charcoal */
    --accent: #d4af37;     /* Soft Gold */
    --bg: #fafafa;         /* Off-White */
    --white: #ffffff;
    --glass: rgba(255, 255, 255, 0.85);
}

* {
    box-sizing: border-box;
    scroll-behavior: smooth;
}

body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: var(--bg);
    color: var(--primary);
    line-height: 1.6;
}

h1, h2, h3 {
    font-family: 'Playfair Display', serif;
    margin: 0;
}

/* NAVIGATION */
.glass-nav {
    position: fixed;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 5%;
    background: var(--glass);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.logo {
    font-weight: 700;
    letter-spacing: 2px;
    font-size: 1.2rem;
}

.nav-links a {
    text-decoration: none;
    color: var(--primary);
    margin-left: 25px;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: 0.3s;
}

.nav-links a:hover {
    color: var(--accent);
}

/* BUTTONS */
.btn {
    display: inline-block;
    padding: 15px 35px;
    text-decoration: none;
    font-weight: 600;
    border-radius: 2px;
    transition: 0.3s;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
}

.btn.primary {
    background: var(--primary);
    color: var(--white);
}

.btn.primary:hover {
    background: var(--accent);
}

/* HOME HERO SECTION */
.hero {
    height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), 
                url('images/main/hero.jpg') center/cover no-repeat;
    display: flex;
    align-items: center;
    padding: 0 10%;
}

.hero-overlay h1 {
    font-size: clamp(3rem, 10vw, 5rem);
    color: var(--white);
    line-height: 1.1;
    margin-bottom: 20px;
}

.tagline {
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 4px;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 10px;
}

/* SPLIT CATEGORY SECTION */
.split-links {
    display: flex;
    height: 70vh;
}

.split-box { 
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--white);
    transition: 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    text-decoration: none;
    position: relative;
    overflow: hidden;
}

.lifestyle-link { 
    background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                url('images/lifestyle/cover.jpg') center/cover; 
}

.fitness-link { 
    background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                url('images/fitness/cover.jpg') center/cover; 
}

.split-box:hover {
    flex: 1.4;
    filter: brightness(1.1);
}

.box-content h2 { font-size: 2.5rem; }

/* CONTACT PAGE SPECIFIC */
.contact-hero {
    height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                url('images/contact/hero.jpg') center/cover no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 5% 0 5%;
}

.form-container {
    background: var(--white);
    padding: 50px;
    border-radius: 4px;
    width: 100%;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.input-group {
    margin-bottom: 15px;
}

.input-group input, 
.input-group textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #eee;
    background: #fdfdfd;
    font-family: inherit;
    font-size: 1rem;
}

.input-group input:focus {
    border-color: var(--accent);
    outline: none;
}

/* FOOTER */
footer {
    padding: 60px 5%;
    text-align: center;
    background: var(--white);
    border-top: 1px solid #eee;
}

/* MOBILE RESPONSIVENESS */
@media (max-width: 768px) {
    .nav-links { display: none; } /* Simplified for mobile */
    
    .split-links {
        flex-direction: column;
        height: 100vh;
    }
    
    .hero-overlay h1 { font-size: 3rem; }
    
    .form-container {
        padding: 30px 20px;
    }
}