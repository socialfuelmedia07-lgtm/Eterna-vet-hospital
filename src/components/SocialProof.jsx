import { Star } from 'lucide-react';
import './SocialProof.css';

const reviews = [
  {
    name: "Neha M.",
    dog: "Owner of Max, Labrador",
    text: "The digital file system is a lifesaver. I never have to worry about forgetting Max's prescription when we travel."
  },
  {
    name: "Rahul D.",
    dog: "Owner of Bruno, Golden Retriever",
    text: "Dr. Priya is amazing. She handled Bruno's surgery with so much care. The 24/7 availability gives me peace of mind."
  },
  {
    name: "Ananya K.",
    dog: "Owner of Leo, Indie",
    text: "Cleanest pet hospital in Ahmedabad. The staff is so friendly and my Indie dog loves going there for grooming!"
  },
  {
    name: "Suresh P.",
    dog: "Owner of Bella, Beagle",
    text: "Very professional and caring doctors. The atmosphere is calm, which helps my nervous pup feel at ease."
  }
];

const SocialProof = () => {
  return (
    <section className="section-padding bg-sky">
      <div className="container">
        
        {/* Layer B: Written Reviews */}
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            Loved by Dogs. Trusted by Parents.
          </h2>
        </div>
        
        <div className="reviews-ticker-container mb-16">
          <div className="reviews-ticker">
            {[...reviews, ...reviews].map((review, index) => (
              <div key={index} className="review-card">
                <div className="stars mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--secondary-yellow)" color="var(--secondary-yellow)" />)}
                </div>
                <p className="review-text">"{review.text}"</p>
                <div className="reviewer">
                  <strong>{review.name}</strong>
                  <span>{review.dog}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layer C: Before / After */}
        <div className="before-after-grid mb-16">
          <div className="ba-card">
            <div className="ba-images">
              <div className="ba-img placeholder-img">
                <span className="ba-label before">Before</span>
                [Skin condition]
              </div>
              <div className="ba-img placeholder-img">
                <span className="ba-label after">After</span>
                [Healed skin]
              </div>
            </div>
            <h4>Dermatology & Skin Care</h4>
          </div>
          
          <div className="ba-card">
            <div className="ba-images">
              <div className="ba-img placeholder-img">
                <span className="ba-label before">Before</span>
                [Tartar buildup]
              </div>
              <div className="ba-img placeholder-img">
                <span className="ba-label after">After</span>
                [Clean teeth]
              </div>
            </div>
            <h4>Dental Cleaning Results</h4>
          </div>
        </div>

        {/* Layer D: Video Testimonials */}
        <div className="video-testimonials">
          <div className="video-card placeholder-img">
            [VIDEO_TESTIMONIAL_1: 30-60s, pet parent + dog]
            <div className="video-title">Recovery from Parvovirus</div>
          </div>
          <div className="video-card placeholder-img">
            [VIDEO_TESTIMONIAL_2: 30-60s, pet parent + dog]
            <div className="video-title">Routine Checkups & Vaccination</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SocialProof;
