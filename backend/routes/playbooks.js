const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const publicDir = path.join(__dirname, '../public/slide decks');

        if (!fs.existsSync(publicDir)) {
            return res.json([]);
        }

        const folders = fs.readdirSync(publicDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        let playbooks = folders.map(folder => {
            const folderPath = path.join(publicDir, folder);
            const files = fs.readdirSync(folderPath);
            const stats = fs.statSync(folderPath);

            // Filter image files and sort them numerically based on filename
            const imageFiles = files
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .sort((a, b) => {
                    const numA = parseInt(a.split('.')[0]) || 0;
                    const numB = parseInt(b.split('.')[0]) || 0;
                    return numA - numB;
                });

            // Clean up title (remove 'LM_' prefix, replace underscores with spaces)
            let rawTitle = folder;
            if (rawTitle.startsWith('LM_')) {
                rawTitle = rawTitle.substring(3);
            }
            const cleanTitle = rawTitle.replace(/_/g, ' ');

            // Generate URLs for frontend
            const imageUrls = imageFiles.map(file => `/slide decks/${folder}/${file}`);

            return {
                id: folder,
                title: cleanTitle,
                description: `A visual deep-dive playbook on ${cleanTitle}.`,
                tags: ['Playbook', 'Visual Guide'],
                coverImage: imageUrls[0] || null, // First slide is cover
                images: imageUrls,
                totalSlides: imageUrls.length,
                createdAt: stats.birthtime ? stats.birthtime.getTime() : stats.mtime.getTime() // use creation time for stable sorting
            };
        });

        // Sort playbooks newest to oldest (descending date)
        playbooks.sort((a, b) => b.createdAt - a.createdAt);

        res.json(playbooks);

    } catch (error) {
        console.error("Error generating playbooks:", error);
        res.status(500).json({ error: "Failed to generate playbooks from slide decks directory" });
    }
});

module.exports = router;
