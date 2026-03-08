import React, { useState, useEffect } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CarouselGrid from '../components/CarouselGrid';
import LightboxModal from '../components/LightboxModal';
import SeriesView from '../components/SeriesView';

function Home({ searchTerm }) {
    const [carousels, setCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCarousel, setActiveCarousel] = useState(null);
    const [viewMode, setViewMode] = useState('library'); // 'library' or 'series'

    // Parallax scroll effect for Hero Section
    const { scrollY } = useScroll();
    // Fade out as we scroll down (0 to 300px)
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    // Move up slightly slower than the scroll (parallax)
    const heroY = useTransform(scrollY, [0, 300], [0, 100]);
    // Subtle scale down
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

    // Fetch data from backend
    useEffect(() => {
        const fetchCarousels = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/carousels`);
                const data = await response.json();
                setCarousels(data);
            } catch (error) {
                console.error("Failed to fetch carousels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCarousels();
    }, []);

    // Filtered list based on search
    const filteredCarousels = carousels.filter(c => {
        const matchesSearch = !searchTerm || searchTerm === '' ||
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    // Lock body scroll when modal is open
    useEffect(() => {
        if (activeCarousel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [activeCarousel]);

    return (
        <>
            <main>
                {/* Dynamic Hero Section */}
                <motion.section
                    className="hero-section"
                    style={{
                        opacity: heroOpacity,
                        y: heroY,
                        scale: heroScale
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Sparkles size={16} /> Data Science • Engineered for Humans
                        </motion.div>

                        <motion.h1
                            className="hero-title heading-gradient-main"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Master the Future of AI. <br /> In Minutes, not Months.
                        </motion.h1>

                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Explore our curated deck of highly visual, interactive carousels. Simplify complex machine learning concepts into bite-sized actionable insights.
                        </motion.p>

                        {!loading && carousels.length > 0 && (
                            <motion.div
                                className="view-toggle-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <button
                                    className={`view-toggle-btn ${viewMode === 'series' ? 'active' : ''}`}
                                    onClick={() => setViewMode('series')}
                                >
                                    Data Science Courses
                                </button>
                                <button
                                    className={`view-toggle-btn ${viewMode === 'library' ? 'active' : ''}`}
                                    onClick={() => setViewMode('library')}
                                >
                                    Full Library
                                </button>
                            </motion.div>
                        )}
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
                        <p>Forging the academy...</p>
                    </div>
                ) : (
                    viewMode === 'series' ? (
                        <SeriesView carousels={filteredCarousels} onOpenCarousel={setActiveCarousel} />
                    ) : (
                        <CarouselGrid
                            carousels={filteredCarousels}
                            onOpenCarousel={setActiveCarousel}
                        />
                    )
                )}
            </main>

            {activeCarousel && (
                <LightboxModal
                    carousel={activeCarousel}
                    onClose={() => setActiveCarousel(null)}
                />
            )}
        </>
    );
}

export default Home;
