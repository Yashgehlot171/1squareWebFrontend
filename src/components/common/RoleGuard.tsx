import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import type { RoleCode } from "../../types";

interface RoleGuardProps {
  allowedRoles: RoleCode[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
