import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendEmail } from '../config/email.js';

// @desc    Create booking
export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, guestAddress, aadhaarNumber, specialRequest, paymentMethod } = req.body;

  if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestPhone) {
    throw new ApiError(400, 'Missing required booking fields');
  }

  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  if (room.status !== 'available') throw new ApiError(400, 'Room is not available');

  // Check for conflicting bookings
  const conflict = await Booking.findOne({
    room: roomId,
    status: { $in: ['pending', 'confirmed', 'checked-in'] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  if (conflict) throw new ApiError(400, 'Room is already booked for the selected dates');

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (nights < 1) throw new ApiError(400, 'Check-out must be after check-in');

  const pricePerNight = room.displayPrice;
  const totalAmount = pricePerNight * nights;
  const tax = Math.round(totalAmount * 0.12);
  const finalAmount = totalAmount + tax;

  const booking = await Booking.create({
    customer: req.user ? req.user.id : null,
    room: roomId,
    checkIn: inDate,
    checkOut: outDate,
    guests,
    nights,
    pricePerNight,
    totalAmount,
    tax,
    finalAmount,
    guestName,
    guestEmail: guestEmail || (req.user ? req.user.email : ''),
    guestPhone,
    guestAddress,
    aadhaarNumber,
    specialRequest,
    paymentMethod: paymentMethod || 'cash',
  });

  // Create notification for admin
  await Notification.create({
    type: 'booking',
    title: 'New Booking Received',
    message: `New booking ${booking.bookingId} by ${guestName} for ${room.name}`,
    recipient: { type: 'admin' },
    relatedModel: 'Booking',
    relatedId: booking._id,
    priority: 'high',
  });

  // Send confirmation email
  if (guestEmail) {
    sendEmail({
      to: guestEmail,
      subject: `Booking Confirmation - ${booking.bookingId} | Hotel Vijay Tara`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37; border-radius: 8px;">
          <h2 style="color: #0F3D2E; margin-bottom: 5px;">Hotel Vijay Tara</h2>
          <p style="color: #D4AF37; font-weight: bold; margin-top: 0;">Luxury, Comfort & Exceptional Hospitality</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>Dear <strong>${guestName}</strong>,</p>
          <p>Thank you for choosing Hotel Vijay Tara! Your booking has been received successfully.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9f9f9;"><td style="padding: 10px;"><strong>Booking ID:</strong></td><td style="padding: 10px;">${booking.bookingId}</td></tr>
            <tr><td style="padding: 10px;"><strong>Room:</strong></td><td style="padding: 10px;">${room.name}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px;"><strong>Check-in:</strong></td><td style="padding: 10px;">${inDate.toDateString()}</td></tr>
            <tr><td style="padding: 10px;"><strong>Check-out:</strong></td><td style="padding: 10px;">${outDate.toDateString()}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px;"><strong>Nights:</strong></td><td style="padding: 10px;">${nights}</td></tr>
            <tr><td style="padding: 10px;"><strong>Total Amount:</strong></td><td style="padding: 10px; font-weight: bold; color: #0F3D2E;">₹${finalAmount.toLocaleString('en-IN')}</td></tr>
          </table>
          <p>Address: Main Road, Chhatarpur, Jharkhand 822113</p>
          <p>Phone: +91 80900 54641</p>
          <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated email from Hotel Vijay Tara.</p>
        </div>
      `,
    });
  }

  // Update customer stats if logged in
  if (req.user) {
    await Customer.findByIdAndUpdate(req.user.id, { $inc: { totalBookings: 1 } });
  }

  const populated = await Booking.findById(booking._id).populate('room', 'name type images');
  ApiResponse.created(res, 'Booking created successfully', populated);
});

// @desc    Get my bookings (customer)
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { customer: req.user.id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter).populate('room', 'name type images pricePerNight').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  ApiResponse.paginated(res, 'Bookings fetched', bookings, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Get booking by ID
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room').populate('customer', 'name email phone').populate('payment');

  if (!booking) throw new ApiError(404, 'Booking not found');

  // Only allow owner or admin
  if (req.user && req.user.role === 'customer' && booking.customer && booking.customer._id.toString() !== req.user.id) {
    throw new ApiError(403, 'Not authorized to view this booking');
  }

  ApiResponse.success(res, 'Booking fetched', booking);
});

// @desc    Get all bookings (admin)
export const getAllBookings = asyncHandler(async (req, res) => {
  const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (startDate && endDate) {
    filter.checkIn = { $gte: new Date(startDate) };
    filter.checkOut = { $lte: new Date(endDate) };
  }
  if (search) {
    filter.$or = [
      { bookingId: { $regex: search, $options: 'i' } },
      { guestName: { $regex: search, $options: 'i' } },
      { guestPhone: { $regex: search, $options: 'i' } },
      { guestEmail: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter).populate('room', 'name type roomNumber').populate('customer', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  ApiResponse.paginated(res, 'Bookings fetched', bookings, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Update booking status (admin)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['confirmed', 'rejected', 'checked-in', 'checked-out', 'cancelled', 'no-show'];
  if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  booking.status = status;
  if (notes) booking.notes = notes;
  if (status === 'confirmed') booking.confirmedBy = req.user ? req.user.id : null;
  if (status === 'checked-in') booking.checkedInAt = new Date();
  if (status === 'checked-out') booking.checkedOutAt = new Date();
  if (status === 'cancelled' || status === 'rejected') booking.cancelledAt = new Date();

  await booking.save();

  // Update room status
  if (status === 'checked-in') await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });
  if (['checked-out', 'cancelled', 'rejected'].includes(status)) await Room.findByIdAndUpdate(booking.room, { status: 'available' });

  ApiResponse.success(res, `Booking ${status}`, booking);
});

// @desc    Cancel booking (customer/admin)
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (['cancelled', 'checked-out'].includes(booking.status)) throw new ApiError(400, 'Cannot cancel this booking');

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || 'Cancelled';
  await booking.save();

  await Room.findByIdAndUpdate(booking.room, { status: 'available' });

  await Notification.create({
    type: 'cancellation',
    title: 'Booking Cancelled',
    message: `Booking ${booking.bookingId} was cancelled`,
    recipient: { type: 'admin' },
    relatedModel: 'Booking',
    relatedId: booking._id,
    priority: 'high',
  });

  ApiResponse.success(res, 'Booking cancelled', booking);
});

// @desc    Delete booking (admin)
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  await Booking.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Booking deleted successfully');
});

