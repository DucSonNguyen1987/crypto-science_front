// src/pages/Settings.jsx
import React, { useState } from 'react';
import { 
  FiUser, 
  FiLock, 
  FiGlobe, 
  FiBell, 
  FiCreditCard, 
  FiShield, 
  FiSave,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiDollarSign
} from 'react-icons/fi';
import '../styles/Settings.css';

const Settings = () => {
  // Seul état local : la section active
  const [activeSection, setActiveSection] = useState('profile');
  
  // Données simulées pour l'exemple (dans une vraie application, elles viendraient de Redux)
  const user = {
    name: 'Thomas Dubois',
    email: 'thomas.dubois@exemple.fr'
  };
  
  const settings = {
    general: {
      language: 'fr',
      currency: 'EUR',
      theme: 'light'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketAlerts: true,
      newFeatures: true
    },
    security: {
      twoFactorAuth: true,
      lastPasswordChange: '2023-10-15',
      activeSessions: 2
    }
  };
  
  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      name: 'Carte bancaire',
      maskedNumber: '**** **** **** 4578',
      expiryMonth: '09',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: 2,
      type: 'paypal',
      name: 'PayPal',
      detail: 'thomas.dubois@exemple.fr',
      isDefault: false
    }
  ];
  
  // Gestionnaires d'événements
  const handleGeneralChange = (field, value) => {
    console.log(`Changement de paramètre général: ${field} = ${value}`);
    // Dans une vraie application, vous dispatcheriez une action Redux ici
    // dispatch({ type: 'settings/updateGeneralField', payload: { field, value } });
  };
  
  const handleNotificationChange = (field) => {
    console.log(`Changement de notification: ${field}`);
    // dispatch({ type: 'settings/toggleNotification', payload: { field } });
  };
  
  const handleSecurityChange = (field, value) => {
    console.log(`Changement de sécurité: ${field} = ${value}`);
    // dispatch({ type: 'settings/updateSecurityField', payload: { field, value } });
  };
  
  const handleSaveSettings = (section) => {
    console.log(`Sauvegarde des paramètres: ${section}`);
    // Simulation d'une action de sauvegarde
    alert(`Les paramètres de ${section} ont été enregistrés avec succès.`);
    // dispatch({ type: 'settings/save', payload: { section } });
  };
  
  return (
    <div className="settings-container">
      <h1 className="settings-title">Paramètres</h1>
      
      <div className="settings-grid">
        {/* Barre latérale de navigation */}
        <div className="settings-sidebar glass-effect">
          <div 
            className={`setting-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <div className="d-flex align-items-center">
              <FiUser className="mr-2" />
              <span>Profil</span>
            </div>
            <FiChevronRight />
          </div>
          
          <div 
            className={`setting-nav-item ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            <div className="d-flex align-items-center">
              <FiGlobe className="mr-2" />
              <span>Général</span>
            </div>
            <FiChevronRight />
          </div>
          
          <div 
            className={`setting-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <div className="d-flex align-items-center">
              <FiBell className="mr-2" />
              <span>Notifications</span>
            </div>
            <FiChevronRight />
          </div>
          
          <div 
            className={`setting-nav-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <div className="d-flex align-items-center">
              <FiShield className="mr-2" />
              <span>Sécurité</span>
            </div>
            <FiChevronRight />
          </div>
          
          <div 
            className={`setting-nav-item ${activeSection === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveSection('payment')}
          >
            <div className="d-flex align-items-center">
              <FiCreditCard className="mr-2" />
              <span>Méthodes de paiement</span>
            </div>
            <FiChevronRight />
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="settings-content glass-effect">
          {/* Section Profil */}
          {activeSection === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Profil utilisateur</h2>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-control" 
                  defaultValue={user.name} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  defaultValue={user.email} 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Photo de profil</label>
                <div className="profile-upload">
                  <div className="user-avatar">
                    <div className="avatar-placeholder">
                      {user.name.split(' ').map(part => part[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="upload-actions">
                    <button className="btn btn-tertiary">Télécharger une photo</button>
                    <button className="btn btn-tertiary">Supprimer</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSaveSettings('profil')}
                >
                  <FiSave className="mr-2" />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}
          
          {/* Section Général */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Paramètres généraux</h2>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Langue</div>
                  <div className="settings-description">Choisissez la langue de l'interface</div>
                </div>
                <div className="select-container">
                  <select 
                    className="select-control"
                    value={settings.general.language}
                    onChange={(e) => handleGeneralChange('language', e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Devise</div>
                  <div className="settings-description">Devise principale pour afficher les montants</div>
                </div>
                <div className="select-container">
                  <select 
                    className="select-control"
                    value={settings.general.currency}
                    onChange={(e) => handleGeneralChange('currency', e.target.value)}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                    <option value="JPY">Yen Japonais (¥)</option>
                  </select>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Thème</div>
                  <div className="settings-description">Choisissez entre le mode clair et sombre</div>
                </div>
                <div className="theme-toggle">
                  <button 
                    className={`theme-btn ${settings.general.theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleGeneralChange('theme', 'light')}
                  >
                    <FiSun />
                    Clair
                  </button>
                  <button 
                    className={`theme-btn ${settings.general.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleGeneralChange('theme', 'dark')}
                  >
                    <FiMoon />
                    Sombre
                  </button>
                </div>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSaveSettings('général')}
                >
                  <FiSave className="mr-2" />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
          
          {/* Section Notifications */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Préférences de notification</h2>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Emails</div>
                  <div className="settings-description">Recevoir des mises à jour par email</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="email-toggle" 
                    className="toggle-input" 
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <label htmlFor="email-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Notifications push</div>
                  <div className="settings-description">Recevoir des notifications sur votre appareil</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="push-toggle" 
                    className="toggle-input" 
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <label htmlFor="push-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Alertes SMS</div>
                  <div className="settings-description">Recevoir des alertes importantes par SMS</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="sms-toggle" 
                    className="toggle-input" 
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <label htmlFor="sms-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Alertes de marché</div>
                  <div className="settings-description">Recevoir des notifications sur les changements de prix importants</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="market-toggle" 
                    className="toggle-input" 
                    checked={settings.notifications.marketAlerts}
                    onChange={() => handleNotificationChange('marketAlerts')}
                  />
                  <label htmlFor="market-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Nouvelles fonctionnalités</div>
                  <div className="settings-description">Soyez informé des nouvelles fonctionnalités et mises à jour</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="features-toggle" 
                    className="toggle-input" 
                    checked={settings.notifications.newFeatures}
                    onChange={() => handleNotificationChange('newFeatures')}
                  />
                  <label htmlFor="features-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSaveSettings('notifications')}
                >
                  <FiSave className="mr-2" />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
          
          {/* Section Sécurité */}
          {activeSection === 'security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Sécurité et connexion</h2>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Authentification à deux facteurs</div>
                  <div className="settings-description">Renforce la sécurité de votre compte</div>
                </div>
                <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="2fa-toggle" 
                    className="toggle-input" 
                    checked={settings.security.twoFactorAuth}
                    onChange={() => handleSecurityChange('twoFactorAuth', !settings.security.twoFactorAuth)}
                  />
                  <label htmlFor="2fa-toggle" className="toggle-slider"></label>
                </div>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Changer le mot de passe</div>
                  <div className="settings-description">
                    Dernier changement : {new Date(settings.security.lastPasswordChange).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button className="btn btn-tertiary">Modifier</button>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Sessions actives</div>
                  <div className="settings-description">{settings.security.activeSessions} appareils connectés</div>
                </div>
                <button className="btn btn-tertiary">Gérer les sessions</button>
              </div>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Codes de récupération</div>
                  <div className="settings-description">Utilisés en cas de perte d'accès</div>
                </div>
                <button className="btn btn-tertiary">Générer des codes</button>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSaveSettings('sécurité')}
                >
                  <FiSave className="mr-2" />
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          )}
          
          {/* Section Méthodes de paiement */}
          {activeSection === 'payment' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Méthodes de paiement</h2>
              
              <div className="payment-cards">
                {paymentMethods.map((method) => (
                  <div className="payment-card glass-effect" key={method.id}>
                    <div className="payment-card-header">
                      <div className="payment-card-type">
                                                  {method.type === 'card' ? (
                          <FiCreditCard size={24} />
                        ) : (
                          <FiDollarSign size={24} />
                        )}
                        <span>{method.name}</span>
                      </div>
                      {method.isDefault && <div className="payment-card-default">Par défaut</div>}
                    </div>
                    
                    <div className="payment-card-details">
                      {method.type === 'card' ? (
                        <>
                          <div className="masked-card-number">{method.maskedNumber}</div>
                          <div className="card-expiry">Expire {method.expiryMonth}/{method.expiryYear}</div>
                        </>
                      ) : (
                        <div>{method.detail}</div>
                      )}
                    </div>
                    
                    <div className="payment-card-actions">
                      <button className="btn btn-tertiary btn-sm">Modifier</button>
                      <button className="btn btn-tertiary btn-sm">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="add-payment-method">
                <button className="btn btn-primary">
                  + Ajouter une méthode de paiement
                </button>
              </div>
              
              <h3 className="settings-subsection-title mt-4">Paramètres de conversion</h3>
              
              <div className="settings-row">
                <div>
                  <div className="settings-label">Devise préférée pour les achats</div>
                  <div className="settings-description">
                    Devise utilisée par défaut lors de l'achat de crypto-monnaies
                  </div>
                </div>
                <div className="select-container">
                  <select className="select-control" defaultValue="EUR">
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                  </select>
                </div>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSaveSettings('paiement')}
                >
                  <FiSave className="mr-2" />
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;