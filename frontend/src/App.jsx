import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Playbooks from './pages/Playbooks';
import Newsletters from './pages/Newsletters';
import Videos from './pages/Videos';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home searchTerm={searchTerm} />} />
          <Route path="/playbooks" element={<Playbooks searchTerm={searchTerm} />} />
          <Route path="/newsletters" element={<Newsletters searchTerm={searchTerm} />} />
          <Route path="/videos" element={<Videos searchTerm={searchTerm} />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
