/**
 * Input Validation Middleware utilizing Zod
 */
const { z } = require('zod');

// Basic XSS Sanitization helper
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 255);
};

// Generic express middleware wrapper for zod schemas
const validateSchema = (schema) => (req, res, next) => {
  try {
    // Parse constraints and assign sanitized outcome back exactly the same way
    req.validated = schema.parse(req.body);
    next();
  } catch (err) {
    const firstError = err.errors[0];
    return res.status(400).json({ error: firstError ? firstError.message : 'Validation failed' });
  }
};

const createUserSchema = z.object({
  name: z.string().min(2, "Valid name (min 2 chars) required").transform(sanitizeString),
  email: z.string().email("Valid email required").toLowerCase(),
  role: z.string().min(1, "Valid role required").transform(sanitizeString),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal(''))
}).passthrough();

const createBookingSchema = z.object({
  customer_id: z.union([z.string(), z.number()]).transform(Number),
  property_id: z.union([z.string(), z.number()]).transform(Number),
  rate: z.coerce.number().nonnegative("Valid rate (non-negative number) required"),
  total: z.coerce.number().positive("Valid total (positive number) required"),
  advance: z.coerce.number().nonnegative("Valid advance (0 to total) required")
}).passthrough().refine(data => data.advance <= data.total, {
  message: "Valid advance (0 to total) required",
  path: ["advance"]
});

const paymentSchema = z.object({
  account_id: z.union([z.string(), z.number()]).transform(Number).refine(val => !isNaN(val) && val > 0, "Valid account_id required"),
  debit: z.coerce.number().nonnegative("Amounts cannot be negative").default(0),
  credit: z.coerce.number().nonnegative("Amounts cannot be negative").default(0),
  description: z.string().optional().default('').transform(sanitizeString),
  category: z.string().optional().default('Operating').transform(sanitizeString)
}).passthrough().refine(data => {
  const hasDebit = data.debit > 0;
  const hasCredit = data.credit > 0;
  // Must have strictly one, but not both/neither
  return hasDebit !== hasCredit;
}, {
  message: "Provide strictly either a debit OR a credit amount, not both or neither.",
  path: ["debit"]
});

const transferSchema = z.object({
  from_account_id: z.union([z.string(), z.number()]),
  to_account_id: z.union([z.string(), z.number()]),
  amount: z.coerce.number().positive("Valid amount (positive number) required"),
  description: z.string().optional().default('').transform(sanitizeString)
}).passthrough().refine(data => data.from_account_id !== data.to_account_id, {
  message: "Source and destination accounts must differ",
  path: ["to_account_id"]
});

const loginSchema = z.object({
  email: z.string().email("Valid email required").toLowerCase(),
  password: z.string().min(1, "Password required")
}).passthrough();

module.exports = {
  validateCreateUser: validateSchema(createUserSchema),
  validateCreateBooking: validateSchema(createBookingSchema),
  validatePayment: validateSchema(paymentSchema),
  validateTransfer: validateSchema(transferSchema),
  validateLogin: validateSchema(loginSchema)
};
