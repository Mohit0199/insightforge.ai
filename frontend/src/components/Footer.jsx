import React from 'react';
import { Github, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import InsightForgeLogo from './InsightForgeLogo';

function Footer() {
    return (
        <footer className="footer animate-fade-in">
            <div className="footer-content">
                <div className="footer-brand">
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
                        <InsightForgeLogo size={44} variant="full" />
                    </Link>
                    <p className="text-secondary">
                        Master the future of AI & Data Science through highly visual, interactive learning experiences.
                    </p>
                </div>

                <div className="footer-links" style={{ gap: '3rem' }}>
                    <div>
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-of-service">Terms of Service</Link>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="text-secondary">&copy; {new Date().getFullYear()} Insightforge.ai. All rights reserved.</p>
                <div className="social-links">
                    <a href="https://www.instagram.com/insightforge.ai/" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <Instagram size={20} />
                    </a>
                    <a href="https://www.youtube.com/@insightforge_9" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <Youtube size={20} />
                    </a>
                    <a href="https://www.facebook.com/mohit.rathod.33633/" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <Facebook size={20} />
                    </a>
                    <a href="https://github.com/Mohit0199" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <Github size={20} />
                    </a>
                    <a href="https://www.linkedin.com/in/mohit-rathod-7991241b5/" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <Linkedin size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
