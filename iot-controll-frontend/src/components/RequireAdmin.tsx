import type { ReactNode } from "react";
import { LockOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";

/** Shows a "no access" message instead of the page for non-admins. The API enforces this too. */
const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (role === "admin") return <>{children}</>;
  return (
    <div className="page">
      <div className="box box__blank">
        <LockOutlined />
        <h3>Admins only</h3>
        <p>
          Your account can't manage users. Ask an admin if you need access. <Link to="/">Go to Overview</Link>
        </p>
      </div>
    </div>
  );
};

export default RequireAdmin;
