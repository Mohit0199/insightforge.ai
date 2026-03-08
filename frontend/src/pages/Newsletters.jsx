import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Layers, Calendar, ChevronLeft, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import NewsletterReader from '../components/NewsletterReader';

const containerVariant = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: (custom) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.08, type: "spring", stiffness: 300, damping: 24 }
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

function Newsletters({ searchTerm }) {
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNewsletter, setActiveNewsletter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Parallax scroll effect for Hero Section
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, 100]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

    useEffect(() => {
        const fetchNewsletters = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletters`);
                const data = await response.json();
                setNewsletters(data);
            } catch (error) {
                console.error("Failed to fetch newsletters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsletters();
    }, []);

    // Filtered list based on search
    const filteredNewsletters = newsletters.filter(n => {
        const matchesSearch = !searchTerm || searchTerm === '' ||
            n.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredNewsletters.length]);

    const totalPages = Math.ceil(filteredNewsletters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentList = filteredNewsletters.slice(startIndex, startIndex + itemsPerPage);

    // Mouse tracking for spotlight effect
    const handleMouseMove = (e, index) => {
        const card = document.getElementById(`nl-card-${index}`);
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    };

    if (activeNewsletter) {
        return (
            <NewsletterReader
                newsletter={activeNewsletter}
                onBack={() => setActiveNewsletter(null)}
            />
        );
    }

    return (
        <main className="newsletters-page">
            <motion.section
                className="hero-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    opacity: heroOpacity,
                    y: heroY,
                    scale: heroScale,
                    paddingBottom: '2rem', minHeight: 'auto'
                }}
            >
                <div className="hero-badge">
                    <Calendar size={16} /> The InsightForge Weekly
                </div>
                <h1 className="hero-title heading-gradient-main" style={{ fontSize: '3rem' }}>
                    Data Science Dispatches
                </h1>
                <p className="hero-subtitle">
                    Read our weekly deep-dives into AI, machine learning, and data engineering. Raw content straight from the source.
                </p>
            </motion.section>

            {loading ? (
                <div className="empty-state">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Layers className="empty-icon glow" size={64} />
                    </motion.div>
                    <p>Loading dispatches...</p>
                </div>
            ) : filteredNewsletters.length === 0 ? (
                <div className="empty-state">
                    <Search size={48} className="text-secondary mb-4" />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Newsletters Found</h3>
                    <p className="text-secondary">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="newsletter-grid-container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            className="newsletter-list"
                            key={`nl-page-${currentPage}-${filteredNewsletters.length}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            {currentList.map((nl, index) => {
                                const dateStr = new Date(nl.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                });
                                return (
                                    <motion.div
                                        id={`nl-card-${index}`}
                                        key={nl.id}
                                        className="newsletter-card spotlight-card"
                                        onMouseMove={(e) => handleMouseMove(e, index)}
                                        onClick={() => setActiveNewsletter(nl)}
                                        custom={index}
                                        variants={itemVariant}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ display: 'flex', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', height: '180px' }}
                                    >
                                        <div className="spotlight-overlay"></div>
                                        <div style={{ width: '240px', flexShrink: 0 }}>
                                            <img
                                                src={nl.cover ? `${import.meta.env.VITE_API_URL}${nl.cover}` : '/placeholder.jpg'}
                                                alt={nl.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {dateStr}
                                            </div>
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                                                {nl.title}
                                            </h3>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                Read Article <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
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
        </main>
    );
}

export default Newsletters;
