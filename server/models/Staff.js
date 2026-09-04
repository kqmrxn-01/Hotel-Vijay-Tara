import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['manager', 'receptionist', 'accountant', 'housekeeping', 'security', 'chef', 'waiter'], required: true },
  department: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  address: { type: String, trim: true, default: '' },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  attendance: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'leave', 'half-day'], required: true },
    checkIn: String,
    checkOut: String,
  }],
  documents: [{
    title: String,
    url: String,
    publicId: String,
  }],
}, { timestamps: true });

staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

staffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Staff', staffSchema);
