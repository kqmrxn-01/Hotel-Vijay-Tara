import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'contact', 'cancellation', 'check-in', 'check-out', 'system'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  recipient: {
    type: { type: String, enum: ['admin', 'customer', 'staff'], required: true },
    id: { type: mongoose.Schema.Types.ObjectId },
  },
  relatedModel: { type: String, enum: ['Booking', 'Payment', 'Review', 'Contact', 'Room', 'Customer'] },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

notificationSchema.index({ 'recipient.type': 1, 'recipient.id': 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
