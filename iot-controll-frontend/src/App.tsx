import { Route, Routes } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import PlaceholderPage from "./components/PlaceholderPage";
import NotFound from "./components/NotFound";
import SignInPage from "./features/auth/SignInPage";
import OverviewPage from "./features/overview/OverviewPage";

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
        <Route
          path="devices"
          element={<PlaceholderPage title="Devices" description="Robots and sensors connected to this system." />}
        />
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" description="Account and system preferences." />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
