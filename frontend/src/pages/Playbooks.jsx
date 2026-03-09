import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Layers } from 'lucide-react';
import Pagination from '../components/Pagination';
import LightboxModal from '../components/LightboxModal';

const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

function Playbooks({ searchTerm }) {
    const [playbooks, setPlaybooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activePlaybook, setActivePlaybook] = useState(null);
    const itemsPerPage = 4;

    // Parallax scroll effect for Hero Section
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, 100]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

    useEffect(() => {
        const fetchPlaybooks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/playbooks`);
                const data = await response.json();
                setPlaybooks(data);
            } catch (error) {
                console.error("Failed to fetch playbooks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaybooks();
    }, []);

    // Body scroll lock logic
    useEffect(() => {
        if (activePlaybook) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [activePlaybook]);

    // Apply search filter
    const filteredPlaybooks = playbooks.filter(p => {
        if (!searchTerm) return true;
        const searchPath = searchTerm.toLowerCase();
        return p.title.toLowerCase().includes(searchPath) ||
            p.tags.some(t => t.toLowerCase().includes(searchPath));
    });

    const totalPages = Math.ceil(filteredPlaybooks.length / itemsPerPage);
    const paginatedPlaybooks = filteredPlaybooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <main className="playbooks-page">
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
                        <BookOpen size={16} /> Conceptual Blueprints
                    </div>
                    <h1 className="hero-title heading-gradient-main" style={{ fontSize: '3rem' }}>
                        Visual Concept Playbooks
                    </h1>
                    <p className="hero-subtitle">
                        High-level visual summaries mapping the core of AI data structures. Master complex architectural designs before diving into the code.
                    </p>
                </motion.div>
            </motion.section>

            {loading ? (
                <div className="empty-state">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    >
                        <Layers className="empty-icon glow" size={64} />
                    </motion.div>
                    <p>Fetching playbooks...</p>
                </div>
            ) : paginatedPlaybooks.length === 0 ? (
                <div className="empty-state">
                    <p>No playbooks found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem 5%' }}>
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            className="playbooks-grid"
                        >
                            {paginatedPlaybooks.map((playbook, index) => (
                                <motion.div
                                    key={playbook.id}
                                    variants={itemVariant}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="library-card glass-panel"
                                    onClick={() => setActivePlaybook(playbook)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        padding: 0,
                                        overflow: 'hidden',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        position: 'relative',
                                        aspectRatio: '16/9'
                                    }}
                                >
                                    {/* Full bleed cover image emphasizing presentation style */}
                                    {playbook.coverImage ? (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundImage: `url("${import.meta.env.VITE_API_URL}${encodeURI(playbook.coverImage)}")`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: '#111'
                                            }}
                                            className="playbook-cover-img"
                                        />
                                    ) : (
                                        <div className="placeholder-image" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
                                            <Layers size={48} opacity={0.2} />
                                        </div>
                                    )}

                                    {/* Minimalist lower-third gradient overlay for text */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '1.5rem',
                                        background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 40%, transparent 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                        zIndex: 5
                                    }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{playbook.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                            <BookOpen size={14} />
                                            <span>{playbook.totalSlides} Slides</span>
                                        </div>
                                    </div>

                                    {/* Hover play overlay */}
                                    <div className="playbook-hover-overlay">
                                        <span>View Playbook</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>
            )}

            {/* Re-use the Lightbox for slide viewing */}
            {activePlaybook && (
                <LightboxModal
                    carousel={activePlaybook}
                    onClose={() => setActivePlaybook(null)}
                />
            )}
        </main>
    );
}

export default Playbooks;
