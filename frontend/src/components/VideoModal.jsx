import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const backdropVariant = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(20px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }
};

const modalVariant = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3 } }
};

function VideoModal({ video, onClose }) {
    // Prevent background scrolling while modal is open
    useEffect(() => {
        if (!video) return; // FIX: Only lock scroll when video is active

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [video, onClose]);

    return (
        <AnimatePresence>
            {video && (
                <motion.div
                    className="video-modal-backdrop"
                    variants={backdropVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0, 0, 0, 0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    {/* Close Button Header */}
                    <button
                        onClick={onClose}
                        className="lightbox-close glow-hover glass-panel"
                        style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10000 }}
                    >
                        <X size={24} />
                    </button>

                    <motion.div
                        className="video-modal-content"
                        variants={modalVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()} // Prevent click propagating to close
                        style={{
                            width: '100%',
                            maxWidth: '1200px',
                            background: '#000',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--surface-color)' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {video.title}
                            </h2>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VideoModal;
