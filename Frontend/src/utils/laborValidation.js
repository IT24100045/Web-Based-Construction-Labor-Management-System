// Validation utilities for Construction Labor Management Module

export const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12}|EMP-[0-9]{3,6})$/i;
export const PHONE_REGEX = /^(?:\+?[0-9]{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,12}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const NAME_REGEX = /^[a-zA-Z\s.'-]+$/;

export const MIN_HOURLY_RATE = 200;
export const MAX_HOURLY_RATE = 25000;

/**
 * Identify the format of a Sri Lankan NIC or Employee ID
 */
export const identifyNicFormat = (nic) => {
  if (!nic) return null;
  const clean = nic.trim();
  if (/^[0-9]{9}[vVxX]$/.test(clean)) {
    return { type: 'old', label: 'Old NIC (9 Digits + V/X)', valid: true };
  }
  if (/^[0-9]{12}$/.test(clean)) {
    return { type: 'new', label: 'New Smart NIC (12 Digits)', valid: true };
  }
  if (/^EMP-[0-9]{3,6}$/i.test(clean)) {
    return { type: 'emp', label: 'Company Employee ID', valid: true };
  }
  return { type: 'unknown', label: 'Invalid ID Format', valid: false };
};

/**
 * Normalize phone number for comparison
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Validate a single field in a laborer profile
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {object} context - Extra context (e.g. existing laborers list, current laborerId)
 * @returns {string} - Error message, or empty string if valid
 */
export const validateLaborerField = (field, value, context = {}) => {
  const { existingLaborers = [], currentLaborerId = null } = context;
  const strVal = typeof value === 'string' ? value.trim() : (value || '');

  switch (field) {
    case 'name': {
      if (!strVal) return 'Full name is required.';
      if (strVal.length < 3) return 'Name must be at least 3 characters long.';
      if (strVal.length > 70) return 'Name cannot exceed 70 characters.';
      if (!NAME_REGEX.test(strVal)) return 'Name can only contain letters, spaces, dots, hyphens, and apostrophes.';
      const letterCount = (strVal.match(/[a-zA-Z]/g) || []).length;
      if (letterCount < 2) return 'Name must contain at least 2 alphabetical letters.';
      return '';
    }

    case 'nic': {
      return '';
    }

    case 'phone': {
      if (!strVal) return 'Contact phone number is required.';
      const digitsOnly = strVal.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 12) {
        return 'Phone number must contain between 9 and 12 digits.';
      }
      if (!PHONE_REGEX.test(strVal)) {
        return 'Please enter a valid phone number (e.g., +94 77 123 4567 or 0771234567).';
      }
      // Warning for duplicate phone across laborers
      if (digitsOnly.length >= 9) {
        const dupPhone = existingLaborers.find(
          (l) => l.id !== currentLaborerId && normalizePhone(l.phone) === digitsOnly
        );
        if (dupPhone) {
          return `Phone is already used by ${dupPhone.name} (${dupPhone.id}).`;
        }
      }
      return '';
    }

    case 'email': {
      if (!strVal) return ''; // Optional
      if (strVal.length > 100) return 'Email cannot exceed 100 characters.';
      if (!EMAIL_REGEX.test(strVal)) return 'Please enter a valid email address (e.g., name@domain.com).';
      return '';
    }

    case 'hourlyRate': {
      if (value === '' || value === null || value === undefined) {
        return 'Hourly wage rate is required.';
      }
      const num = parseFloat(value);
      if (isNaN(num)) return 'Wage rate must be a valid numeric amount.';
      if (num < MIN_HOURLY_RATE) {
        return `Minimum wage rate allowed is Rs. ${MIN_HOURLY_RATE.toFixed(2)}/hr.`;
      }
      if (num > MAX_HOURLY_RATE) {
        return `Maximum wage rate allowed is Rs. ${MAX_HOURLY_RATE.toFixed(2)}/hr. Please check for extra zeros.`;
      }
      return '';
    }

    case 'emergencyContact': {
      if (!strVal) {
        return 'Emergency contact details are required for site safety and medical compliance.';
      }
      if (strVal.length < 5) {
        return 'Please provide complete emergency contact details (min 5 characters).';
      }
      const digits = (strVal.match(/[0-9]/g) || []).length;
      if (digits < 7) {
        return 'Emergency contact must include a valid contact telephone number.';
      }
      return '';
    }

    case 'role': {
      if (!strVal) return 'Job role / trade is required.';
      return '';
    }

    case 'skillLevel': {
      if (!strVal) return 'Skill and certification tier is required.';
      return '';
    }

    case 'address': {
      if (strVal && strVal.length > 255) {
        return 'Address cannot exceed 255 characters.';
      }
      return '';
    }

    case 'status': {
      if (!strVal) return 'Employment status is required.';
      if (!['Active', 'On Leave', 'Inactive'].includes(strVal)) {
        return 'Invalid status. Must be Active, On Leave, or Inactive.';
      }
      return '';
    }

    default:
      return '';
  }
};

/**
 * Validate the entire laborer form
 * @param {object} form - Form data
 * @param {object} context - Validation context
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateLaborerForm = (form, context = {}) => {
  const fieldsToValidate = [
    'name',
    'phone',
    'email',
    'hourlyRate',
    'emergencyContact',
    'address',
    'role',
    'skillLevel'
  ];

  if (form.status !== undefined) {
    fieldsToValidate.push('status');
  }

  const errors = {};
  fieldsToValidate.forEach((field) => {
    const error = validateLaborerField(field, form[field], context);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
