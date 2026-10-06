/**
 * Finance and Real Estate Dimension Utilities
 * Ensures high precision for currency and land measurement (Acre/Kanal/Marla)
 */

/**
 * Calculates remaining balance ensuring no floating point errors
 * @param {number|string} total 
 * @param {number|string} paid 
 * @returns {number}
 */
export const calculateRemaining = (total, paid) => {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid) || 0;
  return Math.round((t - p) * 100) / 100;
};

/**
 * Converts land dimensions to total Marlas
 * Standard conversion: 1 Acre = 8 Kanals, 1 Kanal = 20 Marlas
 * @param {number} acre 
 * @param {number} kanal 
 * @param {number} marla 
 * @returns {number}
 */
export const toTotalMarlas = (acre = 0, kanal = 0, marla = 0) => {
  return (parseFloat(acre) || 0) * 160 + (parseFloat(kanal) || 0) * 20 + (parseFloat(marla) || 0);
};

/**
 * Formats a number as Pakistani Rupees
 * @param {number} amount 
 * @returns {string}
 */
export const formatPKR = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
};

/**
 * Determines balance status based on receivable and received amounts
 * @param {number} receivable 
 * @param {number} received 
 * @returns {'Clear'|'Partial'|'Overdue'}
 */
export const getBalanceStatus = (receivable, received) => {
  const remaining = calculateRemaining(receivable, received);
  if (remaining <= 0) return 'Clear';
  if (received > 0) return 'Partial';
  return 'Overdue';
};
