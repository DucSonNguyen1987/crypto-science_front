// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  FiHome, 
  FiPieChart, 
  FiDollarSign, 
  FiSearch, 
  FiSettings, 
  FiUser, 
  FiMenu, 
  FiX 
} from 'react-icons/fi';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <div className="app-layout">
      {/* Mobile menu toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>
      
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'show' : ''}`}>
        <div className="sidebar-logo">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '8px' }}
          >
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
          CryptoWallet
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon"><FiHome /></span>
                <span>Tableau de bord</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink 
                to="/portfolio" 
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon"><FiPieChart /></span>
                <span>Portefeuille</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink 
                to="/transactions" 
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon"><FiDollarSign /></span>
                <span>Transactions</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink 
                to="/explore" 
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon"><FiSearch /></span>
                <span>Explorer</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink 
                to="/settings" 
                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon"><FiSettings /></span>
                <span>Paramètres</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <img src="/avatar-placeholder.jpg" alt="Avatar" onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }} />
              <FiUser style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                display: 'none'
              }} 
              className="avatar-fallback" />
              <div className="user-status status-online"></div>
            </div>
            <div className="user-info">
              <div className="user-name">Utilisateur</div>
              <div className="user-status-text">En ligne</div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;