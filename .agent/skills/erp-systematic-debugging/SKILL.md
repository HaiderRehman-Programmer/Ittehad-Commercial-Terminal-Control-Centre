---
name: erp-systematic-debugging
description: Custom protocol for debugging the Ittehad Commercial Centre Real Estate ERP. Outlines how to trace financial, relational, and frontend state bugs.
version: 1.0.0
---

# 🕵️ ERP Systematic Debugging Protocol

> **PURPOSE:** This skill is built specifically for interpreting and solving issues inside the Real Estate ERP application. It specializes in full-stack debugging across the Node/Express backend and React frontend.

When the user asks you to "debug", "troubleshoot", or "fix" an issue in this project, you MUST use the following methodology:

## 1. 🛑 Phase 1: Context Isolation
Do not guess. First, isolate bounded layers:
- **Is it a UI Data Race?** Check `useEffect` dependencies, `useFetch` abort controllers, or missing cleanup functions.
- **Is it an Auth/Access Error?** Check if the route is missing the `verifyToken` middleware, missing `Authorization: Bearer <token>` in the interceptor, or failing `checkRole(['Super Admin'])` RBAC validation.
- **Is it a Database Schema mismatch?** Verify the frontend payload against `Prisma` models and `Zod` schemas located in `/server/middleware/validation.js`.

## 2. 🗃️ Phase 2: Double-Entry Financial Consistency
If the bug relates to balances, reports, payments, or ledger issues:
1. **Always Check the Ledger:** Any manual wallet/payment change MUST write corresponding `Transaction` rows. The golden rule is: `SUM(Asset + Expense) = SUM(Liability + Equity + Income)`. 
2. **Datatype Mismatches:** SQLite does not natively support `Decimal(10,2)` parameters, meaning JS native math might cause floating-point truncation. If you suspect missing cents, check how Prisma parses `Decimal`.
3. **Relation Tracing:** Does resolving an `Installment` correctly update the parent `Booking` status? Does it deduct from the `Customer.receivable`? Check if the database logic performs all updates transactionally (`prisma.$transaction`).

## 3. 🔍 Phase 3: The "Frontend Trap" Audit
Many bugs in this ERP stem from UI inconsistencies. When inspecting React code, actively look for:
- **Form Data extraction:** Using raw `e.target.value` without checking the `type` logic. (Are we writing strings to a database field expecting numbers?)
- **Render loops:** Infinite loaders due to missing data shapes (e.g. mapping over `res.data` instead of `res.data.data` because of API pagination wrapping!).
- **Error Swallowing:** Are API errors (`err.response.data.error`) correctly extracted from the Axios interceptor and pushed to `react-hot-toast`, or are they swallowed?

## 4. 📝 Phase 4: Remediation Format
When you present a fix, format your response as follows:
1. **Root Cause Analysis (RCA)**: Explain *why* it failed briefly.
2. **Schema/API impact**: Acknowledge if the change needs a schema update or affects other routes.
3. **Implementation**: Provide the code.
4. **Verification**: How the user can verify it (e. g. "Check the Trial Balance to see if credits shifted").
