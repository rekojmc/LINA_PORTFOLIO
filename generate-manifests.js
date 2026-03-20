const fs = require('fs');
const path = require('path');

// 1. Configuration: Folders to scan and where to save the manifests
const configs = [
    { dir: './images/portfolio', output: './images/portfolio/portfolio-manifest.json' },
    { dir: './images/about', output: './images/about/about-manifest.json' }
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];

configs.forEach(config => {
    // Check if directory exists
    if (!fs.existsSync(config.dir)) {
        console.warn(`⚠️  Directory not found: ${config.dir}`);
        return;
    }

    // Scan directory
    const files = fs.readdirSync(config.dir);

    // Filter for valid media files and ignore hidden files (like .DS_Store)
    const mediaFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
    });

    // Write to JSON file
    fs.writeFileSync(config.output, JSON.stringify(mediaFiles, null, 2));
    console.log(`✅ Generated ${config.output} (${mediaFiles.length} items found)`);
});