import React, { useEffect, useState } from 'react';
import api from '../services/api';

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState({ specialization: '', department: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchMeta();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.data.doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const sRes = await api.get('/specializations');
      const dRes = await api.get('/departments');
      setSpecializations(sRes.data.data.specializations || []);
      setDepartments(dRes.data.data.departments || []);
    } catch (err) {
      console.error('Error fetching meta:', err);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = !filter.specialization || doc.specialization === filter.specialization;
    const matchesDept = !filter.department || doc.department === filter.department;
    return matchesSearch && matchesSpec && matchesDept;
  });

  return (
    <div className="container">
      <h2 className="card-title text-center">Find a Doctor</h2>
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select value={filter.specialization} onChange={e => setFilter(f => ({ ...f, specialization: e.target.value }))}>
            <option value="">All Specializations</option>
            {specializations.map(spec => <option key={spec._id || spec} value={spec.name || spec}>{spec.name || spec}</option>)}
          </select>
          <select value={filter.department} onChange={e => setFilter(f => ({ ...f, department: e.target.value }))}>
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept._id || dept} value={dept.name || dept}>{dept.name || dept}</option>)}
          </select>
        </div>
        {loading ? <div>Loading doctors...</div> : (
          <div className="grid-container">
            {filteredDoctors.length > 0 ? filteredDoctors.map(doc => (
              <div className="card text-center" key={doc._id} style={{ minWidth: 220, margin: '0.5rem' }}>
                <i className="fas fa-user-md fa-2x quick-icon"></i>
                <h3>{doc.name}</h3>
                <p><strong>Specialization:</strong> {doc.specialization}</p>
                <p><strong>Department:</strong> {doc.department}</p>
                <p><strong>Phone:</strong> {doc.contact?.phone}</p>
                <p><strong>Email:</strong> {doc.contact?.email}</p>
                <p><strong>Qualification:</strong> {Array.isArray(doc.qualification) ? doc.qualification.join(', ') : doc.qualification}</p>
                <p><strong>Experience:</strong> {doc.experience} years</p>
              </div>
            )) : <div>No doctors found.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctor;
