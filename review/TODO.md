# TODO: Enforce Pending Company Approval Logic

## Requirements
1. When a user suggests a company, it should go into "pending" status. ✅
2. Admin can only VIEW the company details in pending state. ✅
3. Admin must APPROVE the company before:
   - It appears in the main company list ✅
   - Users can review or rate it ✅
4. Admin should NOT be able to review or rate a company before approval. ✅

## Changes Made

### Server-Side

1. **`review/server/src/companies/company.routes.js`** ✅
   - Added `protect` middleware to `GET /:id` route

2. **`review/server/src/companies/company.controller.js`** — `getCompanyById` ✅
   - Added check: if company is pending and user is not admin → return `403 Forbidden`
   - Admin can still view pending company details

3. **`review/server/src/reviews/review.controller.js`** — `createReview` ✅
   - Added company approval check before creating review
   - Returns `400` if company is not approved
   - Applies to ALL users including admins

4. **`review/server/src/reviews/review.controller.js`** — `updateReview` ✅
   - Added company approval check before updating review
   - Returns `400` if company is not approved

### Client-Side

5. **`review/client/src/pages/SuggestCompany.tsx`** ✅
   - Fixed API endpoint from `/api/companies/suggest` → `/api/companies`
   - Updated form fields to match server model (`address`, `typeId`, `description`, `phoneNumber`, `email`)
   - Fetches types dynamically from `/api/types`
   - Uses `FormData` to support image upload
   - Shows pending approval notice

6. **`review/client/src/pages/Company/CompanyDetail.tsx`** ✅
   - Shows **"Pending Admin Approval"** banner when `company.isApproved === false`
   - **Hides the review form** when company is not approved (for both users and admins)
   - Shows "Reviews Disabled" message with clock icon instead of form

## How It Works

1. **User suggests a company** → `POST /api/companies` with `isApproved: false` (server already had this logic)
2. **Company appears in pending list** → Admin can view at `/admin/dashboard` under "Pending Approval" tab
3. **Non-admin tries to view pending company** → Gets `403 Forbidden` from server
4. **Anyone tries to review pending company** → Gets `400 Company must be approved before reviewing`
5. **Admin approves company** → `PATCH /api/companies/approve/:id` sets `isApproved: true`
6. **Approved company** → Appears in main list, reviews enabled

## Pre-existing TypeScript Errors (not caused by these changes)
- `useAuth()` return type issue
- `ReviewCard` and `ReviewForm` prop type mismatches

