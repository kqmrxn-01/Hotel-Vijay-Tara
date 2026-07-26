import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getMenu = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ isActive: true }).sort({ category: 1, sortOrder: 1 });
  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  ApiResponse.success(res, 'Menu fetched', grouped);
});

export const getMenuByCategory = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ category: req.params.category, isActive: true }).sort({ sortOrder: 1 });
  ApiResponse.success(res, 'Menu fetched', items);
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  ApiResponse.created(res, 'Menu item added', item);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw new ApiError(404, 'Item not found');
  ApiResponse.success(res, 'Menu item updated', item);
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Menu item deleted');
});
