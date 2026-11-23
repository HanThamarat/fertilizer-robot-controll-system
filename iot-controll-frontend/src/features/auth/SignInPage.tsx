import { useEffect } from "react";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router";
import BrandMark from "../../components/BrandMark";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAuthError, signIn, type SignInPayload } from "./authSlice";
import "./signin.css";

const isMock = import.meta.env.VITE_AUTH_MOCK === "true";

const SignInPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  useEffect(() => {
    document.title = "Sign in · Fertilizer Robot Control";
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  if (user) return <Navigate to={from} replace />;

  const onFinish = async (values: SignInPayload) => {
    const result = await dispatch(signIn(values));
    if (signIn.fulfilled.match(result)) navigate(from, { replace: true });
  };

  return (
    <main className="signin">
      <div className="signin__column">
        <header className="signin__head">
          <BrandMark size={48} title="Fertilizer Robot Control" />
          <h1>Sign in to Fertilizer Robot</h1>
        </header>

        {error && (
          <Alert
            className="signin__flash"
            type="error"
            title={error}
            closable={{ onClose: () => dispatch(clearAuthError()) }}
          />
        )}

        <section className="signin__box">
          <Form<SignInPayload>
            layout="vertical"
            requiredMark={false}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            disabled={loading}
          >
            <Form.Item
              label="Email address"
              name="email"
              rules={[
                { required: true, message: "Enter your email address." },
                { type: "email", message: "That doesn't look like an email address." },
              ]}
            >
              <Input autoComplete="username" autoFocus inputMode="email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Enter your password." }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked" className="signin__remember">
              <Checkbox>Keep me signed in on this device</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </Form>
        </section>

        <section className="signin__box signin__box--secondary">
          New operator? Ask your system admin for an account.
        </section>

        {isMock && (
          <p className="signin__note">
            Demo sign-in is on: any email and password will work. Set{" "}
            <code>VITE_AUTH_MOCK=false</code> once the auth backend exists.
          </p>
        )}
      </div>
    </main>
  );
};

export default SignInPage;
