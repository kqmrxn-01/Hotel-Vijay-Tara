import Review from '../models/Review.js';
import Room from '../models/Room.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createReview = asyncHandler(async (req, res) => {
  const { roomId, bookingId, rating, title, comment } = req.body;
  if (!rating || !comment) throw new ApiError(400, 'Rating and comment are required');
  const review = await Review.create({ customer: req.user.id, room: roomId, booking: bookingId, rating, title, comment });
  ApiResponse.created(res, 'Review submitted for approval', review);
});

export const getApprovedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ status: 'approved' }).populate('customer', 'name avatar').populate('room', 'name').sort({ createdAt: -1 }).limit(20);
  ApiResponse.success(res, 'Reviews fetched', reviews);
});

export const getRoomReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ room: req.params.roomId, status: 'approved' }).populate('customer', 'name avatar').sort({ createdAt: -1 });
  ApiResponse.success(res, 'Room reviews fetched', reviews);
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ customer: req.user.id }).populate('room', 'name').sort({ createdAt: -1 });
  ApiResponse.success(res, 'My reviews fetched', reviews);
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter).populate('customer', 'name email').populate('room', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  ApiResponse.paginated(res, 'Reviews fetched', reviews, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status, adminReply } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');
  const update = { status };
  if (adminReply) { update.adminReply = adminReply; update.repliedAt = new Date(); }
  const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');

  // Update room average rating
  if (status === 'approved' && review.room) {
    const stats = await Review.aggregate([
      { $match: { room: review.room, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Room.findByIdAndUpdate(review.room, { averageRating: Math.round(stats[0].avg * 10) / 10, totalReviews: stats[0].count });
    }
  }
  ApiResponse.success(res, `Review ${status}`, review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  ApiResponse.success(res, 'Review deleted');
});
