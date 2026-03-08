import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CarouselCard from './CarouselCard';
import Pagination from './Pagination';



function CarouselGrid({ carousels, onOpenCarousel }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Reset page to 1 when search or data changes significantly
    useEffect(() => {
        setCurrentPage(1);
    }, [carousels.length]);

    if (!carousels || carousels.length === 0) {
        return (
            <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h3 style={{ color: "white", fontSize: "1.5rem" }}>No insights found.</h3>
                <p>Try adjusting your search or filter tags.</p>
            </motion.div>
        );
    }

    const totalPages = Math.ceil(carousels.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCarousels = carousels.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll near top of grid
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <div className="carousel-grid-container">
            <AnimatePresence mode="wait">
                <motion.div
                    className="carousel-grid"
                    key={`grid-${currentPage}-${currentCarousels.length}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                    {currentCarousels.map((carousel, index) => (
                        <CarouselCard
                            key={carousel.id || carousel.title}
                            carousel={carousel}
                            onOpen={() => onOpenCarousel(carousel)}
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
        </div>
    );
}

export default CarouselGrid;
