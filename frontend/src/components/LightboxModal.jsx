import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
    })
};

function LightboxModal({ carousel, onClose }) {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Premium Features States
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlayProgress, setAutoPlayProgress] = useState(0);

    const [hoverPercent, setHoverPercent] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);

    const images = carousel.images || [];
    const totalSlides = images.length;
    const currentIndex = Math.max(0, Math.min(page, totalSlides - 1));

    // Auto-Play Logic
    const AUTO_PLAY_DURATION_MS = 4000;
    const UPDATE_INTERVAL_MS = 50;

    useEffect(() => {
        let interval;
        if (isPlaying && currentIndex < totalSlides - 1) {
            interval = setInterval(() => {
                setAutoPlayProgress((prev) => {
                    const nextVal = prev + (UPDATE_INTERVAL_MS / AUTO_PLAY_DURATION_MS) * 100;
                    if (nextVal >= 100) {
                        setPage([currentIndex + 1, 1]);
                        return 0; // reset for next slide
                    }
                    return nextVal;
                });
            }, UPDATE_INTERVAL_MS);
        } else {
            // Pause if we reach the end or user stops it
            if (currentIndex === totalSlides - 1) setIsPlaying(false);
            setAutoPlayProgress(0);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, totalSlides]);

    // Reset progress wildly if user manually changes slide while playing
    useEffect(() => {
        if (isPlaying) setAutoPlayProgress(0);
    }, [currentIndex, isPlaying]);

    // Navigation handlers
    const handlePrev = useCallback((e) => {
        if (e) e.stopPropagation();
        if (currentIndex > 0) setPage([currentIndex - 1, -1]);
    }, [currentIndex]);

    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        if (currentIndex < totalSlides - 1) setPage([currentIndex + 1, 1]);
    }, [currentIndex, totalSlides]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(p => !p);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    // Swipe handlers
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;

        if (distance > minSwipeDistance) handleNext();
        if (distance < -minSwipeDistance) handlePrev();
    };

    // Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }
        };
    }, []);

    // Scrubber Hover
    const handleScrubberMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        setHoverPercent(percent);

        // Calculate which slide index this maps to
        let hoveredIdx = Math.floor(percent * totalSlides);
        if (hoveredIdx >= totalSlides) hoveredIdx = totalSlides - 1;
        setHoverIndex(hoveredIdx);
    };

    const handleScrubberLeave = () => {
        setHoverPercent(null);
        setHoverIndex(null);
    };

    const handleScrubberClick = () => {
        if (hoverIndex !== null && hoverIndex !== currentIndex) {
            const dir = hoverIndex > currentIndex ? 1 : -1;
            setPage([hoverIndex, dir]);
        }
    };

    if (totalSlides === 0) return null;

    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (autoPlayProgress / 100) * circumference;

    return (
        <motion.div
            className="lightbox-backdrop"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="lightbox-header">
                <motion.h2
                    className="lightbox-title text-white"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {carousel.title}
                </motion.h2>

                <motion.div
                    className="top-controls-group"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <button className="icon-btn" onClick={toggleFullscreen} title="Focus Mode">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button className="icon-btn" style={{ marginLeft: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={onClose} title="Close">
                        <X size={24} />
                    </button>
                </motion.div>
            </div>

            {/* Main Content */}
            <div
                className="lightbox-content"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <motion.button
                    className="nav-arrow nav-prev"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
                    whileTap={{ scale: currentIndex === 0 ? 1 : 0.9 }}
                >
                    <ChevronLeft size={32} />
                </motion.button>

                <div className="slide-container">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                            key={page}
                            src={`${import.meta.env.VITE_API_URL}${images[currentIndex]}`}
                            alt={`${carousel.title} - Slide ${currentIndex + 1}`}
                            className="slide-image"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                scale: { duration: 0.3 }
                            }}
                            style={{ position: "absolute" }}
                        />
                    </AnimatePresence>
                </div>

                <motion.button
                    className="nav-arrow nav-next"
                    onClick={handleNext}
                    disabled={currentIndex === totalSlides - 1}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: currentIndex === totalSlides - 1 ? 1 : 1.1 }}
                    whileTap={{ scale: currentIndex === totalSlides - 1 ? 1 : 0.9 }}
                >
                    <ChevronRight size={32} />
                </motion.button>
            </div>

            {/* Play/Pause Button */}
            <motion.div
                className="play-btn-wrapper"
                onClick={() => setIsPlaying(!isPlaying)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
            >
                <svg className="progress-ring" width="56" height="56">
                    <circle
                        cx="28" cy="28" r={radius}
                        stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="transparent"
                    />
                    <circle
                        className="progress-ring-circle"
                        cx="28" cy="28" r={radius}
                        stroke="var(--accent-color)" strokeWidth="3" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                <div className="play-icon-btn">
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                </div>
            </motion.div>

            {/* Netflix Scrubber Bar */}
            <motion.div
                className="scrubber-container"
                onMouseMove={handleScrubberMove}
                onMouseLeave={handleScrubberLeave}
                onClick={handleScrubberClick}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {/* Hover Thumbnail Tooltip */}
                {hoverPercent !== null && hoverIndex !== null && (
                    <div
                        className="scrubber-preview-box"
                        style={{ left: `${hoverPercent * 100}%` }}
                    >
                        <img
                            src={`${import.meta.env.VITE_API_URL}${images[hoverIndex]}`}
                            alt="Preview"
                            className="preview-image"
                        />
                    </div>
                )}

                <div className="scrubber-track" />
                <div
                    className="scrubber-fill"
                    style={{ width: `${(currentIndex / Math.max(1, totalSlides - 1)) * 100}%` }}
                />
                {hoverPercent !== null && (
                    <div
                        className="scrubber-thumb"
                        style={{ left: `${hoverPercent * 100}%` }}
                    />
                )}
            </motion.div>

        </motion.div>
    );
}

export default LightboxModal;
