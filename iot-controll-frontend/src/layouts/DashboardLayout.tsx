import { useEffect, useState } from "react";
import { Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, type MenuProps } from "antd";
import { KeyOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import BrandMark from "../components/BrandMark";
import LinkStatus from "../components/LinkStatus";
import { isAuthMock, refreshMe, signOut } from "../features/auth/authSlice";
import ChangePasswordModal from "../features/auth/ChangePasswordModal";
import { useRealtimeLink } from "../features/connection/useRealtimeLink";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { findNavItem, NAV_ITEMS } from "./navItems";
import "./dashboard.css";

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  useRealtimeLink();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const screens = Grid.useBreakpoint();
  const isDesktop = !!screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  // Pick up role/name changes an admin made since this session signed in.
  useEffect(() => {
    if (!isAuthMock) dispatch(refreshMe());
  }, [dispatch]);

  const navItems = NAV_ITEMS.filter((i) => !i.adminOnly || user?.role === "admin");

  const current = findNavItem(pathname);

  const navMenu = (
    <Menu
      mode="inline"
      selectedKeys={[current.path]}
      items={navItems.map((i) => ({ key: i.path, icon: i.icon, label: <Link to={i.path}>{i.label}</Link> }))}
      onClick={() => setDrawerOpen(false)}
    />
  );

  const accountItems: MenuProps["items"] = [
    {
      key: "who",
      type: "group",
      label: (
        <span className="account-who">
          Signed in as <strong>{user?.email}</strong>
        </span>
      ),
    },
    { type: "divider" },
    { key: "password", icon: <KeyOutlined />, label: "Change password" },
    { key: "signout", icon: <LogoutOutlined />, label: "Sign out" },
  ];

  const onAccountClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "password") setPwOpen(true);
    if (key === "signout") {
      dispatch(signOut());
      navigate("/signin", { replace: true });
    }
  };

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <Layout className="shell">
      <Header className="shell__header">
        {!isDesktop && (
          <Button
            className="shell__menu-btn"
            icon={<MenuOutlined />}
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
          />
        )}
        <Link to="/" className="shell__brand" aria-label="Fertilizer Robot Control home">
          <BrandMark size={32} />
        </Link>
        <nav className="shell__crumbs" aria-label="Breadcrumb">
          {isDesktop && (
            <>
              <Link to="/">Fertilizer Robot</Link>
              <span className="shell__crumb-sep" aria-hidden>
                /
              </span>
            </>
          )}
          <strong aria-current="page">{current.label}</strong>
        </nav>
        <div className="shell__header-end">
          <LinkStatus compact={!screens.sm} live />
          <Dropdown
            menu={{ items: accountItems, onClick: onAccountClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button type="button" className="shell__avatar-btn" aria-label="Account menu">
              <Avatar size={32} className="shell__avatar">
                {initial}
              </Avatar>
            </button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {isDesktop && (
          <Sider width={248} className="shell__sider">
            {navMenu}
          </Sider>
        )}
        <Content className="shell__content">
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        open={!isDesktop && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        size={280}
        title={
          <span className="shell__drawer-title">
            <BrandMark size={24} /> Fertilizer Robot
          </span>
        }
        className="shell__drawer"
      >
        {navMenu}
      </Drawer>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </Layout>
  );
};

export default DashboardLayout;
