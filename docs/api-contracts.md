# UrbanKart Mock Service Contracts

All frontend data is sourced from mock service functions that return API-shaped envelopes:

```json
{
  "status": "success",
  "meta": {
    "requestId": "req_xxx",
    "timestamp": "2026-06-08T00:00:00.000Z"
  },
  "data": {}
}
```

## Service layer

- `auth.service.ts`
- `user.service.ts`
- `role.service.ts`
- `property.service.ts`
- `ticket.service.ts`
- `finance.service.ts`
- `legal.service.ts`
- `report.service.ts`
- `audit.service.ts`

## Backend integration strategy

When real APIs are added later, the intended replacement point is the service layer only.

## Mock data sources

- `users.mock.ts`
- `roles.mock.ts`
- `properties.mock.ts`
- `tickets.mock.ts`
- `finance.mock.ts`
- `legal.mock.ts`
- `reports.mock.ts`
- `audit.mock.ts`
