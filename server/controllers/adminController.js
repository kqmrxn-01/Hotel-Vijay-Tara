import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// @desc    Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalRooms, availableRooms, occupiedRooms, totalCustomers, totalBookings, todayBookings, pendingBookings, cancelledBookings] = await Promise.all([
    Room.countDocuments({ isActive: true }),
    Room.countDocuments({ status: 'available', isActive: true }),
    Room.countDocuments({ status: 'occupied', isActive: true }),
    Customer.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'cancelled' }),
  ]);

  const revenueResult = await Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  const todayRevenueResult = await Payment.aggregate([{ $match: { status: 'completed', paidAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

  ApiResponse.success(res, 'Dashboard stats', {
    totalRevenue: revenueResult[0]?.total || 0,
    todayRevenue: todayRevenueResult[0]?.total || 0,
    totalRooms, availableRooms, occupiedRooms, totalCustomers, totalBookings, todayBookings, pendingBookings, cancelledBookings,
  });
});

// @desc    Revenue chart data (last 12 months)
export const getRevenueChart = asyncHandler(async (req, res) => {
  const months = 12;
  const data = await Payment.aggregate([
    { $match: { status: 'completed', paidAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - months)) } } },
    { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  ApiResponse.success(res, 'Revenue chart', data);
});

// @desc    Booking chart data
export const getBookingChart = asyncHandler(async (req, res) => {
  const data = await Booking.aggregate([
    { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  ApiResponse.success(res, 'Booking chart', data);
});

// @desc    Occupancy data
export const getOccupancyData = asyncHandler(async (req, res) => {
  const rooms = await Room.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  ApiResponse.success(res, 'Occupancy data', rooms);
});

// @desc    Monthly report
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const [bookings, revenue, newCustomers] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Payment.aggregate([{ $match: { status: 'completed', paidAt: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Customer.countDocuments({ createdAt: { $gte: start, $lt: end } }),
  ]);

  ApiResponse.success(res, 'Monthly report', { month: m, year: y, totalBookings: bookings, totalRevenue: revenue[0]?.total || 0, newCustomers });
});
