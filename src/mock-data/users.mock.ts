import { rolesMock } from "./roles.mock";
import type { AuthUser, UserRecord } from "../types";

export const loginUsersMock: Array<AuthUser & { password: string }> = [
  {
    id: "1",
    name: "Super Admin",
    email: "admin@example.com",
    mobile: "9999999999",
    role: "SUPER_ADMIN",
    roleLabel: "Super Admin",
    permissions: rolesMock[0].permissions,
    status: "active",
    tokenExpiresAt: "2099-12-31T23:59:59.000Z",
    lastLogin: "2026-06-26T09:15:00Z",
    password: "123456",
  },
  {
    id: "2",
    name: "Aarav Sharma",
    email: "admin@1squareproperty.com",
    mobile: "9999999998",
    role: "ADMIN",
    roleLabel: "Admin",
    permissions: rolesMock[1].permissions,
    status: "active",
    tokenExpiresAt: "2099-12-31T23:59:59.000Z",
    lastLogin: "2026-06-26T08:45:00Z",
    password: "123456",
  },
  {
    id: "3",
    name: "Priya Mehta",
    email: "support@1squareproperty.com",
    mobile: "9999999997",
    role: "SUPPORT_TEAM",
    roleLabel: "Support Team",
    permissions: rolesMock[2].permissions,
    status: "active",
    tokenExpiresAt: "2099-12-31T23:59:59.000Z",
    lastLogin: "2026-06-26T08:30:00Z",
    password: "123456",
  },
  {
    id: "4",
    name: "Inactive Admin",
    email: "inactive@1squareproperty.com",
    mobile: "9999999996",
    role: "ADMIN",
    roleLabel: "Admin",
    permissions: rolesMock[1].permissions,
    status: "suspended",
    tokenExpiresAt: "2099-12-31T23:59:59.000Z",
    lastLogin: "2026-06-20T08:30:00Z",
    password: "123456",
  },
];

export const usersMock: UserRecord[] = [
  { id: "1", name: "Super Admin", email: "admin@example.com", mobile: "9999999999", role: "SUPER_ADMIN", roleLabel: "Super Admin", status: "active", createdDate: "2026-01-01", lastLogin: "2026-06-26 14:45" },
  { id: "2", name: "Aarav Sharma", email: "admin@1squareproperty.com", mobile: "9999999998", role: "ADMIN", roleLabel: "Admin", status: "active", createdDate: "2026-02-14", lastLogin: "2026-06-26 14:15" },
  { id: "3", name: "Priya Mehta", email: "support@1squareproperty.com", mobile: "9999999997", role: "SUPPORT_TEAM", roleLabel: "Support Team", status: "active", createdDate: "2026-03-02", lastLogin: "2026-06-26 14:00" },
  { id: "4", name: "Inactive Admin", email: "inactive@1squareproperty.com", mobile: "9999999996", role: "ADMIN", roleLabel: "Admin", status: "suspended", createdDate: "2026-04-18", lastLogin: "2026-06-20 09:30" },
];
