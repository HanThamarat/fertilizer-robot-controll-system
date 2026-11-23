import { HomeOutlined, RobotOutlined, SettingOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview", icon: <HomeOutlined /> },
  { path: "/devices", label: "Devices", icon: <RobotOutlined /> },
  { path: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

export const findNavItem = (pathname: string) =>
  NAV_ITEMS.find((i) => (i.path === "/" ? pathname === "/" : pathname.startsWith(i.path))) ?? NAV_ITEMS[0];
