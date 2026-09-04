import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control middleware.
 * Usage: authorize('admin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`));
    }
    next();
  };
};

export default authorize;
