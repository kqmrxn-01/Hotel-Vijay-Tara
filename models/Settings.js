import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  hotelName: { type: String, default: 'Hotel Vijay Tara' },
  tagline: { type: String, default: 'Luxury, Comfort & Exceptional Hospitality' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  banner: [{ url: String, publicId: String, title: String }],
  contact: {
    phone: { type: String, default: '+91 80900 54641' },
    email: { type: String, default: 'info@hotelvijaytara.com' },
    whatsapp: { type: String, default: '+918090054641' },
    address: { type: String, default: 'Aurangabad - Daltenganj Rd, Main Road, Chhatarpur, Jharkhand 822113' },
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  seo: {
    metaTitle: { type: String, default: 'Hotel Vijay Tara — Luxury Stay in Chhatarpur, Jharkhand' },
    metaDescription: { type: String, default: '' },
    keywords: [String],
    ogImage: { type: String, default: '' },
  },
  googleMaps: {
    embedUrl: { type: String, default: '' },
    coordinates: { lat: Number, lng: Number },
  },
  policies: {
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    cancellationPolicy: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
  },
  booking: {
    currency: { type: String, default: 'INR' },
    taxPercentage: { type: Number, default: 12 },
    advanceBookingDays: { type: Number, default: 180 },
    minStay: { type: Number, default: 1 },
    maxStay: { type: Number, default: 30 },
  },
  maintenance: {
    isUnderMaintenance: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
