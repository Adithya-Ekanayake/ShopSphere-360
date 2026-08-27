# ShopSphere360 QA and Production Readiness Audit

Date: 2026-08-27
Scope: `server/src`, `client/src`, and `sql/database/schema`

## Executive Summary

The highest-risk SQL audit did not find user-controlled string-concatenated SQL in the controllers reviewed. Dynamic SQL fragments are fixed allowlisted clauses, and values use `?` placeholders. The main confirmed gaps are incomplete query validation, permissive pagination parsing, an error middleware mounted before protected routes, admin screens not using server-side pagination/search consistently, ambiguous filtered empty states, and a missing index for the recommendation sort/filter path.

## Inventory and Findings

### Backend controllers and routes

| Controller / route | Unparameterized SQL | Validation gap | try/catch | Notes |
|---|---|---|---|---|
| `authController.js` / `authRoutes.js` | None found | Login validation exists; unknown fields are not rejected | Yes | Auth writes are covered |
| `productController.js` / `productRoutes.js` | None found; search values parameterized | Controller age/number/range rules should match schema exactly | Yes | List supports page/limit/search |
| `customerController.js` / `customerRoutes.js` | None found; search values parameterized | Controller allows age 0-120 while schema/route allow 13-100 | Yes | List supports page/limit/search |
| `ordersController.js` / `ordersRoutes.js` | None found | List pagination/search parser is permissive | Yes | List supports page/limit/search |
| `transactionsController.js` / `transactionRoutes.js` | None found | Date/filter query validation and pagination are incomplete | Yes | Fixed `LIMIT 500` |
| `analyticsController.js` / `analyticsRoutes.js` | None found | Filter query validation should be centralized | Yes | Protected at server mount |
| `salesController.js` / `salesRoutes.js` | None found | Filter query validation should be centralized | Yes | Protected at server mount |
| `reportsController.js` / `reportsRoutes.js` | None found | `startDate`/`endDate` only checked for presence; invalid, partial, and reversed ranges accepted | Yes | Five report endpoints |
| `predictionController.js` / `predictionRoutes.js` | None found | `horizon`/`limit` use permissive `parseInt`, are ignored, and hard-coded limits remain | Yes | Query contract is misleading |
| `insightsController.js` / `insightsRoutes.js` | None found | Query validation should reject unsupported values consistently | Yes | Read-only insights |
| `recommendationsController.js` / `recommendationsRoutes.js` | None found; dynamic fields are allowlisted | Known fields validated, unknown query/body fields accepted | Yes | List supports filters but frontend lacks complete paging/search |
| `exportController.js` / `exportRoutes.js` | None found | Export query params need the same date/filter validation contract | Yes | Export is destructive to resources only in output volume |

All controller handlers inspected have local `try/catch`. Central middleware remains necessary for async/middleware failures and must be mounted last. Production responses must remain generic and development responses must not expose raw DB errors or stack traces.

### Frontend pages

| Page | Loading | Error | Empty | Search/no-result distinction | Raw `confirm()` |
|---|---|---|---|---|---|
| `Dashboard.tsx` | Yes | Yes | Yes | N/A | None |
| `Analytics.tsx` | Yes | Yes | Yes | Partial | None |
| `AdvancedAnalytics.tsx` | Yes | Yes | Yes | N/A | None |
| `Sales.tsx` | Yes | Yes | Yes | Generic filtered empty text | None |
| `SalesOverview.tsx` | Yes | Yes | Yes | Generic filtered empty text | None |
| `Transactions.tsx` | Yes | Yes | Yes | No server search/paging | None |
| `CustomersAdmin.tsx` | Yes | Yes | Yes | No: local filtering over first API page | None; shared `ConfirmDialog.tsx` used |
| `ProductsAdmin.tsx` | Yes | Yes | Yes | No: local filtering over first API page | None; shared `ConfirmDialog.tsx` used |
| `Orders.tsx` | Yes | Yes | Yes | No: local filtering over first API page | None |
| `Recommendations.tsx` | Yes | Yes | Yes | No: filtered empty is indistinguishable | None |
| `Insights.tsx` | Yes | Yes | Yes | N/A | None |
| `Predictions.tsx` | Yes | Yes | Yes | N/A | None |
| `Reports.tsx` | N/A (static library) | N/A | Yes | Category-empty state is valid | None |
| `Login.tsx` | Form state | Auth error | N/A | N/A | None |

