# QUICK ISSUES CHECKLIST
> Last updated: April 6, 2026 — Session 3 fixes applied.

---

## 🔴 CRITICAL (Fix Immediately)

### Backend Security & Integrity
- [x] ~~Remove 2 duplicate report route handlers~~ — **DONE** (prev session)
- [x] ~~Add input validation middleware to all API routes~~ — **DONE** (Zod schemas: login, booking, payment, transfer, user)
- [x] ~~Add JWT authentication middleware to /api/* endpoints~~ — **DONE** (verifyToken added to all 20+ unprotected routes)
- [x] ~~Fix CORS: restrict to known origin~~ — **DONE** (reads from FRONTEND_URL env var)
- [x] ~~Add rate limiting to /api/auth/login endpoint~~ — **DONE** (authLimiter: 100 req/15min)
- [x] ~~Move JWT_SECRET to .env file~~ — **DONE** (server crashes at startup if JWT_SECRET unset)
- [x] ~~Standardize error responses~~ — **DONE** (centralized errorHandler middleware, hides stack traces in prod)
- [x] ~~Remove janky /api/land-customers alias~~ — **DONE** (removed proxy redirect, real handler remains)

### Database
- [x] ~~Add .env.example file~~ — **DONE** (updated with all required vars + generation instructions)
- [x] ~~Change all Float currency fields to Decimal(10,2) in schema.prisma~~ — **DONE/DEFERRED** (Currency fields are already Decimal; SQLite lacks precision params support, deferred for Postgres migration)
- [x] ~~Add indexes on: email, customer_id, booking_id, property_id~~ — **DONE** (added missing plot_id and booking_id indexes to schema.prisma)
- [x] ~~Add cascade delete rules to foreign key relationships~~ — **DONE** (added onDelete: Cascade to Booking schema)

---

## 🟠 HIGH PRIORITY (This Sprint)

### Frontend
- [x] ~~Add form validation using react-hook-form + zod~~ — **DONE** (Refactored PlotForm, PaymentForm, and TransferForm)
- [x] ~~Add error boundary around app routes~~ — **DONE** (ErrorBoundary.jsx exists and wired in App.jsx)
- [x] ~~Add request cancellation (AbortController)~~ — **DONE** (Bookings, Customers, Visitors, UserManagement, TrialBalance fixed)
- [x] ~~Fix polling leak on logout~~ — **DONE** (App.jsx polling now guarded by isAuthenticated + proper dep array)
- [x] ~~Add pagination to customer/user/booking list endpoints~~ — **DONE** (server-side pagination on all list endpoints)

### Backend
- [x] ~~Add input sanitization/validation middleware~~ — **DONE** (Zod-based validation.js)
- [x] ~~Remove hardcoded dummy data fallbacks in chart endpoints~~ — **DONE** (updated recovery-health, bookings, customer-growth to use real DB aggregation)
- [x] ~~Add pagination params (?page, ?limit) to list endpoints~~ — **DONE**
- [ ] Implement fully consistent API response format `{ success, data, error }`

---

## 🟡 MEDIUM PRIORITY (Next Sprint)

### Code Quality
- [ ] Fix remaining lint warnings
- [ ] Extract duplicate password hashing logic to utility function
- [x] ~~Add request/response logging~~ — **DONE** (logger.js middleware wired in)

### Performance
- [ ] Code-split dashboard charts (reduce main bundle from 1.5MB)
- [ ] Memoize expensive components (DashboardChart, SkeletonTable)
- [ ] Plan migration from SQLite to PostgreSQL

### UX
- [ ] Add loading skeletons to slow-loading pages (most pages still use animate-pulse text)
- [ ] Add empty state messages to tables *(partially done — some pages have "No data found")*
- [ ] Add error collection/logging (e.g., Sentry)

---

## 🟢 NICE-TO-HAVE (Backlog)

- [ ] Add unit tests (start with auth, payments, reports)
- [ ] Migrate to TypeScript for type safety
- [ ] Move PDF generation to server-side
- [ ] Add API versioning (/api/v1/...)
- [ ] Add offline support with Service Worker
- [ ] Add Redis caching for reports/dashboard

---

## MIGRATION CHECKLIST

**Before Production Deployment:**

1. **Database**
   - [ ] Export SQLite data
   - [ ] Set up PostgreSQL instance (AWS RDS or self-hosted)
   - [ ] Update Prisma datasource to postgres
   - [ ] Run migrations
   - [ ] Verify data integrity

2. **Environment**
   - [x] ~~Create .env.example file~~ — **DONE**
   - [ ] Set NODE_ENV=production
   - [ ] Set JWT_SECRET (strong 64-char random string — see .env.example for command)
   - [x] ~~Set FRONTEND_URL for CORS~~ — **DONE**
   - [ ] Set DATABASE_URL (PostgreSQL connection string)

3. **Security**
   - [ ] Enable HTTPS
   - [ ] Set up SSL certificate (Let's Encrypt)
   - [ ] Configure security headers (Helmet)
   - [ ] Create WAF rules if using CloudFront

4. **Monitoring**
   - [ ] Set up error tracking (Sentry)
   - [ ] Set up performance monitoring (New Relic/DataDog)
   - [x] ~~Enable request logging~~ — **DONE** (logger.js)
   - [ ] Create CloudWatch alarms

5. **Scaling**
   - [ ] Load test with 1000+ users
   - [ ] Set up auto-scaling (if on AWS/Azure)
   - [ ] Configure CDN for static assets
   - [ ] Set up Redis cache layer
