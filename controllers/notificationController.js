import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const filter = { 'recipient.type': req.user.role === 'customer' ? 'customer' : 'admin' };
  if (req.user.role === 'customer') filter['recipient.id'] = req.user.id;
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });
  ApiResponse.success(res, 'Notifications fetched', { notifications, unreadCount });
});

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  ApiResponse.success(res, 'Marked as read');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const filter = { 'recipient.type': req.user.role === 'customer' ? 'customer' : 'admin', isRead: false };
  if (req.user.role === 'customer') filter['recipient.id'] = req.user.id;
  await Notification.updateMany(filter, { isRead: true, readAt: new Date() });
  ApiResponse.success(res, 'All marked as read');
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Notification deleted');
});
