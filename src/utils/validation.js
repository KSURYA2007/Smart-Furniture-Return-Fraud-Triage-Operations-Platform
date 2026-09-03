/**
 * Client-Side Validation Utility for Module 1
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_COUNT = 8;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates the entire return request form data
 * @param {Object} formData 
 * @returns {Object} Object containing error messages keyed by field path
 */
export function validateReturnForm(formData) {
  const errors = {};

  // --- Customer Information ---
  if (!formData.customer?.customer_id?.trim()) {
    errors['customer.customer_id'] = 'Customer ID is required.';
  }

  if (!formData.customer?.name?.trim()) {
    errors['customer.name'] = 'Customer name is required.';
  } else if (formData.customer.name.trim().length < 2) {
    errors['customer.name'] = 'Customer name must be at least 2 characters.';
  }

  if (!formData.customer?.email?.trim()) {
    errors['customer.email'] = 'Email address is required.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer.email.trim())) {
      errors['customer.email'] = 'Please enter a valid email address.';
    }
  }

  if (!formData.customer?.phone?.trim()) {
    errors['customer.phone'] = 'Phone number is required.';
  } else {
    // Allows international formats, digits, plus sign, spaces, hyphens
    const cleanPhone = formData.customer.phone.replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      errors['customer.phone'] = 'Please enter a valid phone number (8-15 digits).';
    }
  }

  // --- Order Information ---
  if (!formData.order?.order_id?.trim()) {
    errors['order.order_id'] = 'Order ID is required.';
  }

  if (!formData.order?.product_id?.trim()) {
    errors['order.product_id'] = 'Product ID is required.';
  }

  if (!formData.order?.product_name?.trim()) {
    errors['order.product_name'] = 'Product name is required.';
  }

  if (!formData.order?.category?.trim()) {
    errors['order.category'] = 'Please select a product category.';
  }

  const price = Number(formData.order?.price);
  if (formData.order?.price === '' || formData.order?.price === null || formData.order?.price === undefined || isNaN(price)) {
    errors['order.price'] = 'Product price is required and must be numeric.';
  } else if (price <= 0) {
    errors['order.price'] = 'Product price must be greater than 0.';
  }

  if (!formData.order?.purchase_date) {
    errors['order.purchase_date'] = 'Purchase date is required.';
  }

  if (!formData.order?.delivery_date) {
    errors['order.delivery_date'] = 'Delivery date is required.';
  }

  if (formData.order?.purchase_date && formData.order?.delivery_date) {
    const purchaseTime = new Date(formData.order.purchase_date).getTime();
    const deliveryTime = new Date(formData.order.delivery_date).getTime();
    if (deliveryTime < purchaseTime) {
      errors['order.delivery_date'] = 'Delivery date cannot be earlier than purchase date.';
    }
  }

  // --- Return Details ---
  if (!formData.return?.reason?.trim()) {
    errors['return.reason'] = 'Please select a return reason.';
  } else if (formData.return.reason === 'Other' && !formData.return?.additional_reason?.trim()) {
    errors['return.additional_reason'] = 'Please provide details for the custom return reason.';
  }

  if (!formData.return?.condition?.trim()) {
    errors['return.condition'] = 'Please select the product condition.';
  }

  if (!formData.return?.description?.trim()) {
    errors['return.description'] = 'Please describe the damage or issue.';
  } else if (formData.return.description.trim().length < 10) {
    errors['return.description'] = 'Please provide at least 10 characters describing the issue.';
  } else if (formData.return.description.length > 500) {
    errors['return.description'] = 'Damage description cannot exceed 500 characters.';
  }

  // --- Evidence Upload ---
  if (!formData.evidence || formData.evidence.length === 0) {
    errors['evidence'] = 'Please upload at least one damage image as evidence.';
  } else if (formData.evidence.length > MAX_IMAGE_COUNT) {
    errors['evidence'] = `You can upload a maximum of ${MAX_IMAGE_COUNT} images.`;
  }

  // --- Pickup Information ---
  if (!formData.pickup?.address?.trim()) {
    errors['pickup.address'] = 'Pickup address is required.';
  }

  if (!formData.pickup?.city?.trim()) {
    errors['pickup.city'] = 'City is required.';
  }

  if (!formData.pickup?.postal_code?.trim()) {
    errors['pickup.postal_code'] = 'Postal code is required.';
  } else if (formData.pickup.postal_code.trim().length < 3) {
    errors['pickup.postal_code'] = 'Please enter a valid postal code.';
  }

  if (!formData.pickup?.preferred_date) {
    errors['pickup.preferred_date'] = 'Preferred pickup date is required.';
  }

  return errors;
}

/**
 * Validates a single uploaded file before processing
 * @param {File} file 
 * @returns {string|null} Error string if invalid, otherwise null
 */
export function validateImageFile(file) {
  if (!file) return 'No file selected.';

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return `Invalid file type: ${file.name}. Only JPG, JPEG, PNG, and WEBP are supported.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return `File too large: ${file.name} (${sizeInMb} MB). Maximum allowed size is 10 MB.`;
  }

  return null;
}

/**
 * Format bytes to readable size string
 * @param {number} bytes 
 * @returns {string} e.g. "1.4 MB"
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
