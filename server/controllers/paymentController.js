import razorpay from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import crypto from 'crypto';

// @desc    Create Razorpay order
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || !amount) throw new ApiError(400, 'bookingId and amount are required');

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: { bookingId: booking.bookingId, customerName: booking.guestName },
  });

  const payment = await Payment.create({
    booking: bookingId,
    customer: req.user.id,
    amount,
    method: 'razorpay',
    razorpayOrderId: order.id,
  });

  ApiResponse.created(res, 'Razorpay order created', {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed');
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, 'Payment not found');

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'completed';
  payment.paidAt = new Date();
  await payment.save();

  // Update booking
  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid', payment: payment._id });

  ApiResponse.success(res, 'Payment verified successfully', payment);
});

// @desc    Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('booking').populate('customer', 'name email');
  if (!payment) throw new ApiError(404, 'Payment not found');
  ApiResponse.success(res, 'Payment fetched', payment);
});

// @desc    Get all payments (admin)
export const getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter).populate('booking', 'bookingId guestName').populate('customer', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  ApiResponse.paginated(res, 'Payments fetched', payments, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Process refund (admin)
export const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.status !== 'completed') throw new ApiError(400, 'Only completed payments can be refunded');

  payment.status = amount >= payment.amount ? 'refunded' : 'partially-refunded';
  payment.refundAmount = amount || payment.amount;
  payment.refundReason = reason;
  payment.refundedAt = new Date();
  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded' });

  ApiResponse.success(res, 'Refund processed', payment);
});
