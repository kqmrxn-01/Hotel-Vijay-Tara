import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Room name is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  type: { type: String, required: true, enum: ['deluxe', 'executive', 'premium', 'family-suite', 'presidential-suite'] },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, default: '' },
  pricePerNight: { type: Number, required: [true, 'Price is required'], min: 0 },
  discountPrice: { type: Number, default: 0 },
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, default: 1 },
  size: { type: Number, default: 0, min: 0 }, // in sq ft
  bedType: { type: String, enum: ['single', 'double', 'queen', 'king', 'twin', 'triple'], default: 'king' },
  maxGuests: { type: Number, required: true, min: 1, max: 10 },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
  }],
  amenities: {
    ac: { type: Boolean, default: true },
    wifi: { type: Boolean, default: true },
    tv: { type: Boolean, default: true },
    smartTv: { type: Boolean, default: false },
    minibar: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    bathtub: { type: Boolean, default: false },
    roomService: { type: Boolean, default: true },
    laundry: { type: Boolean, default: false },
    safe: { type: Boolean, default: false },
    desk: { type: Boolean, default: true },
    wardrobe: { type: Boolean, default: true },
    intercom: { type: Boolean, default: true },
    geyser: { type: Boolean, default: true },
  },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'disabled'], default: 'available' },
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from name
roomSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for display price
roomSchema.virtual('displayPrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.pricePerNight;
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

export default mongoose.model('Room', roomSchema);
