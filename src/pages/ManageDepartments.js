import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManageDepartments = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/departments'); setItems(res.data.data.departments); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, []);

  const add = async () => { try { await api.post('/departments', { name }); setName(''); fetchItems(); } catch (err) { console.error(err); alert('Error adding'); } };
  const del = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/departments/${id}`); fetchItems(); } catch (err) { console.error(err); alert('Error deleting'); } };

  return (
    <div className="container admin-dashboard">
      <h2>Departments</h2>
      <div className="card-compact">
        <div className="form-group"><label>New Department</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} /><button className="btn" onClick={add}>Add</button></div>
        <ul>
          {items.map(i => <li key={i._id}>{i.name} <button className="action-btn delete" onClick={()=>del(i._id)}>Delete</button></li>)}
        </ul>
      </div>
    </div>
  );
};

export default ManageDepartments;
