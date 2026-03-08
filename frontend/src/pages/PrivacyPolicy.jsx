import React from 'react';

function PrivacyPolicy() {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title heading-gradient">Privacy Policy</h1>

            <div className="page-content">
                <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

                <p>
                    At Insightforge.ai, your privacy is important to us. This Privacy Policy details how we collect, use, and protect your information when you interact with our website and content.
                </p>

                <h3 className="section-subtitle">1. Information We Collect</h3>
                <p>
                    We only collect information that you voluntarily provide to us (e.g., when you subscribe or contact us). We may also collect standard technical data, such as your IP address, browser type, and operating system, automatically through cookies and similar technologies.
                </p>

                <h3 className="section-subtitle">2. How We Use Your Information</h3>
                <p>
                    The information we collect is used to:
                </p>
                <ul className="content-list">
                    <li>Provide, operate, and maintain our website.</li>
                    <li>Improve, personalize, and expand our platform and educational content.</li>
                    <li>Communicate with you regarding updates, newsletters, or support.</li>
                    <li>Analyze how you use our website to improve UX.</li>
                </ul>

                <h3 className="section-subtitle">3. Data Protection</h3>
                <p>
                    We employ industry-standard security measures to safeguard your personal data. We do not sell, trade, or rent your personal identification information to others.
                </p>

                <h3 className="section-subtitle">4. Third-Party Links</h3>
                <p>
                    Our website may contain links to external sites (like Instagram, GitHub, etc.) that are not operated by us. We have no control over the content or privacy policies of those sites and assume no responsibility for them.
                </p>

                <h3 className="section-subtitle">5. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please reach out via our social media channels linked in the footer.
                </p>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
