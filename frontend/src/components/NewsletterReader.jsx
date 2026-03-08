import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

function NewsletterReader({ newsletter, onBack }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const dateStr = new Date(newsletter.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <motion.article
            className="newsletter-reader"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}
        >
            <button
                onClick={onBack}
                className="back-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: '1rem 0', marginBottom: '1rem', transition: 'color 0.2s', alignSelf: 'flex-start' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
                <ChevronLeft size={20} /> Back to Newsletters
            </button>

            <header style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Published on {dateStr}
                </div>
                <h1 style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '2rem' }}>
                    {newsletter.title}
                </h1>

                {newsletter.cover && (
                    <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
                        <img
                            src={`${import.meta.env.VITE_API_URL}${newsletter.cover}`}
                            alt="Cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
            </header>

            <div
                className="reader-content"
                dangerouslySetInnerHTML={{ __html: newsletter.htmlContent }}
                style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}
            />
        </motion.article>
    );
}

export default NewsletterReader;
