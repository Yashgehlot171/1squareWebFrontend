# API Integration Report

## 1. Reference Project Pattern

Reference project reviewed: `C:\Users\HZT\yashwork\Projects\hmcl_consultant_timesheet_ui\hmcl_consultant_timesheet_ui`

Pattern found:
- Central Axios instance in `src/redux/interceptor/axiosInstance.tsx`.
- Base URL and timeout loaded from environment/config.
- Token read from local storage through a storage helper.
- `Authorization` header attached in the request interceptor.
- Loader toggled from request/response interceptors through Redux.
- Response interceptor clears auth storage and redirects on unauthorized responses.
- RTK Query `apiSlice` wraps API calls with shared auth headers, loader handling, error handling, and refresh-token retry logic.
- Service files inject endpoint definitions instead of calling fetch/axios directly from screens.
- File upload uses `FormData`.
- Toast/snackbar-style messages are handled through common Redux message state.

## 2. Files Created/Updated

Created:
- `.env.example`
- `src/services/api/apiClient.ts`
- `src/services/api/config.ts`
- `src/services/api/endpoints.ts`
- `src/services/api/request.ts`
- `src/services/api/responseParser.ts`
- `src/services/api/tokenStorage.ts`
- `src/services/api/types.ts`
- `src/services/api/upload.ts`
- `src/services/profile.service.ts`
- `src/services/master.service.ts`
- `src/components/common/GlobalFeedback.tsx`
- `docs/API_INTEGRATION_REPORT.md`

Updated:
- `package.json`
- `package-lock.json`
- `src/app/store.ts`
- `src/main.tsx`
- `src/types/index.ts`
- `src/services/auth.service.ts`
- `src/modules/auth/LoginPage.tsx`
- `src/modules/profile/ProfilePage.tsx`

## 3. APIs Integrated

Auth:
- `POST /auth/otp/send`
- `POST /auth/otp/verify`
- `POST /admin/auth/login`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /auth/refresh-token`

Profile:
- `GET /users/me`
- `PATCH /users/me`
- `POST /users/me/avatar` helper prepared

Master:
- `GET /roles`
- `GET /roles/:id`
- `GET /permissions`

Common:
- API response parser for `{ success, message, data, errors, meta }`
- Token and refresh-token storage
- Authorization header interceptor
- 401 refresh-token retry
- Existing stored-session token fallback
- Refresh-token rotation updates persisted session tokens
- Global loader and error toast dispatch
- Upload helper using `FormData`
- Permission compatibility between backend legacy permission keys and frontend route constants

## 4. Remaining APIs Pending

- Property APIs
- Lead APIs
- Construction APIs
- Support ticket APIs
- Legal APIs
- Loan/finance APIs
- Notification APIs
- Dashboard/report APIs
- Password reset/change-password APIs, because matching backend routes are not present yet

## 5. Backend/Frontend Mismatches

- The requested `select role` API is not a standalone backend route. It is represented by `selectedRole` in `send OTP` and `verify OTP`.
- The requested `complete profile` API is not a standalone backend route. It maps to `PATCH /users/me`.
- The backend currently returns `success`, `message`, and `data`, but does not consistently include `meta.requestId` and `meta.timestamp`.
- Backend error responses do not currently include `meta`.
- File upload backend route for generic uploads is not present. Avatar update currently expects an avatar URL in the backend validator, so `profileService.updateAvatar` sends JSON. A generic `uploadFile` helper is prepared for future upload routes.
- Backend permissions currently use legacy keys such as `users.view`, while some frontend guards use newer keys such as `EMPLOYEE_VIEW`. The permission helper now supports both directions.
- The existing web login screen is email/password based, so it is wired to `POST /admin/auth/login`. OTP methods are available in `authService` for OTP screens when those are added.

## 6. Testing Steps

1. Create `.env` from `.env.example` if the backend URL differs.
2. Start backend on `http://localhost:5000`.
3. Start web app with `npm run dev`.
4. Login with a seeded backend admin account.
5. Confirm the request has `Authorization: Bearer <token>` after login.
6. Open Profile and confirm `GET /auth/session` and `GET /users/me` work.
7. Trigger logout and confirm local/session storage tokens are cleared.
8. Expire the access token and confirm `POST /auth/refresh-token` retries the original request.
9. Run `npm run build` before deployment.

Build verification completed:
- `npm run build` passed.

Recheck verification completed:
- Token fallback, refresh failure handling, refresh session persistence, avatar update behavior, and permission aliasing were rechecked and corrected.
- `npm run build` passed again after corrections.
