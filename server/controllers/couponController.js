import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  if (!code) throw new ApiError(400, 'Coupon code is required');
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');
  if (!coupon.isValid()) throw new ApiError(400, 'Coupon is expired or has been used up');
  if (amount && coupon.minBookingAmount > amount) throw new ApiError(400, `Minimum booking amount is ₹${coupon.minBookingAmount}`);

  let discount = coupon.discountType === 'percentage' ? Math.round((amount * coupon.discountValue) / 100) : coupon.discountValue;
  if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

  ApiResponse.success(res, 'Coupon applied', { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount, couponId: coupon._id });
});

export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 'Coupons fetched', coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
  ApiResponse.created(res, 'Coupon created', coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  ApiResponse.success(res, 'Coupon updated', coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Coupon deleted');
});
