import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res.data.data.appointments);
    } catch (err) {
      console.error(err);
      alert('Error fetching appointments');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const patchStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      // update local state
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      console.error('Error updating status', err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="container admin-dashboard">
      <h2>All Appointments</h2>
      <div className="card-compact">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: 600 }}>Select date:</label>
          <input type="date" value={filterDate} onChange={handleDateChange} className="form-control" style={{ maxWidth: 220 }} />
          <button className="btn" onClick={() => { setFilterDate(''); fetchAppointments(); }} style={{ marginLeft: 'auto' }}>Reset</button>
        </div>

        {loading ? <p>Loading...</p> : (
          (appointments.length === 0) ? <p>No appointments available</p> : (
            <div className="table-responsive">
              <table className="manage-table">
              <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments
                  .filter(a => {
                    if (!filterDate) return true;
                    const aptDate = new Date(a.date).toISOString().split('T')[0];
                    return aptDate === filterDate;
                  })
                  .map(a => (
                  <tr key={a._id}>
                    <td>{a.appointmentId}</td>
                    <td>{a.patient?.fullName}</td>
                    <td>{a.doctor?.name}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.time}</td>
                    <td>{a.purpose}</td>
                    <td>{a.status}</td>
                    <td />
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
