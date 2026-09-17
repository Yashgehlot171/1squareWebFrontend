import type { AuditRecord, SettingsSection } from "../types";

export const auditLogsMock: AuditRecord[] = [
  { id: "aud_9001", user: "Raman Nair", action: "Login", module: "Authentication", date: "2026-06-08 08:30", ipAddress: "103.44.21.10" },
  { id: "aud_9002", user: "Anjali Sethi", action: "User Updated", module: "User Management", date: "2026-06-08 09:15", ipAddress: "103.44.21.22" },
  { id: "aud_9003", user: "Arvind Raj", action: "Payment Refunded", module: "Finance", date: "2026-06-08 10:05", ipAddress: "103.44.21.31" },
  { id: "aud_9004", user: "Sonia Mehta", action: "Legal Verification Approved", module: "Legal", date: "2026-06-08 11:40", ipAddress: "103.44.21.41" },
];

export const settingsMock: SettingsSection[] = [
  { key: "general", title: "General Settings", description: "Brand, timezone, localization, and default operational preferences." },
  { key: "payment", title: "Payment Settings", description: "Gateway keys, invoice numbering, refund controls, and settlement rules." },
  { key: "notification", title: "Notification Settings", description: "Email, SMS, and in-app notification templates and toggles." },
  { key: "security", title: "Security Settings", description: "Password rules, session duration, MFA defaults, and trusted IP policy." },
];
