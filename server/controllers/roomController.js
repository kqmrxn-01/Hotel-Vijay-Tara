import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// @desc    Get all rooms (public, with filters)
export const getAllRooms = asyncHandler(async (req, res) => {
  const { type, minPrice, maxPrice, guests, status, sort, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (guests) filter.maxGuests = { $gte: parseInt(guests) };
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = parseInt(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = parseInt(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { pricePerNight: 1 };
  if (sort === 'price-desc') sortOption = { pricePerNight: -1 };
  if (sort === 'rating') sortOption = { averageRating: -1 };
  if (sort === 'popular') sortOption = { totalBookings: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Room.countDocuments(filter);
  const rooms = await Room.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit));

  ApiResponse.paginated(res, 'Rooms fetched', rooms, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Get room by slug
export const getRoomBySlug = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug, isActive: true });
  if (!room) throw new ApiError(404, 'Room not found');
  ApiResponse.success(res, 'Room fetched', room);
});

// @desc    Get room by ID
export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');
  ApiResponse.success(res, 'Room fetched', room);
});

// @desc    Check room availability
export const checkAvailability = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut } = req.query;
  if (!roomId || !checkIn || !checkOut) throw new ApiError(400, 'roomId, checkIn, and checkOut are required');

  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  if (room.status !== 'available') {
    return ApiResponse.success(res, 'Room not available', { available: false, reason: 'Room is currently ' + room.status });
  }

  // Check for conflicting bookings
  const conflicting = await Booking.findOne({
    room: roomId,
    status: { $in: ['pending', 'confirmed', 'checked-in'] },
    $or: [
      { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
    ],
  });

  ApiResponse.success(res, conflicting ? 'Room not available for these dates' : 'Room is available', {
    available: !conflicting,
    room: { id: room._id, name: room.name, pricePerNight: room.displayPrice },
  });
});

// @desc    Create room (Admin)
export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  ApiResponse.created(res, 'Room created successfully', room);
});

// @desc    Update room (Admin)
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) throw new ApiError(404, 'Room not found');
  ApiResponse.success(res, 'Room updated', room);
});

// @desc    Delete room (Admin)
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');
  ApiResponse.success(res, 'Room deleted');
});
