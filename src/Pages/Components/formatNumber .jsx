/**
 * Format a number with thousands separators and fixed decimal places
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with commas and proper decimal places
 */
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '';

  // Convert to a valid number
  const num = Number(value);
  if (isNaN(num)) return '';

  // Format with commas and decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Parse a formatted number string back to a clean number string (preserving decimals)
 * @param {string} value - Formatted number as string
 * @returns {string} Clean number string (to preserve decimal precision)
 */
const parseFormattedNumber = (value) => {
  if (!value) return '';
  // Remove commas
  let numStr = value.replace(/,/g, '');

  // Ensure it's a valid number
  return isNaN(numStr) ? '' : numStr;
};

// Export functions
export { formatNumber, parseFormattedNumber };
