import React from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { getWhatsAppLink, defaultBookingMessage } from '../utils/whatsapp';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  return (
    <div className="booking-page animate-fade-in-up">
      <section className="section-padding bg-yellow booking-section">
        <div className="container text-center">
          <h1 className="mb-4">Book an Appointment in 30 Seconds</h1>
          <p className="mb-12" style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
            No apps to download. No confusing forms. Just send us a WhatsApp message and we'll handle the rest.
          </p>

          <div className="booking-steps mb-12">
            <div className="book-step card-hover">
              <div className="book-step-number">1</div>
              <h3>Click the Button</h3>
              <p>Click the "Book on WhatsApp" button below to open a chat with our clinic.</p>
            </div>
            
            <div className="book-step card-hover">
              <div className="book-step-number">2</div>
              <h3>Send Details</h3>
              <p>WhatsApp will open with a pre-filled message. Just add your dog's name, breed, and the issue.</p>
            </div>
            
            <div className="book-step card-hover">
              <div className="book-step-number">3</div>
              <h3>Confirmed</h3>
              <p>Our team will reply with an available slot within minutes. That's it!</p>
            </div>
          </div>

          <div className="booking-cta">
            <a 
              href={getWhatsAppLink(defaultBookingMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-booking animate-bounce-slow"
            >
              <MessageCircle size={24} />
              Book Now on WhatsApp →
            </a>
            <p className="mt-4 text-sm" style={{ opacity: 0.8, marginTop: '16px' }}>
              <CheckCircle size={16} className="inline-icon" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Typical response time: under 10 minutes · Mon–Sun, 9AM–9PM
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
