import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, trim: true, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0 }, // Max cap for percentage discounts
  minBookingAmount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // Empty = all rooms
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

couponSchema.methods.isValid = function () {
  const now = new Date();
  return this.isActive && now >= this.validFrom && now <= this.validUntil && (this.usageLimit === 0 || this.usedCount < this.usageLimit);
};

export default mongoose.model('Coupon', couponSchema);
