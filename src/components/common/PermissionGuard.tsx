import type { ReactNode } from "react";
import { useAppSelector } from "../../app/hooks";
import type { Permission } from "../../types";
import { hasPermission } from "../../utils/permissions";

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const user = useAppSelector((state) => state.auth.user);
  if (!user || !hasPermission(user.permissions, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
