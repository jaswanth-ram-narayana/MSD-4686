// frontend/src/pages/Billing.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BillingOverview from './BillingOverview';

const Billing = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // If admin or staff, show admin billing overview
    if (user.role === 'admin' || user.role === 'staff') return;
    fetchMyBills();
  }, [user]);

  const fetchMyBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing/my-bills');
      setBills(res.data.data.bills || []);
    } catch (err) {
      console.error('Error fetching my bills:', err);
      alert('Error fetching your bills');
    } finally {
      setLoading(false);
    }
  };

  // Admin/staff view
  if (user?.role === 'admin' || user?.role === 'staff') {
    return <BillingOverview />;
  }

  return (
    <div className="container">
      <h2>My Bills</h2>
      <div className="card-compact">
        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p>No bills found</p>
        ) : (
          <div className="table-responsive">
            <table className="manage-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>{b.billId}</td>
                  <td>{new Date(b.createdAt || b.date).toLocaleDateString()}</td>
                  <td>₹{Number(b.totalAmount).toFixed(2)}</td>
                  <td>{b.paymentStatus}</td>
                  <td>
                    <a href={`/billing/${b._id}`} target="_blank" rel="noreferrer">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;