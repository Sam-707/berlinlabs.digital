# Runbook

## Generic sanity tests
- App boots without errors.
- Primary page renders expected content.
- One core action completes (create, update, or submit).
- Data reload reflects the change.
- Error state displays a human-readable message.

## Dubai MVP Pilot Tests

### Test 1: Restaurant Setup
1. Admin creates restaurant (currency: AED, tax: 5%)
2. Owner logs in with PIN
3. Owner adds 5 menu items via Inventory
4. Owner generates QR codes for tables 1-10
5. Owner prints QR codes

### Test 2: Customer Order to Payment
1. Customer scans table QR code
2. Customer adds 2 items to cart
3. Customer places order → receives handshake code
4. Order appears in Kitchen View
5. Owner marks order as "served"
6. Owner marks order as "paid" in Daily Summary

### Test 3: Daily Revenue Tracking
1. Owner opens Daily Summary view
2. Verifies today's order count and revenue
3. Filters to "Unpaid" orders
4. Marks remaining orders as paid
5. Verifies revenue updates to 100% paid

## Add project-specific tests
- List the key flows for this project.
- Add short, copy/paste steps under a new section.
- Keep each test under 5 steps.

