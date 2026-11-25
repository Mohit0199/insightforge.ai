const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const carouselsDir = path.resolve(__dirname, '../public/carousels');
const zips = fs.readdirSync(carouselsDir).filter(f => f.toLowerCase().endsWith('.zip'));

console.log(`Found ${zips.length} zip files in ${carouselsDir}`);

for (const zip of zips) {
    const baseName = path.basename(zip, path.extname(zip));
    const targetDir = path.join(carouselsDir, baseName);
    const zipPath = path.join(carouselsDir, zip);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    execSync(`tar -xf "${zipPath}" -C "${targetDir}"`);
    fs.unlinkSync(zipPath);

    // Flatten nested insightforge-carousel if present
    const nestedDir = path.join(targetDir, 'insightforge-carousel');
    if (fs.existsSync(nestedDir)) {
        const innerFiles = fs.readdirSync(nestedDir);
        for (const file of innerFiles) {
            fs.renameSync(path.join(nestedDir, file), path.join(targetDir, file));
        }
        fs.rmdirSync(nestedDir);
    }

    const slideCount = fs.readdirSync(targetDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
    console.log(`✓ Extracted ${baseName}: ${slideCount} slides`);
}

console.log('Extraction & flattening completed successfully!');
