import React from 'react';
import { FileText, Smartphone, Activity } from 'lucide-react';
import './DigitalFilePage.css';

const DigitalFilePage: React.FC = () => {
  return (
    <div className="digital-file-page animate-fade-in-up">
      <section className="section-padding bg-sky">
        <div className="container text-center">
          <h1 className="mb-4">No More Carrying Files. Ever.</h1>
          <p className="subtitle mb-12 text-muted">
            Your dog's entire medical history — prescriptions, visit notes, vaccination records — stored digitally and accessible anytime.
          </p>

          <div className="steps-grid mb-12">
            <div className="step-card card-hover">
              <div className="step-icon">
                <Activity size={32} className="text-primary" />
              </div>
              <h3>1. Visit Us</h3>
              <p>Bring your dog in. Our doctors log everything digitally during the consultation.</p>
            </div>
            
            <div className="step-card card-hover">
              <div className="step-icon">
                <FileText size={32} className="text-primary" />
              </div>
              <h3>2. File Created</h3>
              <p>A complete digital patient record is created — medicines, dosage, duration, timing, and doctor's notes.</p>
            </div>
            
            <div className="step-card card-hover">
              <div className="step-icon">
                <Smartphone size={32} className="text-primary" />
              </div>
              <h3>3. Access Anytime</h3>
              <p>You get access to your dog's full prescription history. Share it with any vet, anywhere.</p>
            </div>
          </div>

          <div className="mockup-container">
            <div className="mockup-card">
              <div className="mockup-header">
                <div className="mockup-avatar">🐶</div>
                <div className="mockup-title">
                  <h4>PATIENT: Bruno</h4>
                  <span>Golden Retriever | 3yr</span>
                </div>
              </div>
              <div className="mockup-body">
                <div className="mockup-section">
                  <h5>Last Visit: <span className="text-muted">12 Jan 2025</span></h5>
                </div>
                <div className="mockup-section">
                  <h5 className="text-primary flex items-center gap-2"><FileText size={16}/> CURRENT PRESCRIPTION</h5>
                  <ul className="prescription-list">
                    <li>Amoxicillin 250mg — 2x daily — 7 days</li>
                    <li>Vitamin E Capsule — 1x daily — 30 days</li>
                  </ul>
                </div>
                <div className="mockup-section">
                  <h5 className="text-primary flex items-center gap-2"><Activity size={16}/> VISIT HISTORY</h5>
                  <ul className="history-list">
                    <li><strong>12 Jan</strong> — Ear infection</li>
                    <li><strong>03 Nov</strong> — Vaccination (Rabies booster)</li>
                    <li><strong>22 Aug</strong> — General checkup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalFilePage;
