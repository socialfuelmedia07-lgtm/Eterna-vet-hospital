import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: "Is my dog's medical data safe and private?",
    answer: "Absolutely. We use enterprise-grade encryption to store your dog's medical records. Only our doctors and you have access to the full digital file."
  },
  {
    question: "Can any vet access my dog's digital file?",
    answer: "Yes, you can easily share a secure link or PDF export of your dog's records with any other veterinarian if needed, ensuring continuous care."
  },
  {
    question: "What happens in a 24/7 emergency?",
    answer: "Our emergency team is always on standby. Simply call our emergency number or bring your pet in directly. We prioritize critical cases immediately."
  },
  {
    question: "Do you only treat dogs, or other pets too?",
    answer: "We specialize in canine care to provide the highest level of expertise, but we also have dedicated doctors for cats and smaller pets."
  },
  {
    question: "What breeds do you specialize in?",
    answer: "We treat all dog breeds. From tiny Chihuahuas to giant Great Danes, our facilities and doctors are equipped to handle their specific needs."
  },
  {
    question: "How do I get a copy of my dog's prescription?",
    answer: "Prescriptions are automatically added to your dog's Digital File right after the consultation. You can view or download it anytime from your phone."
  },
  {
    question: "Is grooming by appointment or walk-in?",
    answer: "We highly recommend booking an appointment for grooming to avoid long wait times, though we do accept walk-ins if we have available slots."
  },
  {
    question: "What should I bring for my dog's first visit?",
    answer: "Please bring any previous medical records (if you have them), their vaccination booklet, and ensure they are on a leash or in a secure carrier."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            Questions Every Pet Parent Asks
          </h2>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <ChevronDown 
                  size={24} 
                  className="faq-icon" 
                  style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)' }} 
                />
              </div>
              <div 
                className="faq-answer"
                style={{ 
                  maxHeight: openIndex === index ? '200px' : '0',
                  opacity: openIndex === index ? 1 : 0
                }}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
