import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>AurumFX Admin</h2>
        </div>
        <nav className="sidebar-menu">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Leaderboard</span>
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
