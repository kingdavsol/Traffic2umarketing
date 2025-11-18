import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your selling activity overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Active Listings</h3>
            <p className="stat-value">12</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">$1,234.56</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Total Views</h3>
            <p className="stat-value">342</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">4.8/5</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Recent Activity</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>Activity data coming soon...</p>
      </div>
    </div>
  );
}

export default Dashboard;
