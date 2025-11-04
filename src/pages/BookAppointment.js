import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentForm from './components/PaymentForm';
import Invoice from './components/Invoice';

// sensible defaults so the UI works even if the backend endpoint is empty/unavailable
const DEFAULT_DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'ENT',
  'Gynecology'
];

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    date: '',
    time: '',
    purpose: '',
    symptoms: ''
  });
  
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [billId, setBillId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDepartments();
  }, [user, navigate]);

  // Listen for global appointmentCancelled events to refresh available slots
  useEffect(() => {
    const handler = (e) => {
      const { doctorId, date } = e.detail || {};
      if (doctorId && date && doctorId === formData.doctorId && date === formData.date) {
        // If the cancelled appointment is for the currently selected doctor/date, refresh slots
        fetchAvailableSlots(doctorId, date);
      }
    };

    window.addEventListener('appointmentCancelled', handler);
    return () => window.removeEventListener('appointmentCancelled', handler);
  }, [formData.doctorId, formData.date]);

  const fetchDepartments = async () => {
    try {
      // Fetch from the departments collection endpoint
      const response = await api.get('/departments');
      const returned = response?.data?.data?.departments;
      setDepartments(Array.isArray(returned) && returned.length > 0 ? returned.map(d => d.name) : DEFAULT_DEPARTMENTS);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // keep fallback so UI still works
      setDepartments(DEFAULT_DEPARTMENTS);
    }
  };

  const fetchDoctors = async (department) => {
    try {
      const response = await api.get(`/appointments/doctors/${department}`);
      setDoctors(response.data.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Error loading doctors');
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/available-slots/${doctorId}?date=${date}`);
      setAvailableSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      alert('Error loading available time slots');
    }
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setFormData({
      ...formData,
      department,
      doctorId: '',
      date: '',
      time: ''
    });
    setDoctors([]);
    setAvailableSlots([]);
    setSelectedDoctor(null);
    
    if (department) {
      fetchDoctors(department);
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(doc => doc._id === doctorId);
    
    setFormData({
      ...formData,
      doctorId,
      date: '',
      time: ''
    });
    setAvailableSlots([]);
    setSelectedDoctor(doctor);
    
    if (doctorId) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData({
      ...formData,
      date,
      time: ''
    });
    setAvailableSlots([]);
    
    if (date && formData.doctorId) {
      fetchAvailableSlots(formData.doctorId, date);
      setStep(4);
    }
  };

  const handleTimeSelect = (time) => {
    setFormData({
      ...formData,
      time
    });
    setStep(5);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorId || !formData.date || !formData.time || !formData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/appointments', formData);
      
      if (response.data.status === 'success') {
        setAppointmentId(response.data.data.appointment._id);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentDetails) => {
    try {
      // Get the patient ID first
      const patientResponse = await api.get('/patients/me');
      if (!patientResponse.data.data.patient) {
        throw new Error('Patient profile not found');
      }
      const patientId = patientResponse.data.data.patient._id;

      // First create the bill
      const billingResponse = await api.post('/billing', {
        appointmentId,
        patient: patientId,
        doctorId: formData.doctorId,
        amount: selectedDoctor.consultationFee,
        paymentMode: paymentDetails.method.toUpperCase(),
        paymentStatus: 'Paid',
        paymentDetails: paymentDetails.details
      });

      if (billingResponse.data.status === 'success') {
        // Keep appointment status as 'Pending' — doctor will confirm the appointment later.
        // We still save the bill and show the invoice to the patient.
        setBillId(billingResponse.data.data.bill._id);
        setShowPayment(false);
        setShowInvoice(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      let errorMessage = 'Error processing payment. Please try again.';
      
      if (error.message === 'Patient profile not found') {
        errorMessage = 'Your patient profile was not found. Please contact support.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Could not find the appointment. Please try booking again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to update this appointment.';
      }
      
      alert(errorMessage);
      setShowPayment(false);  // Close payment form on error
    }
  };

  const handleViewInvoice = () => {
    setShowInvoice(true);
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/billing/${billId}`);
      const bill = response.data.data.bill;
      // Generate PDF invoice using the bill data
      // You can implement the PDF generation logic here
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    alert('Payment successful! You can view or download your invoice.');
    navigate('/patient-dashboard');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // 2 months in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to book an appointment.</p>
          <button 
            className="btn" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    invoiceActions: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      justifyContent: 'flex-end'
    }
  };

  return (
    <div className="container">
      <div className="booking-card">
        <div className="booking-header">
          <h1><i className="fas fa-calendar-plus"></i> Book Appointment</h1>
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Department</p>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Doctor</p>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Date</p>
            </div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <span>4</span>
              <p>Time</p>
            </div>
            <div className={`step ${step >= 5 ? 'active' : ''}`}>
              <span>5</span>
              <p>Details</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="appointment-form">
          {/* Step 1: Department Selection */}
          {step >= 1 && (
            <div className="form-section">
              <h3>Select Department</h3>
              <div className="form-group">
                <label htmlFor="department">Medical Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="">Choose a department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Doctor Selection */}
          {step >= 2 && doctors.length > 0 && (
            <div className="form-section">
              <h3>Select Doctor</h3>
              <div className="form-group">
                <label htmlFor="doctor">Available Doctors *</label>
                <select
                  id="doctor"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization} (₹{doctor.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div className="doctor-info">
                  <h4>Doctor Information</h4>
                  <p><strong>Name:</strong> {selectedDoctor.name}</p>
                  <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                  <p><strong>Department:</strong> {selectedDoctor.department}</p>
                  <p><strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}</p>
                  <p><strong>Availability:</strong> {selectedDoctor.availability?.days?.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date Selection */}
          {step >= 3 && (
            <div className="form-section">
              <h3>Select Date</h3>
              <div className="form-group">
                <label htmlFor="date">Appointment Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Time Selection */}
          {step >= 4 && availableSlots.length > 0 && (
            <div className="form-section">
              <h3>Select Time Slot</h3>
              <div className="form-group">
                <label>Available Time Slots *</label>
                <div className="time-slots">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`time-slot ${formData.time === slot.time ? 'selected' : ''} ${
                        !slot.available ? 'disabled' : ''
                      }`}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                      {!slot.available && <span className="slot-status">Booked</span>}
                    </button>
                  ))}
                </div>
                {formData.time && (
                  <p className="selected-time">
                    Selected time: <strong>{formData.time}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Appointment Details */}
          {step >= 5 && (
            <div className="form-section">
              <h3>Appointment Details</h3>
              
              <div className="form-group">
                <label htmlFor="purpose">Purpose of Visit *</label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select purpose</option>
                  <option value="Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Checkup">Routine Checkup</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Test Results">Test Results Discussion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="symptoms">Symptoms or Additional Information</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your symptoms or any additional information..."
                />
              </div>

              <div className="appointment-summary">
                <h4>Appointment Summary</h4>
                <div className="summary-details">
                  <p><strong>Department:</strong> {formData.department}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formData.time}</p>
                  <p><strong>Purpose:</strong> {formData.purpose}</p>
                  <p><strong>Consultation Fee:</strong> ₹{selectedDoctor?.consultationFee}</p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Booking Appointment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-right"></i> Proceed to Payment
                  </>
                )}
              </button>
            </div>
          )}

          {step < 5 && (
            <div className="form-navigation">
              <p className="step-guide">
                {step === 1 && 'Select a medical department to continue'}
                {step === 2 && 'Choose a doctor from the available specialists'}
                {step === 3 && 'Select your preferred appointment date'}
                {step === 4 && 'Pick an available time slot'}
              </p>
            </div>
          )}
        </form>
      </div>

      {showPayment && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <PaymentForm
              amount={selectedDoctor?.consultationFee}
              onPaymentComplete={handlePaymentComplete}
              onCancel={() => setShowPayment(false)}
            />
          </div>
        </div>
      )}

      {showInvoice && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '10px 12px', borderRadius: 6, border: '1px solid #ffeeba', maxWidth: '75%' }}>
                <strong>Pending confirmation:</strong> Your appointment is currently <em>Pending</em>. The doctor will confirm the appointment after reviewing the request. You can view or download the invoice below.
              </div>
              <div style={styles.invoiceActions}>
                <button onClick={handleViewInvoice} className="btn btn-primary">
                  <i className="fas fa-eye"></i> View Invoice
                </button>
                <button onClick={handleDownloadInvoice} className="btn btn-secondary">
                  <i className="fas fa-download"></i> Download Invoice
                </button>
                <button onClick={handlePaymentSuccess} className="btn btn-success">
                  <i className="fas fa-check"></i> Done
                </button>
              </div>
            </div>
            <Invoice
              billId={billId}
              appointment={{
                doctor: selectedDoctor,
                date: formData.date,
                time: formData.time,
                department: formData.department,
                purpose: formData.purpose
              }}
              patient={user}
              amount={selectedDoctor?.consultationFee}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;