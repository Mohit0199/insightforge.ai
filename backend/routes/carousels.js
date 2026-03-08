const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const carouselsDir = path.join(__dirname, '..', 'public', 'carousels');

// Ensure carousels directory exists
if (!fs.existsSync(carouselsDir)) {
    fs.mkdirSync(carouselsDir, { recursive: true });
}

// Helper to get directories
const getDirectories = (source) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

// Endpoint to fetch all carousels
router.get('/', (req, res) => {
    try {
        const folders = getDirectories(carouselsDir);
        console.log(`[API] Found ${folders.length} total folders`);

        const carouselsData = folders.map(folder => {
            const folderPath = path.join(carouselsDir, folder);

            // Read metadata if it exists
            const metadataPath = path.join(folderPath, 'metadata.json');
            // Detect Data Science Series
            let isSeries = false;
            let seriesName = null;
            let sequenceNumber = 0;
            let title = folder.replace(/-|_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            // Check if folder starts with DS_ (case-insensitive)
            if (folder.toUpperCase().startsWith('DS_')) {
                isSeries = true;

                // Remove 'DS_' prefix
                let namePart = folder.substring(3);

                // Find trailing numbers
                const match = namePart.match(/^(.+?)(_?\d+)$/);

                if (match) {
                    // It has numbers at the end
                    seriesName = match[1];
                    const numString = match[2].replace('_', ''); // remove optional underscore
                    sequenceNumber = parseInt(numString, 10);
                } else {
                    // No trailing numbers
                    seriesName = namePart;
                    sequenceNumber = 1; // Default
                }

                // Format Series Name safely
                // E.g. "FeatureEngineering" -> "Feature Engineering", but preserve acronyms like "EDA"
                if (!/^[A-Z]+$/.test(seriesName)) {
                    seriesName = seriesName
                        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lower and upper
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

            if (folder.includes('DS_')) console.log(`[API] Processing ${folder}: isSeries=${isSeries}`);

            if (fs.existsSync(metadataPath)) {
                try {
                    const rawData = fs.readFileSync(metadataPath, 'utf8');
                    metadata = { ...metadata, ...JSON.parse(rawData), id: folder };

                    // If it is a series, ensure we forcefully keep the Series Name tag even if metadata overwrites it
                    if (isSeries && !metadata.tags.includes(seriesName)) {
                        metadata.tags.push(seriesName);
                    }
                } catch (e) {
                    console.error(`Error parsing metadata in ${folder}:`, e);
                }
            }

            // Read images
            let images = [];
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                images = files
                    .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
                    .sort(); // Sort alphabetically (e.g. 1.jpg, 2.jpg)

                // More robust sorting for numbers (e.g., so 10.jpg comes after 2.jpg)
                // Also ensure "insightforge_outro" always goes to the very end
                images.sort((a, b) => {
                    const isOutroA = a.toLowerCase().includes('outro');
                    const isOutroB = b.toLowerCase().includes('outro');

                    if (isOutroA && !isOutroB) return 1;
                    if (!isOutroA && isOutroB) return -1;

                    const numA = parseInt(a.replace(/\D/g, ''), 10);
                    const numB = parseInt(b.replace(/\D/g, ''), 10);

                    // If both have numbers, sort numerically
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    // Fallback to alphabetical if no numbers are present
                    return a.localeCompare(b);
                });
            }

            if (folder.includes('DS_')) console.log(`[API] Returning metadata for ${folder} with ${images.length} images`);

            return {
                ...metadata,
                images: images.map(img => `/carousels/${folder}/${img}`),
                cover: images.length > 0 ? `/carousels/${folder}/${images[0]}` : null,
                slideCount: images.length
            };
        });

        // Filter out empty carousels
        const validCarousels = carouselsData.filter(c => c.images.length > 0);
        console.log(`[API] Valid carousels after empty filter: ${validCarousels.length}`);

        // Sort valid carousels: First non-series (alphabetical), then series (by name, then sequence)
        validCarousels.sort((a, b) => {
            if (a.isSeries && b.isSeries) {
                if (a.seriesName === b.seriesName) {
                    return a.sequenceNumber - b.sequenceNumber;
                }
                return a.seriesName.localeCompare(b.seriesName);
            }
            if (a.isSeries) return 1; // Send series to the back of general lists
            if (b.isSeries) return -1;
            return a.title.localeCompare(b.title);
        });

        res.json(validCarousels);
    } catch (error) {
        console.error('Error reading carousels:', error);
        res.status(500).json({ error: 'Failed to retrieve carousels data.' });
    }
});

module.exports = router;
