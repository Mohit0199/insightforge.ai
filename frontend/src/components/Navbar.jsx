import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import InsightForgeLogo from './InsightForgeLogo';

function Navbar({ searchTerm, onSearchChange }) {
    return (
        <nav className="navbar animate-slide-up">
            <div className="navbar-container">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <InsightForgeLogo size={34} variant="compact" />
                </Link>

                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search slides, topics, tags..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Academy</Link>
                    <Link to="/playbooks" className="nav-link">Playbooks</Link>
                    <Link to="/newsletters" className="nav-link">Newsletter</Link>
                    <Link to="/videos" className="nav-link">Videos</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
