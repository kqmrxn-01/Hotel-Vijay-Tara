import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, trim: true, default: '' },
  category: { type: String, enum: ['hotel', 'rooms', 'restaurant', 'pool', 'events', 'lobby', 'exterior', 'other'], default: 'hotel' },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  publicId: { type: String },
  thumbnail: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

gallerySchema.index({ category: 1, sortOrder: 1 });

export default mongoose.model('Gallery', gallerySchema);
