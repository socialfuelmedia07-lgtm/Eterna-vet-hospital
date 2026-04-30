import React from 'react';
import { Syringe, Stethoscope, Scissors, HeartPulse, Hospital, Shield, Activity, PhoneCall, Check } from 'lucide-react';
import './Services.css';

interface ServiceItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  desc: string;
  logged: boolean;
}

const servicesList: ServiceItem[] = [
  { id: 1, name: 'Vaccination', icon: <Syringe size={32} />, desc: 'Core & lifestyle vaccines for protection.', logged: true },
  { id: 2, name: 'General Checkup', icon: <Stethoscope size={32} />, desc: 'Comprehensive nose-to-tail exams.', logged: true },
  { id: 3, name: 'Surgery', icon: <Hospital size={32} />, desc: 'State-of-the-art surgical suite.', logged: true },
  { id: 4, name: 'Grooming', icon: <Scissors size={32} />, desc: 'Bath, brush, and breed-specific cuts.', logged: false },
  { id: 5, name: 'Dental Care', icon: <HeartPulse size={32} />, desc: 'Cleaning, extractions & oral health.', logged: true },
  { id: 6, name: 'Emergency / 24x7', icon: <PhoneCall size={32} />, desc: 'Always open for critical situations.', logged: true },
  { id: 7, name: 'Deworming', icon: <Shield size={32} />, desc: 'Parasite control and prevention.', logged: true },
  { id: 8, name: 'X-Ray & Lab Tests', icon: <Activity size={32} />, desc: 'In-house diagnostics & imaging.', logged: true },
];

const Services: React.FC = () => {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            Everything Your Dog Needs, Under One Roof
          </h2>
          <p className="text-muted" style={{ fontSize: '18px' }}>
            Expert care, modern facilities, and digital tracking for every treatment.
          </p>
        </div>

        <div className="services-grid">
          {servicesList.map(service => (
            <div key={service.id} className="service-card card-hover">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.desc}</p>
              
              {service.logged && (
                <div className="service-badge">
                  <Check size={14} /> Logged in Digital File
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
