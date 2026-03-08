const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const NEWSLETTERS_DIR = path.join(__dirname, '../public/newsletters');

router.get('/', async (req, res) => {
    try {
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

            if (!docxFile) continue; // Skip if no .docx file is found

            const docxPath = path.join(folPath, docxFile);
            const docxStat = fs.statSync(docxPath);

            // Use Mammoth to convert the .docx to HTML
            try {
                const result = await mammoth.convertToHtml({ path: docxPath });
                const htmlStr = result.value; // The generated HTML

                // You can also access result.messages for warnings

                newsletters.push({
                    id: fol,
                    title: docxFile.replace('.docx', ''), // Use file name as title
                    cover: coverImage ? `/newsletters/${encodeURIComponent(fol)}/${encodeURIComponent(coverImage)}` : null,
                    htmlContent: htmlStr,
                    createdAt: docxStat.mtime // Use modification time as publish date
                });
            } catch (err) {
                console.error(`Error parsing ${docxFile}:`, err);
            }
        }

        // Sort by created at descending
        newsletters.sort((a, b) => b.createdAt - a.createdAt);

        res.json(newsletters);

    } catch (error) {
        console.error("Error reading newsletters:", error);
        res.status(500).json({ error: "Failed to load newsletters" });
    }
});

module.exports = router;
