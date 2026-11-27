import { Route, Routes } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import NotFound from "./components/NotFound";
import SignInPage from "./features/auth/SignInPage";
import OverviewPage from "./features/overview/OverviewPage";
import ControllerPage from "./features/controller/ControllerPage";
import UsersPage from "./features/users/UsersPage";
import RequireAdmin from "./components/RequireAdmin";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="controller" element={<ControllerPage />} />
        <Route
          path="users"
          element={
            <RequireAdmin>
              <UsersPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
