import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../../store/hooks";
import { setLinkStatus } from "./connectionSlice";
import {
  fetchDeviceState,
  receiveReading,
  receiveRobotStatus,
  type RobotStatus,
  type SensorReading,
} from "../devices/devicesSlice";

/**
 * Backend origin for the socket. VITE_API_URL="/api" (dev, proxied) -> same origin;
 * VITE_API_URL="https://xyz.up.railway.app/api" (production) -> that host.
 */
const apiUrl = (import.meta.env.VITE_API_URL ?? "/api").trim();
// Resolve like the browser/axios does: relative -> current origin, absolute (any form) -> its host.
const SOCKET_ORIGIN = new URL(apiUrl, window.location.href).origin;

/** Opens the Socket.IO link to the backend and mirrors its state into Redux. */
export const useRealtimeLink = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const opts = { path: "/socket.io", reconnectionDelayMax: 8000 };
    const socket = io(SOCKET_ORIGIN, opts);
    dispatch(setLinkStatus("connecting"));
    socket.on("connect", () => {
      dispatch(setLinkStatus("online"));
      // Pull the saved current state too, so values show even if the robot is quiet right now.
      void dispatch(fetchDeviceState());
    });
    socket.on("disconnect", () => dispatch(setLinkStatus("offline")));
    socket.on("connect_error", () => dispatch(setLinkStatus("offline")));
    socket.on("sensor:reading", (r: SensorReading) => dispatch(receiveReading(r)));
    socket.on("robot:status", (s: RobotStatus) => dispatch(receiveRobotStatus(s)));
    socket.io.on("reconnect_attempt", () => dispatch(setLinkStatus("connecting")));
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
};
