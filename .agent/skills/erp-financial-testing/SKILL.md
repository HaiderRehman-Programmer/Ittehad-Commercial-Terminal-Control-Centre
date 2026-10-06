---
name: erp-financial-testing
description: Custom protocol for implementing and testing double-entry accounting logic and financial endpoints in the Real Estate ERP.
version: 1.0.0
---

# 🧪 ERP Financial Testing Protocol

> **PURPOSE:** This skill is focused on writing, defining, and auditing tests for the Real Estate ERP. Financial software is highly sensitive, so tests must be rigorous and cover system edge cases.

When asked to write tests, create test cases, or ensure code reliability, apply these guidelines:

## 1. 🛡️ The "Triple A" Structure for ERP
For every endpoint or component tested, strict **Arrange, Act, Assert** must be used.

**Focus on Data Setup (Arrange):**
Testing financial apps requires exact fixture data. 
- You MUST seed a mock `Customer` and a `Property`.
- You MUST simulate an existing `Booking` before testing an `Installment` payment.

## 2. 🧮 Financial Constraints to Test (The Assertions)
Whenever you write testing logic or analyze a reporting pipeline (like `CashFlowStatement` or `IncomeStatement`), ensure you test for these constraints:

*   **Zero-Sum Principle:** If you test the creation of a `PendingPayment` or `TransferRequest`, ensure that if the API deducts funds from `Wallet`, it explicitly credits the recipient. *If funds disappear into the void, the test must catch it.*
*   **Overpayment Block:** Writing tests checking what happens if a user submits a payload where `Installment.paid_amount > Installment.amount`. It must throw a `400 Bad Request`.
*   **Precision Loss Testing:** Testing boundary cases with floating/Decimal inputs (e.g. `10.9999` sent) to see if Zod strips it down cleanly.

## 3. 🚦 API Contract Checking
Any route test must strictly check the standard JSON shape. You must assume the application expects:
```json
{
  "success": true | false,
  "data": { ... } | null,
  "pagination": { "page": 1, "total": 10 } | null,
  "error": "Message" | null
}
```
If a route returns a raw array (`[]`), the test should flag it as an integration failure constraint since it breaks the frontend `useFetch` design logic.

## 4. 🎭 Role-Based E2E Testing Scenarios
Automated tests or testing strategies must consider the `role` enum (`Super Admin`, `Admin`, `Agent`, `Viewer`).
- Ensure attempting to call `DELETE /api/bookings/:id` as `Viewer` returns `403 Forbidden`.
- Check that the `Income Statement` only calculates `Transactions` related to operational and capital inputs, omitting cross-wallet transfers.
