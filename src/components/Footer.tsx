import React from 'react';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppLink, defaultBookingMessage } from '../utils/whatsapp';
import Logo from './Logo';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-cta text-center">
        <div className="container">
          <h2 className="mb-6">Ready to Give Your Dog the Best Care in Ahmedabad?</h2>
          <a 
            href={getWhatsAppLink(defaultBookingMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Book on WhatsApp Now →
          </a>
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-logo mb-4">
            <Logo height={60} />
          </div>
          <ul className="contact-info">
            <li>
              <MapPin size={20} className="text-primary" />
              <span>492, Avadh, Opp Milan Park, Vastrapur, next to Santoshi Masala, Bodakdev, Ahmedabad, Gujarat 380054</span>
            </li>
            <li>
              <Phone size={20} className="text-primary" />
              <span>098198 51792</span>
            </li>
            <li>
              <MessageCircle size={20} className="text-primary" />
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
            </li>
            <li>
              <Mail size={20} className="text-primary" />
              <span>hello@eternapet.com</span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/#services">Services</a></li>
            <li><a href="/#doctors">Doctors</a></li>
            <li><Link to="/digital-file">Digital File</Link></li>
            <li><a href="/#gallery">Gallery</a></li>
            <li><Link to="/book">Book Appointment</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Hours</h3>
          <ul className="hours-list">
            <li>
              <span className="day">Mon–Sat:</span>
              <span className="time">9:00 AM – 9:00 PM</span>
            </li>
            <li>
              <span className="day">Sunday:</span>
              <span className="time">10:00 AM – 6:00 PM</span>
            </li>
            <li className="emergency">
              <span className="day">Emergency:</span>
              <span className="time">24/7 Available</span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Location</h3>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5849245114887!2d72.5217004750924!3d23.039007779162233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9bfbb6eeb2d7%3A0xd3166a1dcecfe708!2sEterna%20Pet%20Hospital!5e0!3m2!1sen!2sin!4v1777452638627!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Eterna Pet Hospital Location"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom text-center">
        <p>Copyright © 2025 Eterna Pet Hospital · Made with 🐾 in Ahmedabad</p>
      </div>
    </footer>
  );
};

export default Footer;
