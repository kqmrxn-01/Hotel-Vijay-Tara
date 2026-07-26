import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
  title: { type: String, trim: true, default: '' },
  comment: { type: String, required: [true, 'Review comment is required'], trim: true },
  images: [{ url: String, publicId: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminReply: { type: String, trim: true, default: '' },
  repliedAt: Date,
  isVerifiedStay: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

reviewSchema.index({ room: 1, status: 1 });
reviewSchema.index({ customer: 1 });

export default mongoose.model('Review', reviewSchema);
