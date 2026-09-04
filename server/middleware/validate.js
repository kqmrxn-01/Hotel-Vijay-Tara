import validator from 'validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validate request body fields.
 * Usage: validate({ email: 'email', name: 'required', phone: 'phone' })
 */
export const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      if (rule.includes('required') && (!value || String(value).trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (!value && !rule.includes('required')) continue;

      const strValue = String(value).trim();

      if (rule.includes('email') && !validator.isEmail(strValue)) {
        errors.push(`${field} must be a valid email`);
      }

      if (rule.includes('phone') && !validator.isMobilePhone(strValue, 'en-IN')) {
        errors.push(`${field} must be a valid Indian phone number`);
      }

      if (rule.includes('minLength:')) {
        const min = parseInt(rule.split('minLength:')[1]);
        if (strValue.length < min) {
          errors.push(`${field} must be at least ${min} characters`);
        }
      }

      if (rule.includes('number') && isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      if (rule.includes('date') && !validator.isDate(strValue)) {
        errors.push(`${field} must be a valid date`);
      }
    }

    if (errors.length > 0) {
      return next(new ApiError(400, errors.join('; ')));
    }

    // Sanitize string fields (XSS protection)
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key].trim());
      }
    }

    next();
  };
};

export default validate;
