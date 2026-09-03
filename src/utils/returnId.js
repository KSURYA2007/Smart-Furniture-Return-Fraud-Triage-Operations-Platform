/**
 * Return ID Generator Utility
 * Generates unique return identifiers in the format: RET-YYYY-XXXXXX
 * Example: RET-2026-004821
 */
export function generateReturnId() {
  const currentYear = new Date().getFullYear();
  // Generate a random 6-digit number formatted with leading zeros
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RET-${currentYear}-${randomNum}`;
}

/**
 * Validates whether a return ID matches the standard format
 * @param {string} returnId 
 * @returns {boolean}
 */
export function isValidReturnId(returnId) {
  if (!returnId || typeof returnId !== 'string') return false;
  const regex = /^RET-\d{4}-\d{6}$/;
  return regex.test(returnId);
}
