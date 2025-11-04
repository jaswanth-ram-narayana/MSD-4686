import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ManagePatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', age: '', gender: 'Male', phone: '', email: '', password: '',
    addressStreet: '', addressCity: '', addressState: '', addressZip: '',
    bloodGroup: '', assignedDoctor: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

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
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#fff',
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
    errorMessage: {
      color: '#e74c3c',
      padding: '16px',
      backgroundColor: '#fdf0ed',
      borderRadius: '4px',
      marginBottom: '16px',
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      if (!['admin', 'doctor', 'staff'].includes(user.role)) {
        setAccessDenied(true);
        return;
      }
      setLoading(true);
      try {
        const [pRes, dRes] = await Promise.all([api.get('/patients'), api.get('/doctors')]);
        setPatients(pRes.data.data.patients || []);
        setDoctors(dRes.data.data.doctors || []);
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateForm = () => {
    const requiredFields = ['fullName', 'age', 'gender', 'email', 'phone'];
    if (!editingId) requiredFields.push('password');
    
    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const age = parseInt(form.age, 10);
    if (isNaN(age) || age <= 0 || age > 150) {
      alert('Please enter a valid age between 1 and 150');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (form.phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }

    if (!editingId && form.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const submitPayload = () => ({
    fullName: form.fullName.trim(),
    age: parseInt(form.age, 10),
    gender: form.gender,
    phone: form.phone.trim(),
    email: form.email.trim(),
    password: !editingId ? form.password : undefined,
    address: {
      street: form.addressStreet ? form.addressStreet.trim() : '',
      city: form.addressCity ? form.addressCity.trim() : '',
      state: form.addressState ? form.addressState.trim() : '',
      zipCode: form.addressZip ? form.addressZip.trim() : ''
    },
    bloodGroup: form.bloodGroup ? form.bloodGroup.trim() : undefined,
    assignedDoctor: form.assignedDoctor || undefined
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const payload = submitPayload();
      if (editingId) {
        await api.patch(`/patients/${editingId}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      
      setForm({
        fullName: '', age: '', gender: 'Male', phone: '', email: '', password: '',
        addressStreet: '', addressCity: '', addressState: '', addressZip: '',
        bloodGroup: '', assignedDoctor: ''
      });
      const res = await api.get('/patients');
      setPatients(res.data.data.patients || []);
      setEditingId(null);
      setActiveTab('list');
    } catch (err) {
      console.error('Error submitting patient:', err);
      if (err.response?.status === 401) {
        alert('You are not authorized to perform this action. Please log in with admin or staff credentials.');
      } else if (err.response?.status === 400) {
        const message = err.response.data.message || 'Please check all required fields';
        alert(`Validation Error: ${message}`);
      } else {
        alert('An error occurred while saving the patient. Please try again.');
      }
    }
  };

  const onEdit = (p) => {
    setEditingId(p._id || p.id);
    setActiveTab('add');
    setForm({
      fullName: p.fullName || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      phone: p.contact?.phone || '',
      email: p.user?.email || '',
      addressStreet: p.address?.street || '',
      addressCity: p.address?.city || '',
      addressState: p.address?.state || '',
      addressZip: p.address?.zipCode || '',
      bloodGroup: p.bloodGroup || '',
      assignedDoctor: p.assignedDoctor?._id || p.assignedDoctor || ''
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      setPatients(patients.filter(p => (p._id || p.id) !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    }
  };

  if (accessDenied) {
    return (
      <div style={styles.container}>
        <div style={{...styles.mainContent, textAlign: 'center'}}>
          <h2 style={styles.headerTitle}>Access Denied</h2>
          <p style={{margin: '16px 0'}}>You do not have permission to view patients.</p>
          <Link to="/" style={{...styles.button, ...styles.primaryButton, textDecoration: 'none'}}>Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Manage Patients</h2>
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
            Patients List
          </button>
          <button 
            style={{
              ...styles.button,
              ...(activeTab === 'add' ? styles.primaryButton : styles.secondaryButton)
            }}
            onClick={() => {
              setActiveTab('add');
              setEditingId(null);
              setForm({
                fullName: '', age: '', gender: 'Male', phone: '', email: '', password: '',
                addressStreet: '', addressCity: '', addressState: '', addressZip: '',
                bloodGroup: '', assignedDoctor: ''
              });
            }}
          >
            Add New Patient
          </button>
        </div>
      </div>

      <div style={styles.contentArea}>
        {activeTab === 'list' ? (
          <div style={styles.mainContent}>
            <h3 style={styles.headerTitle}>Patients List</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Age</th>
                    <th style={styles.tableHeader}>Gender</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Contact</th>
                    <th style={styles.tableHeader}>Address</th>
                    <th style={styles.tableHeader}>Doctor</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id || p.id}>
                      <td style={styles.tableCell}>{p.fullName}</td>
                      <td style={styles.tableCell}>{p.age}</td>
                      <td style={styles.tableCell}>{p.gender}</td>
                      <td style={styles.tableCell}>{p.user?.email || '-'}</td>
                      <td style={styles.tableCell}>{p.contact?.phone || '-'}</td>
                      <td style={styles.tableCell}>
                        {p.address ? 
                          `${p.address.street || ''}${p.address.city ? ', ' + p.address.city : ''}${p.address.state ? ', ' + p.address.state : ''}${p.address.zipCode ? ' ' + p.address.zipCode : ''}` 
                          : '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {p.assignedDoctor ? (
                          typeof p.assignedDoctor === 'string' ? 
                            <Link to={`/doctors/${p.assignedDoctor}`} style={{color: '#3498db', textDecoration: 'none'}}>View</Link> :
                            <Link to={`/doctors/${p.assignedDoctor._id || p.assignedDoctor.id}`} style={{color: '#3498db', textDecoration: 'none'}}>
                              {p.assignedDoctor.name || p.assignedDoctor.email || 'View'}
                            </Link>
                        ) : '-'}
                      </td>
                      <td style={styles.tableCell}>
                        <button 
                          style={{...styles.button, ...styles.primaryButton}} 
                          onClick={() => onEdit(p)}
                        >
                          Edit
                        </button>
                        <button 
                          style={{...styles.button, ...styles.deleteButton}}
                          onClick={() => onDelete(p._id || p.id)}
                        >
                          Delete
                        </button>
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
            <h3 style={styles.headerTitle}>{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input 
                    style={styles.input}
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age</label>
                  <input 
                    style={styles.input}
                    type="number" 
                    name="age" 
                    value={form.age} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select 
                    style={styles.select}
                    name="gender" 
                    value={form.gender} 
                    onChange={handleChange}
                    required
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input 
                    style={styles.input}
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input 
                    style={styles.input}
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                {!editingId && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <input 
                      style={styles.input}
                      type="password" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange}
                      placeholder="Minimum 6 characters" 
                      required 
                    />
                  </div>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Street</label>
                  <input 
                    style={styles.input}
                    name="addressStreet" 
                    value={form.addressStreet} 
                    onChange={handleChange} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City</label>
                  <input 
                    style={styles.input}
                    name="addressCity" 
                    value={form.addressCity} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>State</label>
                  <input 
                    style={styles.input}
                    name="addressState" 
                    value={form.addressState} 
                    onChange={handleChange} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zip</label>
                  <input 
                    style={styles.input}
                    name="addressZip" 
                    value={form.addressZip} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <input 
                    style={styles.input}
                    name="bloodGroup" 
                    value={form.bloodGroup} 
                    onChange={handleChange} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assigned Doctor</label>
                  <select 
                    style={styles.select}
                    name="assignedDoctor" 
                    value={form.assignedDoctor} 
                    onChange={handleChange}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id || d.id}>
                        {d.name || d.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={{...styles.button, ...styles.primaryButton}}>
                  {editingId ? 'Update' : 'Add'} Patient
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    style={{...styles.button, ...styles.secondaryButton}}
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        fullName: '', age: '', gender: 'Male', phone: '', email: '', password: '',
                        addressStreet: '', addressCity: '', addressState: '', addressZip: '',
                        bloodGroup: '', assignedDoctor: ''
                      });
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

export default ManagePatients;