import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: [true, 'Check-in date is required'] },
  checkOut: { type: Date, required: [true, 'Check-out date is required'] },
  guests: { type: Number, required: true, min: 1 },
  nights: { type: Number, required: true, min: 1 },
  pricePerNight: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  guestName: { type: String, required: true, trim: true },
  guestEmail: { type: String, required: true, trim: true },
  guestPhone: { type: String, required: true, trim: true },
  guestAddress: { type: String, trim: true, default: '' },
  aadhaarNumber: { type: String, trim: true, default: '' },
  specialRequest: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'credit-card', 'debit-card', 'net-banking', 'razorpay', 'stripe'],
    default: 'cash',
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  couponUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  cancelledAt: Date,
  cancellationReason: String,
  checkedInAt: Date,
  checkedOutAt: Date,
  notes: { type: String, default: '' },
}, { timestamps: true });

// Generate booking ID before save
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const date = new Date();
    const prefix = 'HVT';
    const year = date.getFullYear().toString().slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `${prefix}${year}${month}${random}`;
  }
  next();
});

// Calculate nights
bookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = new Date(this.checkOut) - new Date(this.checkIn);
    this.nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (this.nights < 1) {
      return next(new Error('Check-out must be after check-in'));
    }
  }
  next();
});

bookingSchema.index({ checkIn: 1, checkOut: 1, room: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
