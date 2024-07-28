// src/Preloader.js
import React from 'react';
import './Preloader.css'; // Import the CSS file for styling

const Preloader = () => {
  return (
    <div className="preloader">
      <img src="/hourglass.gif" alt="Loading..." className="preloader-gif" />
      <p className="preloader-message">Loading.Hang Tight...</p>
    </div>
  );
};

export default Preloader;
