# ShopSphere360 Security and Quality Audit

Date: 2026-08-27

## Inventory

### Backend controllers and routes

- `authController.js`: `POST /api/auth/login`, `GET /api/auth/me`
- `productController.js`: product list/detail/create/update/delete
- `customerController.js`: customer list/detail/create/update/delete
- `ordersController.js`: order KPIs/list/detail
- `salesController.js`: sales KPIs/monthly/channels/recent orders
- `transactionsController.js`: transaction KPIs/list/methods
- `analyticsController.js`: existing analytics and Phase 5 endpoints
- `predictionController.js`: forecast endpoints
- `reportsController.js`: report endpoints
- `insightsController.js`: rule-based insights
- `recommendationsController.js`: list/sync/status update
- `exportController.js`: CSV/Excel/PDF exports

Routes are defined under `server/src/routes/` and protected per route. Product/customer/recommendation writes correctly use Admin/Manager role middleware. Orders and transaction list routes currently rely on router-level protection.

### Frontend pages

`Login`, `Dashboard`, `ProductsAdmin`, `CustomersAdmin`, `SalesOverview`, `Orders`, `Transactions`, `Analytics`, `Reports`, `Predictions`, `AdvancedAnalytics`, `Insights`, and `Recommendations`.

## Findings

### SQL construction

No confirmed user-controlled SQL injection was found in the current controllers. Existing value inputs use `?` placeholders. Dynamic SQL fragments are currently sourced from internal constants or the shared filter helper.

Hardening requirement: preserve this invariant. Dataset/view names, sort fields, update columns, and report types must remain allow-listed constants and never come directly from request input.

### Validation

`authController.js` only checks login truthiness. Product/customer writes do not consistently validate string types, lengths, finite numbers, dates, enum values, or positive route keys. Recommendation route keys are not validated. The shared filter helper validates date syntax and numeric keys but does not validate date ordering or text enum values.

Chosen validation library: `express-validator`, applied through reusable route middleware.

Required coverage:

- Login identifier/password types and lengths.
- Product/customer payload fields and database CHECK-compatible age/price ranges.
- Positive numeric route keys and recommendation assignees.
- All Phase 4 filter keys, date ordering, enum values, pagination values, export dataset/report type values.

### Centralized errors

Controllers generally use `try/catch`, but there is no final centralized error middleware. Raw database errors could be logged and accidental uncaught errors could reach Express defaults. Add a final `errorHandler.js` that returns detailed messages only in development and a generic message in production.

### Pagination and search

Missing server-side `page`, `limit`, and `search` support on Products, Customers, Orders, Marketing, Returns, Support, Recommendations, and Users. Products/customers/orders currently load broad datasets and filter/paginate in the browser. There is no Users API route/controller in the current inventory; this audit records it as a gap rather than inventing an endpoint without an existing user-management surface.

Add one reusable backend pagination parser and one frontend `Pagination.tsx` component. Admin list responses should include `{ data, pagination }`.

### Confirm dialogs

Raw browser confirmation exists in:

- `client/src/pages/ProductsAdmin.tsx`
- `client/src/pages/CustomersAdmin.tsx`

Replace both with one shared `ConfirmDialog.tsx`.

### Loading/error/empty states

Most data pages and charts have states. Gaps include Dashboard KPI no-data distinction, Reports having no fetch state because its report catalog is static, Sales channel empty state, and FilterContext not exposing filter-option errors. New pagination/search states must distinguish no data from no search results.

### Responsive behavior

Existing CSS has desktop/tablet/mobile breakpoints, but newly paginated tables, filter controls, export controls, and confirmation dialogs need to use horizontal overflow or stacked layouts at small widths.

### Performance and indexes

The pool has `connectionLimit: 10`, `waitForConnections: true`, and unlimited queueing. This is serviceable for the local app but should add connection/acquire timeouts and bounded queueing for production safety.

Existing `04_create_indexes.sql` covers most foreign keys. Useful gaps are status/search indexes on orders/support/recommendations, recommendation ordering, and composite order/date access paths. Add only indexes justified by new server-side filtering and pagination.

Recommendation sync currently performs one insert per insight. Replace with a transaction and duplicate-safe checks or batched inserts.

### Audit trail

Recommendations have CreatedAt/UpdatedAt but no UpdatedByUserKey. Product/customer tables do not have audit timestamps or updater attribution. Add `UpdatedByUserKey` to recommendations, products, and customers through additive migrations and populate it from `req.user.UserKey` on meaningful writes. Existing fact tables are analytical data and should not be retrofitted without an ingestion ownership decision.

## Fix order

1. SQL safety and validation.
2. Centralized error handling.
3. Pagination/search.
4. Shared confirmation and UI state components.
5. Responsive/performance/index improvements.
6. Audit attribution.
