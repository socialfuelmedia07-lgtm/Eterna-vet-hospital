import React from 'react';
import './Gallery.css';

interface GalleryItem {
  id: number;
  caption: string;
  image: string | null;
  placeholder?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, caption: 'Clinic reception / waiting area', image: '/waiting-area.jpg' },
  { id: 2, caption: 'Consultation rooms with equipment', image: '/cons-room.jpg' },
  { id: 3, caption: 'Doctors actively working with dogs', image: '/docter-active.jpg', objectPosition: 'center 28%' },
  { id: 4, caption: 'Post-surgery recovery room · always monitored', image: '/recovery.jpg' },
  { id: 5, caption: 'Advanced Surgery Room', image: '/surgery.jpg' },
  { id: 6, caption: 'In-house Lab/X-ray room', image: '/x-ray.jpg' },
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            A Peek Inside Eterna
          </h2>
          <p className="text-muted" style={{ fontSize: '18px' }}>
            Clean, modern, and designed for your pet's comfort.
          </p>
        </div>

        <div className="video-wrapper mb-8">
          <img src="/outlook.jpg" alt="Eterna Pet Hospital Outlook" className="outlook-img" />
        </div>

        <div className="gallery-grid">
          {galleryItems.map(item => (
            <div key={item.id} className="gallery-item">
              <div className="gallery-img-container">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    className="gallery-img" 
                    style={{ 
                      objectFit: item.objectFit || 'cover',
                      objectPosition: item.objectPosition || 'center'
                    }}
                  />
                ) : (
                  <div className="placeholder-img gallery-placeholder">
                    {item.placeholder}
                  </div>
                )}
              </div>
              <div className="gallery-caption">{item.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
