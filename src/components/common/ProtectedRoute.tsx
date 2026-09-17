import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { Loader } from "./Loader";

export function ProtectedRoute() {
  const { token, user, initialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <Loader />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.status !== "active") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
