export const WHATSAPP_NUMBER = '919924076666';

export const getWhatsAppLink = (message = '') => {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
};

export const defaultBookingMessage = `Hi Eterna Pet Hospital! 🐾\n\nI'd like to book an appointment.\n\nName: [Your Name]\nDog's Breed: [Breed]\nProblem / Reason for Visit: [Brief Description]\n\nPlease suggest an available time slot.`;
