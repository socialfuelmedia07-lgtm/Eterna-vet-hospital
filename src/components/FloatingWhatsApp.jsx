import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink, defaultBookingMessage } from '../utils/whatsapp';
import './FloatingWhatsApp.css';

const FloatingWhatsApp = () => {
  return (
    <a 
      href={getWhatsAppLink(defaultBookingMessage)} 
      target="_blank" 
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} color="#FFFFFF" fill="#FFFFFF" />
    </a>
  );
};

export default FloatingWhatsApp;
