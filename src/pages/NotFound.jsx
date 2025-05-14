// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import '../styles/NotFound.css';

/**
 * Page 404 - Page non trouvée
 * 
 * Cette page s'affiche lorsque l'utilisateur accède à une URL qui n'existe pas
 * dans l'application. Elle offre une expérience utilisateur agréable avec des
 * options pour revenir à la page d'accueil.
 */
const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-container glass-effect">
        <div className="not-found-icon">
          <FiAlertTriangle />
        </div>
        
        <div className="not-found-code">404</div>
        
        <h1 className="not-found-title">Page non trouvée</h1>
        
        <p className="not-found-text">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-with-icon">
            <FiHome />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;