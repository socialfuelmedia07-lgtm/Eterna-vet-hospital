import React from 'react';
import './Doctors.css';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  quote: string;
  image: string;
}

const doctorsList: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Paunus Joshi',
    specialty: 'M.V.Sc Vet Internal Medicine',
    quote: "I treat every patient like it's my own dog at home.",
    image: '/dr-paunus.jpg'
  },
  {
    id: 2,
    name: 'Dr. Yamini Thakur',
    specialty: 'M.V.Sc Vet Surgery and Radiology (Ophthalmology)',
    quote: "Ensuring a safe, pain-free recovery is my top priority.",
    image: '/dr-yukti.jpg'
  }
];

const Doctors: React.FC = () => {
  return (
    <section id="doctors" className="section-padding bg-sky">
      <div className="container">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            The People Who Actually Care for Your Dog
          </h2>
        </div>

        <div className="doctors-grid">
          {doctorsList.map(doc => (
            <div key={doc.id} className="doctor-card card-hover">
              <div className="doctor-image">
                <img src={doc.image} alt={doc.name} className="doc-img" />
              </div>
              <div className="doctor-info">
                <h3>{doc.name}</h3>
                <span className="specialty">{doc.specialty}</span>
                <p className="quote">"{doc.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Doctors;
