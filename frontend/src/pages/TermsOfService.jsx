import React from 'react';

function TermsOfService() {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title heading-gradient">Terms of Service</h1>

            <div className="page-content">
                <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

                <p>
                    Welcome to Insightforge.ai. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
                </p>

                <h3 className="section-subtitle">1. Acceptance of Terms</h3>
                <p>
                    By accessing Insightforge.ai, you accept these terms and conditions in full. If you disagree with any part of these terms, you must not use our website.
                </p>

                <h3 className="section-subtitle">2. Intellectual Property Rights</h3>
                <p>
                    Unless otherwise stated, Insightforge.ai own the intellectual property rights for all educational material, carousels, and content on the website. You may view and/or print pages for your own personal use, subject to restrictions set in these terms.
                </p>
                <p>You must not:</p>
                <ul className="content-list">
                    <li>Republish material from Insightforge.ai without credit.</li>
                    <li>Sell, rent, or sub-license material from our platform.</li>
                    <li>Reproduce, duplicate, or copy material for commercial purposes without explicit permission.</li>
                </ul>

                <h3 className="section-subtitle">3. Educational Purpose</h3>
                <p>
                    The content provided on this website (AI workflows, ML tutorials, etc.) is for informational and educational purposes only. We make no guarantees about the completeness, reliability, and accuracy of this information.
                </p>

                <h3 className="section-subtitle">4. Limitations of Liability</h3>
                <p>
                    Insightforge.ai will not be liable for any direct, indirect, special, or consequential loss or damage arising under these terms or in connection with our educational website.
                </p>

                <h3 className="section-subtitle">5. Modifications</h3>
                <p>
                    We reserve the right to revise these terms at any time. By using this website, you agree to be bound by the current version of these Terms of Service.
                </p>

            </div>
        </div>
    );
}

export default TermsOfService;
