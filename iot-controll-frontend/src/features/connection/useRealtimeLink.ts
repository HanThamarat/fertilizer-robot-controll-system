import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../../store/hooks";
import { setLinkStatus } from "./connectionSlice";
import { receiveReading, type SensorReading } from "../devices/devicesSlice";

/**
 * Backend origin for the socket. VITE_API_URL="/api" (dev, proxied) -> same origin;
 * VITE_API_URL="https://xyz.up.railway.app/api" (production) -> that host.
 */
const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
const SOCKET_ORIGIN = /^https?:\/\//.test(apiUrl) ? new URL(apiUrl).origin : undefined;

/** Opens the Socket.IO link to the backend and mirrors its state into Redux. */
export const useRealtimeLink = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const opts = { path: "/socket.io", reconnectionDelayMax: 8000 };
    const socket = SOCKET_ORIGIN ? io(SOCKET_ORIGIN, opts) : io(opts);
    dispatch(setLinkStatus("connecting"));
    socket.on("connect", () => dispatch(setLinkStatus("online")));
    socket.on("disconnect", () => dispatch(setLinkStatus("offline")));
    socket.on("connect_error", () => dispatch(setLinkStatus("offline")));
    socket.on("sensor:reading", (r: SensorReading) => dispatch(receiveReading(r)));
    socket.io.on("reconnect_attempt", () => dispatch(setLinkStatus("connecting")));
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
};
