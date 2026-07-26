import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['cash', 'upi', 'credit-card', 'debit-card', 'net-banking', 'razorpay', 'stripe'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'partially-refunded'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  stripePaymentIntentId: String,
  transactionId: String,
  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  refundedAt: Date,
  paidAt: Date,
  invoiceNumber: String,
  notes: String,
}, { timestamps: true });

paymentSchema.pre('save', function (next) {
  if (!this.invoiceNumber && this.status === 'completed') {
    const date = new Date();
    this.invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export default mongoose.model('Payment', paymentSchema);
