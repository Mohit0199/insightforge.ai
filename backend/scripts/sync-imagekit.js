require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');

const CACHE_FILE = path.join(__dirname, '../data/.imagekit-sync-cache.json');
const MANIFEST_CAROUSELS = path.join(__dirname, '../data/carousels-manifest.json');
const MANIFEST_PLAYBOOKS = path.join(__dirname, '../data/playbooks-manifest.json');
const MANIFEST_NEWSLETTERS = path.join(__dirname, '../data/newsletters-manifest.json');

const PUBLIC_DIR = path.join(__dirname, '../public');
const CAROUSELS_DIR = path.join(PUBLIC_DIR, 'carousels');
const SLIDE_DECKS_DIR = path.join(PUBLIC_DIR, 'slide decks');
const NEWSLETTERS_DIR = path.join(PUBLIC_DIR, 'newsletters');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('Error: Missing ImageKit credentials in .env');
    process.exit(1);
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

function sanitizeFolderName(name) {
    return name
        .replace(/[^\w-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function sanitizeFileName(name) {
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    const cleanBase = base.replace(/[^\w-]/g, '_').replace(/_+/g, '_');
    return `${cleanBase}${ext.toLowerCase()}`;
}

function loadCache() {
    if (fs.existsSync(CACHE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        } catch (e) {
            console.warn('Warning: Could not parse sync cache, starting fresh.');
        }
    }
    return {};
}

function saveCache(cache) {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

async function uploadFileWithRetry(filePath, folderPath, fileName, maxRetries = 3) {
    const fileBuffer = fs.readFileSync(filePath);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await imagekit.upload({
                file: fileBuffer,
                fileName: fileName,
                folder: folderPath,
                useUniqueFileName: false,
                overwriteFile: true
            });
            return res;
        } catch (err) {
            if (attempt === maxRetries) throw err;
            const waitMs = Math.pow(2, attempt) * 1000;
            console.warn(`  [Retry ${attempt}/${maxRetries}] for ${fileName} in ${folderPath} after ${waitMs}ms: ${err.message || JSON.stringify(err)}`);
            await new Promise(r => setTimeout(r, waitMs));
        }
    }
}

async function runQueue(tasks, concurrency = 10, onProgress) {
    let index = 0;
    let completed = 0;
    const total = tasks.length;
    const errors = [];

    async function worker() {
        while (index < tasks.length) {
            const currentIdx = index++;
            const task = tasks[currentIdx];
            try {
                await task();
            } catch (err) {
                errors.push({ task: task.name || `Task #${currentIdx}`, error: err.message || err });
            } finally {
                completed++;
                if (onProgress) onProgress(completed, total);
            }
        }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
    return errors;
}

// ─── CAROUSELS METADATA BUILDER (INCREMENTAL MERGE) ──────────────────────────
function generateCarouselsData(endpointUrl) {
    const existingMap = new Map();
    if (fs.existsSync(MANIFEST_CAROUSELS)) {
        try {
            const existingData = JSON.parse(fs.readFileSync(MANIFEST_CAROUSELS, 'utf8'));
            existingData.forEach(item => existingMap.set(item.id, item));
        } catch (e) {
            console.warn('Could not read existing carousels manifest, starting fresh.');
        }
    }

    if (fs.existsSync(CAROUSELS_DIR)) {
        const folders = fs.readdirSync(CAROUSELS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        folders.forEach(folder => {
            const folderPath = path.join(CAROUSELS_DIR, folder);
            const metadataPath = path.join(folderPath, 'metadata.json');

            let isSeries = false;
            let seriesName = null;
            let sequenceNumber = 0;
            let title = folder.replace(/-|_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            if (folder.toUpperCase().startsWith('DS_')) {
                isSeries = true;
                let namePart = folder.substring(3);
                const match = namePart.match(/^(.+?)(_?\d+)$/);
                if (match) {
                    seriesName = match[1];
                    const numString = match[2].replace('_', '');
                    sequenceNumber = parseInt(numString, 10);
                } else {
                    seriesName = namePart;
                    sequenceNumber = 1;
                }

                if (!/^[A-Z]+$/.test(seriesName)) {
                    seriesName = seriesName
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .trim()
                        .replace(/ +/g, ' ');
                }
                title = `${seriesName} - Part ${sequenceNumber}`;
            }

            let metadata = {
                id: folder,
                title: title,
                tags: isSeries ? [seriesName, 'Data Science'] : [],
                description: isSeries ? `Part ${sequenceNumber} of the comprehensive ${seriesName} series.` : 'Explore this insight carousel.',
                isSeries: isSeries,
                seriesName: seriesName,
                sequenceNumber: sequenceNumber
            };

            if (fs.existsSync(metadataPath)) {
                try {
                    const rawData = fs.readFileSync(metadataPath, 'utf8');
                    metadata = { ...metadata, ...JSON.parse(rawData), id: folder };
                    if (isSeries && !metadata.tags.includes(seriesName)) {
                        metadata.tags.push(seriesName);
                    }
                } catch (e) {
                    console.error(`Error parsing metadata in ${folder}:`, e);
                }
            }

            let images = [];
            const files = fs.readdirSync(folderPath);
            images = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));

            images.sort((a, b) => {
                const isOutroA = a.toLowerCase().includes('outro');
                const isOutroB = b.toLowerCase().includes('outro');
                if (isOutroA && !isOutroB) return 1;
                if (!isOutroA && isOutroB) return -1;
                const numA = parseInt(a.replace(/\D/g, ''), 10);
                const numB = parseInt(b.replace(/\D/g, ''), 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            });

            if (images.length > 0) {
                const baseUrl = endpointUrl.replace(/\/+$/, '');
                const cleanFolder = sanitizeFolderName(folder);
                const cdnImages = images.map(img => `${baseUrl}/carousels/${cleanFolder}/${sanitizeFileName(img)}`);

                existingMap.set(folder, {
                    ...metadata,
                    images: cdnImages,
                    cover: cdnImages.length > 0 ? cdnImages[0] : null,
                    slideCount: images.length
                });
            }
        });
    }

    const mergedCarousels = Array.from(existingMap.values());
    mergedCarousels.sort((a, b) => {
        if (a.isSeries && b.isSeries) {
            if (a.seriesName === b.seriesName) return a.sequenceNumber - b.sequenceNumber;
            return a.seriesName.localeCompare(b.seriesName);
        }
        if (a.isSeries) return 1;
        if (b.isSeries) return -1;
        return a.title.localeCompare(b.title);
    });

    return mergedCarousels;
}

// ─── PLAYBOOKS METADATA BUILDER (INCREMENTAL MERGE) ──────────────────────────
function generatePlaybooksData(endpointUrl) {
    const existingMap = new Map();
    if (fs.existsSync(MANIFEST_PLAYBOOKS)) {
        try {
            const existingData = JSON.parse(fs.readFileSync(MANIFEST_PLAYBOOKS, 'utf8'));
            existingData.forEach(item => existingMap.set(item.id, item));
        } catch (e) {
            console.warn('Could not read existing playbooks manifest, starting fresh.');
        }
    }

    if (fs.existsSync(SLIDE_DECKS_DIR)) {
        const folders = fs.readdirSync(SLIDE_DECKS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const baseUrl = endpointUrl.replace(/\/+$/, '');

        folders.forEach(folder => {
            const folderPath = path.join(SLIDE_DECKS_DIR, folder);
            const files = fs.readdirSync(folderPath);
            const stats = fs.statSync(folderPath);

            const imageFiles = files
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .sort((a, b) => {
                    const numA = parseInt(a.split('.')[0]) || 0;
                    const numB = parseInt(b.split('.')[0]) || 0;
                    return numA - numB;
                });

            if (imageFiles.length > 0) {
                let rawTitle = folder.replace(/^\d+_/, '');
                if (rawTitle.startsWith('LM_')) rawTitle = rawTitle.substring(3);
                const cleanTitle = rawTitle.replace(/_/g, ' ');

                const cleanFolder = sanitizeFolderName(folder);
                const imageUrls = imageFiles.map(file => `${baseUrl}/slide_decks/${cleanFolder}/${sanitizeFileName(file)}`);

                existingMap.set(folder, {
                    id: folder,
                    title: cleanTitle,
                    description: `A visual deep-dive playbook on ${cleanTitle}.`,
                    tags: ['Playbook', 'Visual Guide'],
                    coverImage: imageUrls[0] || null,
                    images: imageUrls,
                    totalSlides: imageUrls.length,
                    createdAt: stats.birthtime ? stats.birthtime.getTime() : stats.mtime.getTime()
                });
            }
        });
    }

    const mergedPlaybooks = Array.from(existingMap.values());
    mergedPlaybooks.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
    return mergedPlaybooks;
}

// ─── NEWSLETTERS METADATA BUILDER (INCREMENTAL MERGE) ─────────────────────────
async function generateNewslettersData(endpointUrl) {
    const existingMap = new Map();
    if (fs.existsSync(MANIFEST_NEWSLETTERS)) {
        try {
            const existingData = JSON.parse(fs.readFileSync(MANIFEST_NEWSLETTERS, 'utf8'));
            existingData.forEach(item => existingMap.set(item.id, item));
        } catch (e) {
            console.warn('Could not read existing newsletters manifest, starting fresh.');
        }
    }

    if (fs.existsSync(NEWSLETTERS_DIR)) {
        const mammoth = require('mammoth');
        const folders = fs.readdirSync(NEWSLETTERS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const baseUrl = endpointUrl.replace(/\/+$/, '');

        for (const fol of folders) {
            const folPath = path.join(NEWSLETTERS_DIR, fol);
            const files = fs.readdirSync(folPath);
            const docxFile = files.find(f => f.endsWith('.docx'));
            const coverImage = files.find(f => f.match(/\.(png|jpe?g|gif|webp)$/i));

            if (!docxFile) continue;

            const docxPath = path.join(folPath, docxFile);
            const docxStat = fs.statSync(docxPath);

            try {
                const result = await mammoth.convertToHtml({ path: docxPath });
                const htmlStr = result.value;

                let folderDate = docxStat.mtime;
                const match = fol.match(/^(\d{2})-(\d{2})-(\d{4})_Edition/);
                if (match) {
                    const [_, day, month, year] = match;
                    folderDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
                }

                const cleanFolder = sanitizeFolderName(fol);
                const coverUrl = coverImage ? `${baseUrl}/newsletters/${cleanFolder}/${sanitizeFileName(coverImage)}` : null;

                existingMap.set(fol, {
                    id: fol,
                    title: docxFile.replace('.docx', ''),
                    cover: coverUrl,
                    htmlContent: htmlStr,
                    createdAt: folderDate
                });
            } catch (err) {
                console.error(`Error parsing ${docxFile}:`, err);
            }
        }
    }

    const mergedNewsletters = Array.from(existingMap.values());
    mergedNewsletters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return mergedNewsletters;
}

// ─── MAIN SYNC FUNCTION ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isManifestOnly = args.includes('--manifest-only');
    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

    console.log('=== Insightforge ImageKit Media Sync ===');
    console.log(`Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);
    console.log(`Mode: ${isDryRun ? 'DRY-RUN' : isManifestOnly ? 'MANIFEST-ONLY' : 'SYNC & UPLOAD'}`);

    const cache = loadCache();
    let pendingUploads = [];

    // 1. Scan Carousels
    if (fs.existsSync(CAROUSELS_DIR)) {
        const carouselFolders = fs.readdirSync(CAROUSELS_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const folder of carouselFolders) {
            const folderPath = path.join(CAROUSELS_DIR, folder);
            const cleanFolder = sanitizeFolderName(folder);
            const files = fs.readdirSync(folderPath).filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));

            for (const file of files) {
                const localPath = path.join(folderPath, file);
                const cleanFile = sanitizeFileName(file);
                const relKey = `carousels/${cleanFolder}/${cleanFile}`;
                if (!cache[relKey]) {
                    pendingUploads.push({
                        localPath,
                        relKey,
                        folder: `/carousels/${cleanFolder}`,
                        fileName: cleanFile
                    });
                }
            }
        }
    }

    // 2. Scan Slide Decks
    if (fs.existsSync(SLIDE_DECKS_DIR)) {
        const deckFolders = fs.readdirSync(SLIDE_DECKS_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const folder of deckFolders) {
            const folderPath = path.join(SLIDE_DECKS_DIR, folder);
            const cleanFolder = sanitizeFolderName(folder);
            const files = fs.readdirSync(folderPath).filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));

            for (const file of files) {
                const localPath = path.join(folderPath, file);
                const cleanFile = sanitizeFileName(file);
                const relKey = `slide_decks/${cleanFolder}/${cleanFile}`;
                if (!cache[relKey]) {
                    pendingUploads.push({
                        localPath,
                        relKey,
                        folder: `/slide_decks/${cleanFolder}`,
                        fileName: cleanFile
                    });
                }
            }
        }
    }

    // 3. Scan Newsletter Covers
    if (fs.existsSync(NEWSLETTERS_DIR)) {
        const newsFolders = fs.readdirSync(NEWSLETTERS_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const folder of newsFolders) {
            const folderPath = path.join(NEWSLETTERS_DIR, folder);
            const cleanFolder = sanitizeFolderName(folder);
            const files = fs.readdirSync(folderPath).filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));

            for (const file of files) {
                const localPath = path.join(folderPath, file);
                const cleanFile = sanitizeFileName(file);
                const relKey = `newsletters/${cleanFolder}/${cleanFile}`;
                if (!cache[relKey]) {
                    pendingUploads.push({
                        localPath,
                        relKey,
                        folder: `/newsletters/${cleanFolder}`,
                        fileName: cleanFile
                    });
                }
            }
        }
    }

    console.log(`\nScan Complete:`);
    console.log(`- Total Files in Cache: ${Object.keys(cache).length}`);
    console.log(`- Pending New Files to Upload: ${pendingUploads.length}`);

    if (pendingUploads.length > limit) {
        console.log(`- Limiting upload to ${limit} files as requested.`);
        pendingUploads = pendingUploads.slice(0, limit);
    }

    if (!isManifestOnly && pendingUploads.length > 0) {
        if (isDryRun) {
            console.log('\n[Dry Run] Sample pending files:');
            pendingUploads.slice(0, 5).forEach(p => console.log(`  -> ${p.relKey} (${p.folder}/${p.fileName})`));
        } else {
            console.log(`\nStarting upload of ${pendingUploads.length} files (concurrency: 10)...`);
            const startTime = Date.now();
            let lastSave = Date.now();

            const tasks = pendingUploads.map(item => async () => {
                const res = await uploadFileWithRetry(item.localPath, item.folder, item.fileName);
                cache[item.relKey] = {
                    fileId: res.fileId,
                    url: res.url,
                    filePath: res.filePath,
                    uploadedAt: new Date().toISOString()
                };

                if (Date.now() - lastSave > 3000) {
                    saveCache(cache);
                    lastSave = Date.now();
                }
            });

            const errors = await runQueue(tasks, 10, (done, total) => {
                if (done % 50 === 0 || done === total) {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                    const speed = (done / (elapsed || 1)).toFixed(1);
                    console.log(`Progress: ${done}/${total} files (${((done / total) * 100).toFixed(1)}%) — ${speed} files/sec`);
                }
            });

            saveCache(cache);
            console.log(`\nUpload batch finished in ${((Date.now() - startTime) / 1000).toFixed(1)}s! Errors: ${errors.length}`);
            if (errors.length > 0) {
                console.error('Some uploads encountered errors:', errors.slice(0, 5));
            }
        }
    }

    // Generate JSON Manifests
    console.log('\nGenerating lightweight data manifests...');
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    const carousels = generateCarouselsData(endpoint);
    fs.writeFileSync(MANIFEST_CAROUSELS, JSON.stringify(carousels, null, 2), 'utf8');
    console.log(`✓ Saved ${carousels.length} carousels to ${path.basename(MANIFEST_CAROUSELS)}`);

    const playbooks = generatePlaybooksData(endpoint);
    fs.writeFileSync(MANIFEST_PLAYBOOKS, JSON.stringify(playbooks, null, 2), 'utf8');
    console.log(`✓ Saved ${playbooks.length} playbooks to ${path.basename(MANIFEST_PLAYBOOKS)}`);

    const newsletters = await generateNewslettersData(endpoint);
    fs.writeFileSync(MANIFEST_NEWSLETTERS, JSON.stringify(newsletters, null, 2), 'utf8');
    console.log(`✓ Saved ${newsletters.length} newsletters to ${path.basename(MANIFEST_NEWSLETTERS)}`);

    console.log('\n=== All Done! ===');
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
