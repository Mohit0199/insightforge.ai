import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Youtube, MonitorPlay, Search, PlayCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import VideoModal from '../components/VideoModal';

const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: (custom) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.1, type: "spring", stiffness: 300, damping: 24 }
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

function Videos({ searchTerm }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeVideo, setActiveVideo] = useState(null);
    const itemsPerPage = 3; // 3 playlists per page as requested

    // Parallax scroll effect for Hero Section
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, 100]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/youtube`);
                const data = await response.json();
                setPlaylists(data);
            } catch (error) {
                console.error("Failed to fetch youtube data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    // Filter based on search (searching playlist title)
    const filteredPlaylists = playlists.filter(p => {
        return !searchTerm || searchTerm === '' || p.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredPlaylists.length]);

    const totalPages = Math.ceil(filteredPlaylists.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentList = filteredPlaylists.slice(startIndex, startIndex + itemsPerPage);

    return (
        <main className="videos-page">
            <motion.section
                className="hero-section"
                style={{
                    opacity: heroOpacity,
                    y: heroY,
                    scale: heroScale,
                    paddingBottom: '2rem', minHeight: 'auto'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="hero-badge">
                        <Youtube size={16} /> Data Science Visualized
                    </div>
                    <h1 className="hero-title heading-gradient-main" style={{ fontSize: '3rem' }}>
                        Visual Learning Playlists
                    </h1>
                    <p className="hero-subtitle">
                        Watch our beautifully animated data science tutorials directly from YouTube. Master complex algorithms step-by-step.
                    </p>
                </motion.div>
            </motion.section>

            {loading ? (
                <div className="empty-state">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <MonitorPlay className="empty-icon glow" size={64} style={{ color: '#ff4e4e' }} />
                    </motion.div>
                    <p>Fetching channel playlists...</p>
                </div>
            ) : filteredPlaylists.length === 0 ? (
                <div className="empty-state">
                    <Search size={48} className="text-secondary mb-4" />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Playlists Found</h3>
                    <p className="text-secondary">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="youtube-playlists-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            className="playlists-list"
                            key={`yt-page-${currentPage}-${filteredPlaylists.length}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
                        >
                            {currentList.map((playlist, index) => (
                                <motion.div
                                    key={playlist.id}
                                    custom={index}
                                    variants={itemVariant}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="playlist-block"
                                    style={{
                                        background: 'var(--surface-color)',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '4px', height: '24px', background: '#ff4e4e', borderRadius: '4px' }}></div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {playlist.title}
                                        </h2>
                                    </div>

                                    <div className="youtube-grid" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1.5rem'
                                    }}>
                                        {playlist.videos.slice(0, 3).map((video) => (
                                            <div
                                                key={video.id}
                                                className="video-card spotlight-card"
                                                onClick={() => setActiveVideo(video)}
                                                style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingTop: '56.25%', // 16:9 Aspect Ratio
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    background: '#111',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                                    />
                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
                                                        <PlayCircle size={48} />
                                                    </div>
                                                </div>
                                                <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {video.title}
                                                </h4>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    <div style={{ marginTop: '2rem' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                </div>
            )}

            <VideoModal
                video={activeVideo}
                onClose={() => setActiveVideo(null)}
            />
        </main>
    );
}

export default Videos;
