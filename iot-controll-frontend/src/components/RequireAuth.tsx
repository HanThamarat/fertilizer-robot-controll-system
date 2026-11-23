import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../store/hooks";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

export default RequireAuth;
