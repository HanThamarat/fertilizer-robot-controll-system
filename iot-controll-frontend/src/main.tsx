import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { App as AntApp, ConfigProvider } from "antd";
import { store } from "./store";
import { appTheme } from "./theme";
import "./index.css";
import App from "./App.tsx";
import { setUnauthorizedHandler } from "./api/axiosClient";
import { signOut } from "./features/auth/authSlice";

setUnauthorizedHandler(() => store.dispatch(signOut()));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={appTheme}>
        <AntApp>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
);
