const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const NEWSLETTERS_DIR = path.join(__dirname, '../public/newsletters');

// ─── In-memory cache ────────────────────────────────────────────────
let cache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

router.get('/', async (req, res) => {
    try {
        // Serve from cache if fresh
        if (cache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) {
            console.log('[newsletters] serving from cache');
            return res.json(cache);
        }

        console.log('[newsletters] cache miss — parsing .docx files...');

        if (!fs.existsSync(NEWSLETTERS_DIR)) {
            return res.json([]);
        }

        const folders = fs.readdirSync(NEWSLETTERS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const newsletters = [];

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

                // Parse exact date from folder name: "24-05-2025_Edition 001"
                let folderDate = docxStat.mtime;
                const match = fol.match(/^(\d{2})-(\d{2})-(\d{4})_Edition/);
                if (match) {
                    const [_, day, month, year] = match;
                    folderDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
                }

                newsletters.push({
                    id: fol,
                    title: docxFile.replace('.docx', ''),
                    cover: coverImage ? `/newsletters/${encodeURIComponent(fol)}/${encodeURIComponent(coverImage)}` : null,
                    htmlContent: htmlStr,
                    createdAt: folderDate
                });
            } catch (err) {
                console.error(`Error parsing ${docxFile}:`, err);
            }
        }

        // Sort by publish date descending (newest first based on actual folder timestamp)
        newsletters.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Store in cache
        cache = newsletters;
        cacheTimestamp = Date.now();

        res.json(newsletters);

    } catch (error) {
        console.error("Error reading newsletters:", error);
        res.status(500).json({ error: "Failed to load newsletters" });
    }
});

module.exports = router;
