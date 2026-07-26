import Staff from '../models/Staff.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAllStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 'Staff fetched', staff);
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) throw new ApiError(404, 'Staff not found');
  ApiResponse.success(res, 'Staff fetched', staff);
});

export const createStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.create(req.body);
  ApiResponse.created(res, 'Staff member added', staff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!staff) throw new ApiError(404, 'Staff not found');
  ApiResponse.success(res, 'Staff updated', staff);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Staff deleted');
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { date, status, checkIn, checkOut } = req.body;
  const staff = await Staff.findById(req.params.id);
  if (!staff) throw new ApiError(404, 'Staff not found');
  staff.attendance.push({ date, status, checkIn, checkOut });
  await staff.save();
  ApiResponse.success(res, 'Attendance marked', staff);
});
