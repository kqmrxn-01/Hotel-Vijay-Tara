import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], trim: true },
  phone: { type: String, trim: true, default: '' },
  subject: { type: String, required: [true, 'Subject is required'], trim: true },
  message: { type: String, required: [true, 'Message is required'], trim: true },
  type: { type: String, enum: ['general', 'booking', 'complaint', 'feedback', 'callback'], default: 'general' },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  reply: { type: String, trim: true, default: '' },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  repliedAt: Date,
}, { timestamps: true });

contactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Contact', contactSchema);
