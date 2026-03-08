import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import Pagination from './Pagination';

function SeriesRow({ seriesName, carousels, onOpenCarousel, index = 0 }) {
    const rowRef = useRef(null);

    const handleScroll = (direction) => {
        if (rowRef.current) {
            const scrollAmount = window.innerWidth * 0.7; // scroll 70% of screen width
            rowRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <motion.div
            className="series-row-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
        >
            <h2 className="series-row-title">{seriesName} Course</h2>

            <div className="series-slider-wrapper">
                <button className="slider-btn left" onClick={() => handleScroll('left')}>
                    <ChevronLeft size={32} />
                </button>

                <div className="series-row" ref={rowRef}>
                    {carousels.map((carousel, cardIndex) => (
                        <motion.div
                            key={carousel.id || carousel.title}
                            className="series-card spotlight-card"
                            onClick={() => onOpenCarousel(carousel)}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--x', `${x}px`);
                                e.currentTarget.style.setProperty('--y', `${y}px`);
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index * 0.15) + (cardIndex * 0.08) + 0.1, type: "spring", stiffness: 300, damping: 24 }}
                            whileHover={{
                                scale: 1.05,
                                zIndex: 10,
                                y: -10,
                                boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.8), 0 0 25px rgba(139, 92, 246, 0.4)"
                            }}
                        >
                            <div className="spotlight-overlay"></div>
                            <div className="series-image-wrapper">
                                <img
                                    src={carousel.cover ? `${import.meta.env.VITE_API_URL}${carousel.cover}` : '/placeholder.jpg'}
                                    alt={carousel.title}
                                    loading="lazy"
                                />
                                <div className="series-sequence-badge">Part {carousel.sequenceNumber}</div>
                            </div>
                            <div className="series-overlay">
                                <h3 className="series-title">{carousel.title}</h3>
                                <div className="series-meta">
                                    <span>
                                        <Layers size={12} color="var(--accent-color)" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        {carousel.slideCount} slides
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button className="slider-btn right" onClick={() => handleScroll('right')}>
                    <ChevronRight size={32} />
                </button>
            </div>
        </motion.div>
    );
}

function SeriesView({ carousels, onOpenCarousel }) {
    // Extract and group series
    // Use explicit filter: look for isSeries flag OR a DS_-prefixed id as fallback
    const seriesGroups = carousels.reduce((acc, current) => {
        const inSeries = current.isSeries === true || current.isSeries === 'true' || (current.id && current.id.startsWith('DS_'));
        const name = current.seriesName || null;
        if (inSeries && name) {
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(current);
        }
        return acc;
    }, {});

    // Sort each group by sequence number
    Object.keys(seriesGroups).forEach(key => {
        seriesGroups[key].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    });

    const sortedSeriesNames = Object.keys(seriesGroups).sort();

    if (sortedSeriesNames.length === 0) {
        return (
            <div className="empty-state">
                <h3 style={{ color: "white", fontSize: "1.5rem" }}>No Courses Found.</h3>
                <p>Ensure your backend folders are prefixed with 'DS_'.</p>
            </div>
        );
    }

    // Pagination logic
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 if search term changes the total number of items
    useEffect(() => {
        setCurrentPage(1);
    }, [carousels.length]);

    const totalPages = Math.ceil(sortedSeriesNames.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSeriesNames = sortedSeriesNames.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll near top
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <motion.div
            className="series-view-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="series-view-header">
                <h1 className="heading-gradient-main" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Data Science Core Series</h1>
                <p className="text-secondary" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
                    Master concepts from zero to expert. These sequences are designed to be consumed in order.
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    className="series-rows-list"
                    key={`series-page-${currentPage}-${currentSeriesNames.length}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                    {currentSeriesNames.map((seriesName, index) => (
                        <SeriesRow
                            key={seriesName}
                            seriesName={seriesName}
                            carousels={seriesGroups[seriesName]}
                            onOpenCarousel={onOpenCarousel}
                            index={index}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
            />
        </motion.div>
    );
}

export default SeriesView;