### Admin list endpoint coverage

| Endpoint | Current backend | Audit action |
|---|---|---|
| `GET /customers` | `page`, `limit`, `search` | Wire frontend controls to server query and metadata |
| `GET /products` | `page`, `limit`, `search` | Wire frontend controls to server query and metadata |
| `GET /orders` | `page`, `limit`, `search` | Wire frontend controls to server query and metadata |
| `GET /recommendations` | `page`, `limit`, `status`, `priority`, `category`, `search` | Add frontend search/pagination |
| `GET /transactions` | Fixed `LIMIT 500` | Validate filters; add bounded pagination/search where UI contract permits |
| Marketing, Returns, Support, Users | No dedicated list controller/route found in this repository | No implementation exists to audit or change; document as an API coverage gap |

## SQL and Performance Findings

- Search clauses in customers, products, orders, and recommendations use parameterized values, but leading-wildcard `LIKE` prevents ordinary B-tree index use and wildcard characters are not escaped.
- Recommendation list sorting/filtering uses `UpdatedAt` and status/priority/category paths without a matching composite index in `06_create_recommendations.sql`.
- Forecast product-demand grouping/order would benefit from a composite `(ForecastType, ProductKey, PeriodLabel)` index if query volume warrants it.
- Recommendation synchronization performs sequential inserts in a loop; this is a confirmed N+1-style write pattern.
- Order detail uses a fixed number of queries, not N+1.
- The MySQL pool has `waitForConnections: true`, `connectionLimit: 10`, and `queueLimit: 0`; this is sensible for a small deployment, but should be environment-configurable for production.
- Existing foreign-key indexes in `04_create_indexes.sql` cover the reviewed fact-table joins.

## Confirmed Non-Findings

- No raw browser `confirm()` calls were found. Destructive customer/product actions already use the shared `ConfirmDialog.tsx`.
- No direct user-controlled SQL identifier interpolation was found. Dynamic fragments are fixed strings or internal allowlists.
- Every inspected controller has a local `try/catch`.

## Fix Order

1. Validate report/export/filter/pagination inputs and align controller checks with database constraints.
2. Move centralized error handling to the final middleware position and sanitize error responses.
3. Wire admin list pages to server-side search/pagination and reuse `Pagination.tsx`.
4. Clarify filtered empty states and review responsive tables/forms/charts.
5. Add only justified indexes and reduce sequential recommendation writes; make pool sizing configurable.

## Implemented In This Pass

- Added strict express-validator middleware for report dates, export filters, prediction parameters, and recommendation allowlists.
- Applied report and prediction validation at their routes; prediction horizon and result limit now affect the query/result.
- Moved the centralized error handler after all API routes.
- Corrected customer age controller validation to the schema range of 13-100.
- Added server-side search and shared `Pagination.tsx` usage to customer and product admin pages.
- Added server-side recommendation search and shared pagination, with filtered-empty messaging.
- Added responsive styling for recommendation search/cards.
- Added recommendation `UpdatedByUserKey` audit persistence and a schema migration with recommendation sort indexes.
- Made MySQL `connectionLimit` configurable via `DB_CONNECTION_LIMIT` with a default of 10.

## Remaining Follow-up

- Orders and Transactions frontend screens still use local filtering/pagination and should be migrated to the server metadata contract.
- Marketing, Returns, Support, and Users admin list endpoints are not present in this repository, so their requested pagination cannot be implemented without adding those API surfaces.
- Recommendation synchronization still inserts rows sequentially; a transaction/bulk insert is the next performance improvement.
- Existing repository-wide frontend lint failures remain in unrelated files and in pre-existing effect patterns; the touched files have no VS Code diagnostics and the TypeScript production build passes.
