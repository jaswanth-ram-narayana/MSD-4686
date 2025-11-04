import React from 'react';
import { API_BASE_URL } from './services/api';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FindDoctor from './pages/FindDoctor';
import Login from './pages/Login';
import PatientSignup from './pages/PatientSignup';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManagePatients from './pages/ManagePatients';
import AllAppointments from './pages/AllAppointments';
import BillingOverview from './pages/BillingOverview';
import ManageSpecializations from './pages/ManageSpecializations';
import ManageDepartments from './pages/ManageDepartments';
import BookAppointment from './pages/BookAppointment';
import Billing from './pages/Billing';
import Invoice from './pages/components/Invoice';
import InvoicePage from './pages/InvoicePage';
import Services from './pages/Services';
import './App.css';

export const getHealthStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching health status:', error);
    return { status: 'error', message: 'Unable to connect to backend' };
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/patient-signup" element={<PatientSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/manage-doctors" element={<ManageDoctors />} />
            <Route path="/manage-patients" element={<ManagePatients />} />
            <Route path="/manage-specializations" element={<ManageSpecializations />} />
            <Route path="/manage-departments" element={<ManageDepartments />} />
            <Route path="/appointments-all" element={<AllAppointments />} />
            <Route path="/billing-overview" element={<BillingOverview />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/:id" element={<InvoicePage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/find-doctor" element={<FindDoctor />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;