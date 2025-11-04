import React, { useEffect, useState } from 'react';
import api from '../services/api';

const BillingOverview = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing');
      setBills(res.data.data.bills);
    } catch (err) {
      console.error(err);
      alert('Error fetching bills');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBills(); }, []);

  return (
    <div className="container admin-dashboard">
      <h2>Billing Overview</h2>
      <div className="card-compact">
        {loading ? <p>Loading...</p> : (
          bills.length === 0 ? <p>No bills available</p> : (
            <div className="table-responsive">
              <table className="manage-table">
                <thead><tr><th>Bill ID</th><th>Patient</th><th>Date</th><th>Total</th><th>Payment Status</th></tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td>{b.billId}</td>
                    <td>{b.patient?.fullName}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>{b.paymentStatus}</td>
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

export default BillingOverview;
