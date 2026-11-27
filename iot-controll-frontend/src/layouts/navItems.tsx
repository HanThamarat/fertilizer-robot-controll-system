import { ControlOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  /** Only shown to admins */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview", icon: <HomeOutlined /> },
  { path: "/controller", label: "Controller", icon: <ControlOutlined /> },
  { path: "/users", label: "Users", icon: <TeamOutlined />, adminOnly: true },
];

export const findNavItem = (pathname: string) =>
  NAV_ITEMS.find((i) => (i.path === "/" ? pathname === "/" : pathname.startsWith(i.path))) ?? NAV_ITEMS[0];
