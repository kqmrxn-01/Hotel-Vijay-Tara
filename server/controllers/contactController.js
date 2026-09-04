import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, type } = req.body;
  if (!name || !email || !subject || !message) throw new ApiError(400, 'Name, email, subject, and message are required');
  const contact = await Contact.create({ name, email, phone, subject, message, type });
  await Notification.create({ type: 'contact', title: 'New Contact Message', message: `${name} sent: ${subject}`, recipient: { type: 'admin' }, relatedModel: 'Contact', relatedId: contact._id });
  ApiResponse.created(res, 'Message sent successfully');
});

export const getAllContacts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Contact.countDocuments(filter);
  const contacts = await Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  ApiResponse.paginated(res, 'Contacts fetched', contacts, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
});

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
  if (!contact) throw new ApiError(404, 'Contact not found');
  ApiResponse.success(res, 'Contact fetched', contact);
});

export const replyToContact = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  if (!reply) throw new ApiError(400, 'Reply is required');
  const contact = await Contact.findByIdAndUpdate(req.params.id, { reply, status: 'replied', repliedBy: req.user.id, repliedAt: new Date() }, { new: true });
  if (!contact) throw new ApiError(404, 'Contact not found');
  ApiResponse.success(res, 'Reply sent', contact);
});

export const deleteContact = asyncHandler(async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Contact deleted');
});
