import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/listings', label: 'My Listings', icon: '📝' },
    { path: '/listings/create', label: 'Create Listing', icon: '➕' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/gamification', label: 'Achievements', icon: '🏆' },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
}

export default Sidebar;
