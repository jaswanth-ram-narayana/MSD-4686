const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  services: [{
    serviceName: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    total: Number
  }],
  totalAmount: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'Card', 'UPI', 'QR', 'Insurance'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Failed', 'Partial'], 
    default: 'Pending' 
  },
  paymentDetails: {
    cardNumber: String,
    cardHolderName: String,
    upiId: String,
    transactionId: String,
    provider: String,
    policyNumber: String,
    coverageAmount: Number
  }
}, { timestamps: true });

// Calculate GST components (assuming 18% GST)
billingSchema.methods.getGSTComponents = function() {
  const baseAmount = this.totalAmount / 1.18;
  const CGST = baseAmount * 0.09;
  const SGST = baseAmount * 0.09;
  
  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    CGST: Math.round(CGST * 100) / 100,
    SGST: Math.round(SGST * 100) / 100
  };
};

// Virtual for total tax amount
billingSchema.virtual('taxAmount').get(function() {
  const { CGST, SGST } = this.getGSTComponents();
  return CGST + SGST;
});

module.exports = mongoose.model('Billing', billingSchema);