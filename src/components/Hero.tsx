import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppLink, defaultBookingMessage } from '../utils/whatsapp';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in-up">
          <h1>Your Dog's Health, Always in Good Paws.</h1>
          <p className="hero-subtitle">
            Ahmedabad's most trusted pet hospital — now with Digital Patient Files so you never lose a prescription again.
          </p>
          <div className="hero-ctas">
            <a 
              href={getWhatsAppLink(defaultBookingMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book Appointment on WhatsApp <ArrowRight size={20} />
            </a>
            <Link to="/digital-file" className="btn btn-secondary">
              See How Digital Files Work <ArrowDown size={20} />
            </Link>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <img src="/hero-team.jpg" alt="Eterna Pet Hospital Team" className="hero-img" />
        </div>
      </div>

      <div className="trust-bar-wrapper">
        <div className="container">
          <div className="trust-bar">
            <div className="trust-item">
              <span className="trust-icon">🐾</span>
              <span className="trust-text">500+ Happy Patients</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">👨‍⚕️</span>
              <span className="trust-text">10+ Expert Vets</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🕐</span>
              <span className="trust-text">24/7 Emergency</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <span className="trust-text">4.9 Google Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
