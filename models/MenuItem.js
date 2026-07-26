import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Item name is required'], trim: true },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts', 'special'], required: true },
  type: { type: String, enum: ['veg', 'non-veg', 'egg'], required: true },
  image: { url: String, publicId: String },
  isAvailable: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  preparationTime: { type: Number, default: 15 }, // minutes
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

menuItemSchema.index({ category: 1, isActive: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
