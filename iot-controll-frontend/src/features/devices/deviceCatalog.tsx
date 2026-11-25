import {
  CarOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  InboxOutlined,
  PoweroffOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

/** Raw value a sensor channel reports over the realtime link. */
export type SensorValue = number | boolean | string;

export interface DeviceSpec {
  /** Stable id; the backend uses it as `deviceId` in `sensor:reading` events. */
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  channels: number;
  /** Turns a raw reading into the short text shown in a channel cell. */
  format: (v: SensorValue) => string;
}

/** true/false or 1/0 from the ESP32. */
const onOff = (on: string, off: string) => (v: SensorValue) =>
  typeof v === "boolean" || v === 0 || v === 1 ? (v ? on : off) : String(v);

const percent = (v: SensorValue) =>
  typeof v === "number" ? `${Math.round(v)}%` : String(v);

const amount = (v: SensorValue) =>
  typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(v);

/** IoT sensors mounted on the fertilizer robot. */
export const DEVICES: DeviceSpec[] = [
  {
    id: "power",
    name: "Power",
    description: "Robot main power",
    icon: <PoweroffOutlined />,
    channels: 1,
    format: onOff("On", "Off"),
  },
  {
    id: "movement",
    name: "Movement",
    description: "Drive motion sensors",
    icon: <DashboardOutlined />,
    channels: 4,
    format: onOff("Moving", "Idle"),
  },
  {
    id: "camera-live",
    name: "Camera live",
    description: "Live video feed",
    icon: <VideoCameraOutlined />,
    channels: 1,
    format: onOff("Streaming", "No signal"),
  },
  {
    id: "camera-movement",
    name: "Camera movement",
    description: "Camera pan/tilt motion",
    icon: <ExperimentOutlined />,
    channels: 4,
    format: onOff("Moving", "Still"),
  },
  {
    id: "battery",
    name: "Battery",
    description: "Battery charge level",
    icon: <ThunderboltOutlined />,
    channels: 1,
    format: percent,
  },
  {
    id: "total-fluffy",
    name: "Total fluffy",
    description: "Total fluffy remaining",
    icon: <InboxOutlined />,
    channels: 1,
    format: amount,
  },
  {
    id: "truck-door",
    name: "Truck open/close",
    description: "Truck hatch position",
    icon: <CarOutlined />,
    channels: 1,
    format: onOff("Open", "Closed"),
  },
];

export const TOTAL_CHANNELS = DEVICES.reduce((n, d) => n + d.channels, 0);
