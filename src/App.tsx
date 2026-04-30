import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import DigitalFileRoutes from './digital-file/routing/DigitalFileRoutes';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/digital-file/*" element={<DigitalFileRoutes />} />
          <Route path="/book" element={<BookingPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default App;
