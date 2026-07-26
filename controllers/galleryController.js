import Gallery from '../models/Gallery.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getGallery = asyncHandler(async (req, res) => {
  const media = await Gallery.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
  ApiResponse.success(res, 'Gallery fetched', media);
});

export const getGalleryByCategory = asyncHandler(async (req, res) => {
  const media = await Gallery.find({ category: req.params.category, isActive: true }).sort({ sortOrder: 1 });
  ApiResponse.success(res, 'Gallery fetched', media);
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const media = await Gallery.create({ ...req.body, uploadedBy: req.user.id });
  ApiResponse.created(res, 'Media uploaded', media);
});

export const updateMedia = asyncHandler(async (req, res) => {
  const media = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!media) throw new ApiError(404, 'Media not found');
  ApiResponse.success(res, 'Media updated', media);
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Gallery.findByIdAndDelete(req.params.id);
  if (!media) throw new ApiError(404, 'Media not found');
  ApiResponse.success(res, 'Media deleted');
});
