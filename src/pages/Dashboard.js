// frontend/src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    // use container-fluid for admin pages so content fits full width of the layout
    <div className="container container-fluid">
      <h1>Admin Dashboard</h1>
      <p>Welcome {user?.fullName || user?.username || 'Admin'}.</p>

      <div className="card">
        <h3>Administration</h3>
        <ul className="dashboard-actions">
          <li><Link to="/manage-doctors">Manage Doctors</Link></li>
          <li><Link to="/manage-patients">Manage Patients</Link></li>
          <li><Link to="/manage-specializations">Specializations</Link></li>
          <li><Link to="/manage-departments">Departments</Link></li>
          <li><Link to="/appointments-all">All Appointments</Link></li>
          <li><Link to="/billing-overview">Billing</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;