import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Start closed on mobile/tablet, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="layout">
      <Navigation
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        user={user}
      />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="layout-main">
          {children || <Outlet />}
        </main>
        <footer style={{ textAlign: "center", padding: "8px", fontSize: "0.75rem", color: "#999" }}>QuickSell v1.1.0</footer>
      </div>
    </div>
  );
}

export default Layout;
