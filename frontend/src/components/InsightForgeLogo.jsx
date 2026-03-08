import React from 'react';

/**
 * InsightForgeLogo — an inline SVG recreation of the user's brand logo.
 * Uses the site's accent gradient palette on a fully transparent background.
 * 
 * Props:
 *   size     – controls the overall scale (default 40 for icon, 28 for navbar)
 *   variant  – "full" shows icon + wordmark + tagline (footer)
 *              "compact" shows icon + wordmark only (navbar)
 */
function InsightForgeLogo({ size = 40, variant = 'full' }) {
    const iconSize = size;
    const textScale = size / 40;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* ── ICON MARK ── circular badge with bar-chart inside */}
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="if-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-color, #a855f7)" />
                        <stop offset="100%" stopColor="var(--accent-secondary, #6366f1)" />
                    </linearGradient>
                    <linearGradient id="if-bars" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="var(--accent-color, #a855f7)" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0.9" />
                    </linearGradient>
                </defs>

                {/* outer ring */}
                <circle cx="50" cy="50" r="46" stroke="url(#if-ring)" strokeWidth="7" />

                {/* 4 cross-hair ticks at N/S/E/W */}
                <line x1="50" y1="4" x2="50" y2="16" stroke="url(#if-ring)" strokeWidth="7" strokeLinecap="round" />
                <line x1="50" y1="84" x2="50" y2="96" stroke="url(#if-ring)" strokeWidth="7" strokeLinecap="round" />
                <line x1="4" y1="50" x2="16" y2="50" stroke="url(#if-ring)" strokeWidth="7" strokeLinecap="round" />
                <line x1="84" y1="50" x2="96" y2="50" stroke="url(#if-ring)" strokeWidth="7" strokeLinecap="round" />

                {/* dark filled circle background */}
                <circle cx="50" cy="50" r="33" fill="rgba(0,0,0,0.6)" />

                {/* bar-chart bars (left small, center medium, right tall) */}
                <rect x="28" y="56" width="10" height="16" rx="2" fill="url(#if-bars)" />
                <rect x="42" y="46" width="10" height="26" rx="2" fill="url(#if-bars)" />
                <rect x="56" y="34" width="10" height="38" rx="2" fill="url(#if-bars)" />
            </svg>

            {/* ── WORD MARK ── */}
            {variant !== 'icon-only' && (
                <div style={{ lineHeight: 1.15 }}>
                    <div
                        style={{
                            fontSize: `${1.45 * textScale}rem`,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(90deg, var(--accent-color, #a855f7), var(--accent-secondary, #6366f1))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        insightforge.ai
                    </div>

                    {variant === 'full' && (
                        <div
                            style={{
                                fontSize: `${0.6 * textScale}rem`,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--text-secondary, #94a3b8)',
                            }}
                        >
                            Data is Precious
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default InsightForgeLogo;
