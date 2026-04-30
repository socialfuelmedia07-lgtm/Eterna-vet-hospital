import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getWhatsAppLink, defaultBookingMessage } from '../utils/whatsapp';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import './Header.css';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Logo height={70} />
        </Link>
        
        <nav className={`desktop-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-close" onClick={toggleMenu}>
            <X size={24} />
          </div>
          <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <a href="/#services" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
          <a href="/#doctors" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Our Doctors</a>
          <Link to="/digital-file" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Digital File</Link>
          <a href="/#gallery" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Gallery</a>
          
          <a 
            href={getWhatsAppLink(defaultBookingMessage)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book on WhatsApp 🐾
          </a>
        </nav>

        <button className="mobile-toggle" onClick={toggleMenu}>
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
};

export default Header;
