import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', department: '', phone: '', email: '', password: '', consultationFee: '', qualification: '', experience: '' });
  const [specializations, setSpecializations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'

  // Comprehensive styles
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '24px',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '16px',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0,
    },
    contentArea: {
      display: 'flex',
      gap: '24px',
    },
    mainContent: {
      flex: '2',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sidePanel: {
      flex: '1',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      color: '#2c3e50',
      fontWeight: '600',
      padding: '12px 16px',
      textAlign: 'left',
      borderBottom: '2px solid #dee2e6',
    },
    tableCell: {
      padding: '12px 16px',
      borderBottom: '1px solid #dee2e6',
      color: '#444',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    formRow: {
      display: 'flex',
      gap: '16px',
    },
    formGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#2c3e50',
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border-color 0.2s',
      ':focus': {
        borderColor: '#3498db',
        outline: 'none',
      },
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#fff',
    },
    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    checkbox: {
      margin: 0,
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#444',
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    primaryButton: {
      backgroundColor: '#3498db',
      color: '#fff',
      ':hover': {
        backgroundColor: '#2980b9',
      },
    },
    secondaryButton: {
      backgroundColor: '#e9ecef',
      color: '#2c3e50',
      marginLeft: '8px',
      ':hover': {
        backgroundColor: '#dee2e6',
      },
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      color: '#fff',
      marginLeft: '8px',
      ':hover': {
        backgroundColor: '#c0392b',
      },
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '24px',
    },
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      setDoctors(res.data.data.doctors);
    } catch (err) {
      console.error(err);
      alert('Error fetching doctors');
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

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { fetchMeta(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // convert qualification string to array
      if (payload.qualification && typeof payload.qualification === 'string') {
        payload.qualification = payload.qualification.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (payload.experience !== '') payload.experience = Number(payload.experience);

      if (editingId) {
        // only send provided fields
        const updatePayload = { ...payload };
        await api.patch(`/doctors/${editingId}`, updatePayload);
        setEditingId(null);
      } else {
        await api.post('/doctors', payload);
      }
      setForm({ name: '', specialization: '', department: '', phone: '', email: '', password: '', consultationFee: '', qualification: '', experience: '' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert('Error saving doctor');
    }
  };

  const handleEdit = (doc) => {
    setEditingId(doc._id);
  setForm({ name: doc.name, specialization: doc.specialization, department: doc.department, phone: doc.contact?.phone || '', email: doc.contact?.email || '', password: '', consultationFee: doc.consultationFee || '', qualification: Array.isArray(doc.qualification) ? doc.qualification.join(', ') : (doc.qualification || ''), experience: doc.experience || '' });
  };

  const toggleActive = async (doc) => {
    try {
      await api.patch(`/doctors/${doc._id}`, { isActive: !doc.isActive });
      fetchDoctors();
    } catch (err) {
      console.error('Error toggling active', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); fetchDoctors(); } catch (err) { console.error(err); alert('Error deleting doctor'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Manage Doctors</h2>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '16px'
        }}>
          <button 
            style={{
              ...styles.button,
              ...(activeTab === 'list' ? styles.primaryButton : styles.secondaryButton)
            }}
            onClick={() => setActiveTab('list')}
          >
            Doctors List
          </button>
          <button 
            style={{
              ...styles.button,
              ...(activeTab === 'add' ? styles.primaryButton : styles.secondaryButton)
            }}
            onClick={() => {
              setActiveTab('add');
              setEditingId(null);
              setForm({ name: '', specialization: '', department: '', phone: '', email: '', password: '', consultationFee: '', qualification: '', experience: '' });
            }}
          >
            Add New Doctor
          </button>
        </div>
      </div>

      <div style={styles.contentArea}>
        {activeTab === 'list' ? (
          <div style={styles.mainContent}>
            <h3 style={styles.headerTitle}>Doctors List</h3>
            {loading ? <p>Loading...</p> : (
              <div className="table-responsive">
                <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Doctor Name</th>
                    <th>Email Address</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Consultation Fee</th>
                    <th>Status & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d._id}>
                      <td><span className="id-cell">{d.doctorId}</span></td>
                      <td><span className="name-cell">Dr. {d.name}</span></td>
                      <td><span className="email-cell">{d.contact?.email || d.user?.email}</span></td>
                      <td><span className="spec-cell">{d.specialization}</span></td>
                      <td><span className="dept-cell">{d.department}</span></td>
                      <td><span className="exp-cell">{d.experience || 0} years</span></td>
                      <td><span className="fee-cell">₹{d.consultationFee}</span></td>
                      <td>
                        <div className="table-actions">
                          <span className={`status-indicator ${d.isActive ? 'active' : 'inactive'}`}>
                            {d.isActive ? '● Active' : '○ Inactive'}
                          </span>
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              handleEdit(d);
                              setActiveTab('add');
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="deactivate-btn"
                            onClick={() => toggleActive(d)}
                          >
                            {d.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(d._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.mainContent}>
            <h3 style={styles.headerTitle}>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input style={styles.input} name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialization</label>
                  <select style={styles.select} name="specialization" value={form.specialization} onChange={handleChange} required>
                    <option value="">Select Specialization</option>
                    {specializations.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <select style={styles.select} name="department" value={form.department} onChange={handleChange} required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password (for doctor login)</label>
                  <input 
                    style={styles.input} 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder={editingId ? 'Leave blank to keep existing password' : ''} 
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Qualification(s) (comma separated)</label>
                  <input 
                    style={styles.input} 
                    name="qualification" 
                    value={form.qualification} 
                    onChange={handleChange} 
                    placeholder="e.g. MBBS, MD - Cardiology" 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Experience (years)</label>
                  <input style={styles.input} name="experience" value={form.experience} onChange={handleChange} type="number" min="0" />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Consultation Fee</label>
                  <input style={styles.input} name="consultationFee" value={form.consultationFee} onChange={handleChange} />
                </div>
              </div>
              
              <div style={styles.formActions}>
                <button type="submit" style={{...styles.button, ...styles.primaryButton}}>
                  {editingId ? 'Update' : 'Add'} Doctor
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    style={{...styles.button, ...styles.secondaryButton}}
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: '', specialization: '', department: '', phone: '', email: '', password: '', consultationFee: '', qualification: '', experience: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
