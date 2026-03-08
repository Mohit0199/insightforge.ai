const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = process.env.YOUTUBE_API_KEY;
const HANDLE = '@insightforge_9';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// In-memory cache to prevent hitting YT API quotas and speed up frontend load times
let cachedPlaylists = null;
let lastCacheTime = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

router.get('/', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({ error: "YOUTUBE_API_KEY is not configured in .env" });
        }

        // Return instant cached data if it exists and is fresh
        if (cachedPlaylists && lastCacheTime && (Date.now() - lastCacheTime < CACHE_DURATION_MS)) {
            console.log("Serving YouTube playlists from ultra-fast memory cache.");
            return res.json(cachedPlaylists);
        }

        console.log("Cache missed or expired. Resolving Channel ID for handle:", HANDLE);

        // 1. Fetch the Channel ID from the Handle
        const channelResponse = await axios.get(`${BASE_URL}/channels`, {
            params: {
                part: 'id',
                forHandle: HANDLE,
                key: API_KEY
            }
        });

        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
            return res.status(404).json({ error: "Channel not found for handle " + HANDLE });
        }

        const channelId = channelResponse.data.items[0].id;
        console.log("Resolved Channel ID:", channelId);

        // 2. Fetch the Channel's Playlists (recursive to get ALL of them)
        let rawPlaylists = [];
        let nextPageToken = '';

        do {
            const playlistsResponse = await axios.get(`${BASE_URL}/playlists`, {
                params: {
                    part: 'snippet',
                    channelId: channelId,
                    maxResults: 50, // max allowed
                    pageToken: nextPageToken || undefined,
                    key: API_KEY
                }
            });

            if (playlistsResponse.data.items) {
                rawPlaylists = rawPlaylists.concat(playlistsResponse.data.items);
            }
            nextPageToken = playlistsResponse.data.nextPageToken;
        } while (nextPageToken);

        if (rawPlaylists.length === 0) {
            return res.json([]);
        }

        console.log(`Fetched ${rawPlaylists.length} total playlists. Parsing videos...`);

        const structuredPlaylists = [];

        // 2. For each playlist, fetch its top 3 latest videos
        for (const pl of rawPlaylists) {
            // Skip empty playlists or "favorites"
            if (!pl.snippet) continue;

            const playlistId = pl.id;
            const playlistTitle = pl.snippet.title;

            const playlistItemsResponse = await axios.get(`${BASE_URL}/playlistItems`, {
                params: {
                    part: 'snippet,contentDetails',
                    playlistId: playlistId,
                    maxResults: 3, // We only need 3 videos per playlist for the UI grid
                    key: API_KEY
                }
            });

            const rawVideos = playlistItemsResponse.data.items;

            // If the playlist has no videos, skip it
            if (!rawVideos || rawVideos.length === 0) continue;

            const videos = rawVideos.map(item => ({
                id: item.contentDetails.videoId, // This is the ID we use for the iframe
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
            }));

            structuredPlaylists.push({
                id: playlistId,
                title: playlistTitle,
                thumbnail: pl.snippet.thumbnails?.high?.url || pl.snippet.thumbnails?.default?.url,
                videos: videos
            });
        }

        // Save to cache for the next user
        cachedPlaylists = structuredPlaylists;
        lastCacheTime = Date.now();
        console.log("Successfully cached new YouTube playlist data.");

        res.json(structuredPlaylists);

    } catch (error) {
        console.error("Error fetching live YouTube data:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to load live YouTube playlists" });
    }
});

module.exports = router;
