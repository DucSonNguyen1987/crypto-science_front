// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearErrors, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../features/auth/authSlice';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles/auth.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Sélectionner les états depuis le store Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  // États locaux pour le formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Réinitialiser les erreurs à la destruction du composant
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!email || !password) {
      return;
    }
    
    // Dispatcher l'action de connexion
    dispatch(login({ email, password }));
  };
  
  // Afficher/masquer le mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card glass-effect">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M9 8h6m-6 4h6m-6 4h6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="auth-title">Connectez-vous</h1>
          <p className="auth-subtitle">Accédez à votre portefeuille de crypto-monnaies</p>
        </div>
        
        {/* Afficher l'erreur si présente */}
        {error && (
          <div className="auth-error">
            <FiAlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FiMail className="input-icon" />
              Adresse email
            </label>
            <input 
              type="email" 
              id="email"
              className="form-control"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="input-icon" />
              Mot de passe
            </label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="form-control"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          
          <div className="form-group remember-forgot">
            <div className="remember-me">
              <input type="checkbox" id="remember" className="checkbox-input" />
              <label htmlFor="remember" className="checkbox-label">
                <span className="checkbox-custom"></span>
                Se souvenir de moi
              </label>
            </div>
            <a href="#forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>ou</span>
        </div>
        
        <button className="btn btn-secondary btn-block btn-with-icon">
          <FiUser className="btn-icon" />
          Créer un compte
        </button>
        
        <div className="auth-footer">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <a href="#terms" className="auth-footer-link">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#privacy" className="auth-footer-link">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;