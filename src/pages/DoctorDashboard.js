// frontend/src/pages/DoctorDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctors/profile/me');
      setProfile(res.data.data.doctor);
    } catch (err) {
      console.error('Failed to load doctor profile', err);
    }
  };

  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      const q = date ? `?date=${date}` : '';
      const res = await api.get(`/appointments/doctor/my-appointments${q}`);
      setAppointments(res.data.data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, []);

  const onDateChange = (e) => {
    const d = e.target.value;
    setSelectedDate(d);
    fetchAppointments(d);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      // refresh for the selected date
      fetchAppointments(selectedDate);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  const todaysAppointments = appointments.filter(a => {
    const today = new Date();
    const apt = new Date(a.date);
    return apt.getFullYear() === today.getFullYear() && apt.getMonth() === today.getMonth() && apt.getDate() === today.getDate();
  });

  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const upcomingCount = appointments.filter(a => new Date(a.date) > new Date()).length;

  return (
    <div className="container patient-dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard <span>— {profile?.name || user?.fullName || user?.username}</span></h1>
        <div>
          <Link to="/appointments-all" className="btn">All Appointments</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Profile</h2>
          {profile ? (
            <div>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Doctor ID:</strong> {profile.doctorId}</p>
              <p><strong>Specialization:</strong> {profile.specialization}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              <p><strong>Experience:</strong> {profile.experience} years</p>
              <p><strong>Consultation Fee:</strong> {profile.consultationFee}</p>
              <p><strong>Contact:</strong> {profile.contact?.phone} / {profile.contact?.email}</p>
            </div>
          ) : <p>Loading profile...</p>}
        </div>

        <div className="dashboard-card">
          <h2>Quick Stats</h2>
          <div className="quick-stats">
            <div className="stat">
              <div className="stat-value">{todaysAppointments.length}</div>
              <div className="stat-label">Today's Appointments</div>
            </div>
            <div className="stat">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
            <div className="stat">
              <div className="stat-value">{upcomingCount}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <h2>Appointments by date</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={selectedDate} onChange={onDateChange} className="form-control" />
              <Link to="/manage-patients" className="btn btn-sm">My Patients</Link>
            </div>
          </div>

          {loading ? <p>Loading appointments...</p> : (
            appointments.length === 0 ? <p>No appointments found for selected date</p> : (
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td>{a.appointmentId}</td>
                      <td>{a.patient?.fullName}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.time}</td>
                      <td>{a.purpose}</td>
                      <td>{a.status}</td>
                      <td>
                        {a.status !== 'Confirmed' && <button className="action-btn view" onClick={() => updateStatus(a._id, 'Confirmed')}>Approve</button>}
                        {a.status !== 'Cancelled' && <button className="action-btn delete" onClick={() => updateStatus(a._id, 'Cancelled')} style={{ marginLeft: 6 }}>Reject</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;