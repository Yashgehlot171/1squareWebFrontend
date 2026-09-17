# UrbanKart Admin Blueprint

## Scope

This repo now follows the updated admin-panel-only specification from `projectdoc.txt`.

## Included modules

1. Authentication
2. Dashboard
3. User Management
4. Role and Permission Management
5. Property Management
6. Property Verification
7. Support Tickets
8. Finance Management
9. Legal Verification
10. Reports
11. Settings
12. Audit Logs

## Core behavior

- Unauthenticated users land on the login page
- Sessions are stored in Redux and mirrored to `localStorage`
- Routes are protected
- Sidebar items are permission-based
- Buttons and page actions are role-aware
- Static data is fetched from service functions only

## Roles

- Super Admin
- Admin
- Support Team
- Finance Team
- Legal Team

## UI structure

- Left sidebar
- Top header
- Breadcrumbs
- Page titles
- Data tables
- Filters
- Forms
- Detail pages
- Role-based dashboards
