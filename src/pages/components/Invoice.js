import React from 'react';
import api from '../../services/api';

const Invoice = ({ billId, appointment, patient, amount }) => {
  const [billData, setBillData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBillData = async () => {
      try {
        const response = await api.get(`/billing/${billId}`);
        if (response.data.status === 'success') {
          setBillData(response.data.data.bill);
        }
      } catch (error) {
        console.error('Error fetching bill data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (billId) {
      fetchBillData();
    }
  }, [billId]);

  // Debug: log fetched bill and appointment props
  React.useEffect(() => {
    if (!loading && billData) {
      console.debug('Invoice debug - billData:', billData);
      console.debug('Invoice debug - appointment prop:', appointment);
    }
  }, [loading, billData, appointment]);

  if (loading) {
    return <div>Loading invoice...</div>;
  }

  if (!billData) {
    return <div>Error loading invoice. Please try again.</div>;
  }

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '28px',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      color: '#223'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '28px',
      borderBottom: '1px solid #e6e9ee',
      paddingBottom: '18px',
    },
    hospitalInfo: {
      flex: 1,
    },
    hospitalName: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f3b66',
      marginBottom: '6px',
    },
    hospitalAddress: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.4',
    },
    billInfo: {
      textAlign: 'right',
      minWidth: '180px'
    },
    billNumber: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '8px',
    },
    billDate: {
      color: '#666',
      fontSize: '14px',
    },
    patientInfo: {
      marginBottom: '28px',
    },
    infoBlock: {
      marginBottom: '20px',
    },
    label: {
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '4px',
    },
    value: {
      color: '#666',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '30px',
    },
    th: {
      backgroundColor: '#f8f9fa',
      padding: '12px',
      textAlign: 'left',
      borderBottom: '2px solid #dee2e6',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6',
    },
    totalRow: {
      fontWeight: 'bold',
      backgroundColor: '#f8f9fa',
    },
    patientTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0f3b66',
      marginBottom: '12px',
    },
    patientDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    detailItem: {
      marginBottom: '8px',
    },
    label: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '4px',
    },
    value: {
      color: '#2c3e50',
      fontSize: '14px',
      fontWeight: '500',
    },
    servicesTable: {
      width: '100%',
      marginBottom: '32px',
      borderCollapse: 'collapse',
      borderRadius: 6,
      overflow: 'hidden'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      color: '#2c3e50',
      fontWeight: '600',
      fontSize: '14px',
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #dee2e6',
      color: '#2c3e50',
      fontSize: '14px',
    },
    totalSection: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '32px',
    },
    totalTable: {
      width: '300px',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px',
    },
    totalLabel: {
      color: '#666',
    },
    totalValue: {
      color: '#2c3e50',
      fontWeight: '500',
    },
    grandTotal: {
      borderTop: '2px solid #dee2e6',
      marginTop: '8px',
      paddingTop: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    footer: {
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '13px',
      marginTop: '28px',
      paddingTop: '16px',
      borderTop: '1px solid #eef2f6',
    },
    downloadButton: {
      backgroundColor: '#3498db',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#2980b9',
      },
    },
  };

  // Calculate tax components
  const baseAmount = billData.totalAmount / 1.18;
  const gstAmount = billData.totalAmount - baseAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  // Derive safe display values for appointment-related fields
  const docName = appointment?.doctor?.name || billData?.doctor?.name || 'Doctor';
  const deptDisplay = appointment?.department || billData?.department || '—';
  // Format appointment date/time safely. If appointment.date is invalid, fall back to bill created date or a dash.
  const getFormattedApptDate = () => {
    // preference order: appointment.date -> billData.createdAt
    const rawDate = appointment?.date || billData?.createdAt;
    if (!rawDate) return '—';

    // helper to handle various serialized date shapes
    const parseRawDate = (r) => {
      if (!r) return null;
      // Date object
      if (r instanceof Date) return r;
      // ISO string or numeric timestamp
      if (typeof r === 'string' || typeof r === 'number') {
        const d = new Date(r);
        if (!isNaN(d.getTime())) return d;
      }
      // MongoDB extended JSON: { $date: '2023-01-01T...' } or { $date: 169... }
      if (typeof r === 'object') {
        if (r.$date) return new Date(r.$date);
        if (r.date) return new Date(r.date);
        // sometimes numbers are wrapped
        if (r.$numberLong) {
          const n = Number(r.$numberLong);
          if (!isNaN(n)) return new Date(n);
        }
      }
      return null;
    };

    const parsed = parseRawDate(rawDate);
    console.debug('Invoice debug - rawDate:', rawDate, 'parsed:', parsed);

    if (!parsed) {
      return billData?.createdAt ? new Date(billData.createdAt).toLocaleDateString() : '—';
    }

    const timePart = appointment?.time || billData?.time || '';
    return timePart ? `${parsed.toLocaleDateString()} at ${timePart}` : parsed.toLocaleDateString();
  };

  const apptDateDisplay = getFormattedApptDate();
  const purposeDisplay = appointment?.purpose || 'Consultation';

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Invoice</title>');
      printWindow.document.write('<style>body{font-family: Arial, Helvetica, sans-serif; padding:20px; color:#222} .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px} .hospital{font-weight:700;color:#0f3b66} .billInfo{text-align:right}</style>');
      printWindow.document.write('</head><body>');
      // copy the invoice HTML contained in this component
      const root = document.querySelector('[data-invoice-root]');
      if (root) {
        printWindow.document.write(root.innerHTML);
      } else {
        // fallback: render minimal invoice
        printWindow.document.write(`<div><h1>Invoice ${billData.billId}</h1><p>Amount: ₹${billData.totalAmount}</p></div>`);
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div style={styles.container} data-invoice-root>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={handleDownloadPDF} className="btn btn-primary">
          <i className="fas fa-download"></i> Download PDF
        </button>
      </div>
  <div style={styles.header}>
        <div style={styles.hospitalInfo}>
          <div style={styles.hospitalName}>HMS Hospital</div>
          <div style={styles.hospitalAddress}>
            123 Healthcare Avenue<br />
            Medical District, City - 123456<br />
            Phone: (123) 456-7890<br />
            Email: info@hmshospital.com
          </div>
        </div>
        <div style={styles.billInfo}>
          <div style={styles.billNumber}>Bill No: {billData.billId}</div>
          <div style={styles.billDate}>Date: {new Date(billData.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div style={styles.patientInfo}>
        <div style={styles.patientTitle}>Patient Information</div>
        <div style={styles.patientDetails}>
          <div style={styles.detailItem}>
            <div style={styles.label}>Patient Name</div>
            <div style={styles.value}>{billData.patient?.fullName || patient?.fullName || patient?.username || 'Patient'}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.label}>Doctor</div>
            <div style={styles.value}>{appointment?.doctor?.name || billData?.doctor?.name || 'Doctor'}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.label}>Department</div>
            <div style={styles.value}>{appointment?.department || billData?.department || '—'}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.label}>Appointment Date & Time</div>
            <div style={styles.value}>{apptDateDisplay}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.label}>Purpose</div>
            <div style={styles.value}>{purposeDisplay}</div>
          </div>
        </div>
      </div>

      <table style={styles.servicesTable}>
        <thead>
          <tr>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>GST</th>
            <th style={styles.th}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.td}>Consultation Fee</td>
            <td style={styles.td}>₹{baseAmount.toFixed(2)}</td>
            <td style={styles.td}>₹{gstAmount.toFixed(2)} (18%)</td>
            <td style={styles.td}>₹{billData.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style={styles.totalSection}>
        <div style={styles.totalTable}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Base Amount</span>
            <span style={styles.totalValue}>₹{baseAmount.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>CGST (9%)</span>
            <span style={styles.totalValue}>₹{cgst.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>SGST (9%)</span>
            <span style={styles.totalValue}>₹{sgst.toFixed(2)}</span>
          </div>
          <div style={{...styles.totalRow, ...styles.grandTotal}}>
            <span>Total Amount</span>
            <span>₹{billData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p>Payment Method: {billData.paymentMode}</p>
        <p>Payment Status: {billData.paymentStatus}</p>
        <p>Thank you for choosing HMS Hospital. For any queries, please contact our billing department.</p>
      </div>
    </div>
  );
};

export default Invoice;