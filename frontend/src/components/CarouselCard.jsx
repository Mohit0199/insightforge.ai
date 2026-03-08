import React from 'react';
import { Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: (custom) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.08, type: "spring", stiffness: 300, damping: 24 }
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

function CarouselCard({ carousel, onOpen, index = 0 }) {
    const cardRef = React.useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', `${x}px`);
        cardRef.current.style.setProperty('--y', `${y}px`);
    };

    return (
        <motion.div
            ref={cardRef}
            className="carousel-card spotlight-card"
            onMouseMove={handleMouseMove}
            onClick={onOpen}
            custom={index}
            variants={itemVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            whileHover={{
                y: -12,
                scale: 1.02,
                boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="spotlight-overlay"></div>
            <div className="card-image-wrapper">
                <img
                    src={carousel.cover ? `${import.meta.env.VITE_API_URL}${carousel.cover}` : '/placeholder.jpg'}
                    alt={carousel.title}
                    loading="lazy"
                />
            </div>
            <div className="card-overlay">
                <h3 className="card-title">{carousel.title}</h3>
                <div className="card-meta">
                    {carousel.tags && carousel.tags.length > 0 && (
                        <span className="card-tag">{carousel.tags[0]}</span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Layers size={14} color="var(--accent-color)" />
                        {carousel.slideCount} slides
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default CarouselCard;
