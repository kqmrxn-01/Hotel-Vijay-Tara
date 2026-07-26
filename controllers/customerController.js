import Customer from '../models/Customer.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAllCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  ApiResponse.paginated(res, 'Customers fetched', customers, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  ApiResponse.success(res, 'Customer fetched', customer);
});

export const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.params.id }).populate('room', 'name type').sort({ createdAt: -1 });
  ApiResponse.success(res, 'Customer bookings fetched', bookings);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!customer) throw new ApiError(404, 'Customer not found');
  ApiResponse.success(res, 'Customer updated', customer);
});

export const blockCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  customer.isBlocked = !customer.isBlocked;
  await customer.save();
  ApiResponse.success(res, customer.isBlocked ? 'Customer blocked' : 'Customer unblocked', customer);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Customer deleted');
});
