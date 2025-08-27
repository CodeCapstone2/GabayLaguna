import React from 'react';
import { useNavigate } from 'react-router-dom';

const InteractiveMap = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/cities');
  };

  return (
    <div className="text-center my-4 container">
      <h4 className="mb-3">🗺️ Start Your Laguna Adventure</h4>
      
      <div className="mb-4" style={{ maxWidth: '100%', height: '450px' }}>
        <iframe
          title="Laguna Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61879.937382740275!2d121.085923!3d14.2562992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd600ea02bf27d%3A0xd19ea6f21743ff24!2sLaguna!5e0!3m2!1sen!2sph!4v1721710056621!5m2!1sen!2sph"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <button className="btn btn-primary" onClick={handleExplore}>
        Explore Cities
      </button>
    </div>
  );
};

export default InteractiveMap;
