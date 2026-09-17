# UrbanKart Admin Panel

Production-ready frontend admin panel scaffold aligned to the updated `projectdoc.txt`.

## Stack

- React
- TypeScript
- Material UI
- Redux Toolkit
- React Router
- Zod
- Static mock data through an API-ready service layer

## Implemented workflow

- Login-first experience
- Mock credentials from the project document
- Redux auth session
- Token persisted in `localStorage`
- Protected routes
- Role-based sidebar visibility
- Permission-based actions and page access
- Service-driven static data

## Roles

- Super Admin
- Admin
- Support Team
- Finance Team
- Legal Team

## Modules

- Authentication
- Dashboard
- User Management
- Role Management
- Property Management
- Property Verification
- Support Tickets
- Finance Management
- Legal Verification
- Reports
- Settings
- Audit Logs

## Run locally

1. `npm install`
2. `npm run dev`
3. `npm run build`

## Mock accounts

- `superadmin@urbankart.com` / `123456`
- `admin@urbankart.com` / `123456`
- `support@urbankart.com` / `123456`
- `finance@urbankart.com` / `123456`
- `legal@urbankart.com` / `123456`

## Folder map

- `src/app` store and typed hooks
- `src/components` common and layout components
- `src/modules` page modules
- `src/mock-data` static response data
- `src/services` API-ready mock services
- `src/routes` route protection and app router
- `src/types` shared interfaces
- `src/constants` permissions, navigation, storage
- `src/utils` permission helpers
