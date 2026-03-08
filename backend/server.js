require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const carouselsRouter = require('./routes/carousels');
const newslettersRouter = require('./routes/newsletters');
const youtubeRouter = require('./routes/youtube');
const playbooksRouter = require('./routes/playbooks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/carousels', carouselsRouter);
app.use('/api/newsletters', newslettersRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/playbooks', playbooksRouter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Insightforge.ai API is running smoothly.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
