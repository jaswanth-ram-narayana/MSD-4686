import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const PaymentForm = ({ amount, onPaymentComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0,
    },
    amountDisplay: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      margin: '24px 0',
    },
    methodsContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
    },
    methodButton: {
      flex: 1,
      padding: '16px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#dee2e6',
      borderRadius: '8px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    methodButtonActive: {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#3498db',
      backgroundColor: '#f8f9fa',
    },
    methodIcon: {
      fontSize: '24px',
      color: '#2c3e50',
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
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border-color 0.2s',
    },
    qrContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '24px',
    },
    upiContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      marginTop: '24px',
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
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
      ':hover': {
        backgroundColor: '#dee2e6',
      },
    },
    processingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '500',
    },
  };

  const handleCardInput = (e) => {
    const { name, value } = e.target;
    setCardForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberInput = (e) => {
    const value = formatCardNumber(e.target.value);
    setCardForm(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleExpiryInput = (e) => {
    const value = formatExpiryDate(e.target.value);
    setCardForm(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    let paymentDetails = {};
    if (paymentMethod === 'card') {
      paymentDetails = {
        cardNumber: cardForm.cardNumber.replace(/\s/g, '').slice(-4),
        cardHolderName: cardForm.cardName
      };
    } else if (paymentMethod === 'upi') {
      paymentDetails = { upiId };
    } else {
      paymentDetails = { 
        qrPayment: true,
        timestamp: new Date().toISOString()
      };
    }

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete({
        method: paymentMethod,
        details: paymentDetails,
        amount,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Payment Details</h2>
      </div>

      <div style={styles.amountDisplay}>
        ₹{amount.toFixed(2)}
      </div>

      <div style={styles.methodsContainer}>
        <button
          style={{
            ...styles.methodButton,
            ...(paymentMethod === 'card' ? styles.methodButtonActive : {})
          }}
          onClick={() => setPaymentMethod('card')}
        >
          <i className="fas fa-credit-card" style={styles.methodIcon}></i>
          Card Payment
        </button>
        <button
          style={{
            ...styles.methodButton,
            ...(paymentMethod === 'upi' ? styles.methodButtonActive : {})
          }}
          onClick={() => setPaymentMethod('upi')}
        >
          <i className="fas fa-mobile-alt" style={styles.methodIcon}></i>
          UPI Payment
        </button>
        <button
          style={{
            ...styles.methodButton,
            ...(paymentMethod === 'qr' ? styles.methodButtonActive : {})
          }}
          onClick={() => setPaymentMethod('qr')}
        >
          <i className="fas fa-qrcode" style={styles.methodIcon}></i>
          QR Code
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {paymentMethod === 'card' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Card Number</label>
              <input
                style={styles.input}
                type="text"
                name="cardNumber"
                value={cardForm.cardNumber}
                onChange={handleCardNumberInput}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cardholder Name</label>
              <input
                style={styles.input}
                type="text"
                name="cardName"
                value={cardForm.cardName}
                onChange={handleCardInput}
                placeholder="John Doe"
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date</label>
                <input
                  style={styles.input}
                  type="text"
                  name="expiryDate"
                  value={cardForm.expiryDate}
                  onChange={handleExpiryInput}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>CVV</label>
                <input
                  style={styles.input}
                  type="password"
                  name="cvv"
                  value={cardForm.cvv}
                  onChange={handleCardInput}
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
            </div>
          </>
        )}

        {paymentMethod === 'upi' && (
          <div style={styles.upiContainer}>
            <div style={styles.formGroup}>
              <label style={styles.label}>UPI ID</label>
              <input
                style={styles.input}
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                required
              />
            </div>
            <p>Enter your UPI ID to proceed with the payment</p>
          </div>
        )}

        {paymentMethod === 'qr' && (
          <div style={styles.qrContainer}>
            <QRCodeSVG 
              value={`upi://pay?pa=hospital@upi&pn=Hospital&am=${amount}&cu=INR`}
              size={200}
              level="H"
            />
            <p>Scan this QR code using any UPI app to pay</p>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={onCancel}
            style={{...styles.button, ...styles.secondaryButton}}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{...styles.button, ...styles.primaryButton}}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        {processing && (
          <div style={styles.processingOverlay}>
            Processing payment...
          </div>
        )}
      </form>
    </div>
  );
};

export default PaymentForm;