const fs = require('fs');
const path = require('path');

// 1. Configuration: Add any folders you want to scan
const folders = [
    { dir: 'images/portfolio', output: 'images/portfolio/portfolio-manifest.json' },
    { dir: 'images/about', output: 'images/about/about-manifest.json' }
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov'];

folders.forEach(folder => {
    const dirPath = path.join(__dirname, folder.dir);
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory not found: ${folder.dir}`);
        return;
    }

    // 2. Scan and filter files
    const files = fs.readdirSync(dirPath)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return allowedExtensions.includes(ext);
        });

    // 3. Write the JSON file
    fs.writeFileSync(path.join(__dirname, folder.output), JSON.stringify(files, null, 2));
    console.log(`✅ Generated manifest for ${folder.dir}: ${files.length} files found.`);
});
