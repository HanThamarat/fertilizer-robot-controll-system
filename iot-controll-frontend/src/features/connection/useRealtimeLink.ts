import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../../store/hooks";
import { setLinkStatus } from "./connectionSlice";
import { receiveReading, type SensorReading } from "../devices/devicesSlice";

/** Opens the Socket.IO link to the backend and mirrors its state into Redux. */
export const useRealtimeLink = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io({ path: "/socket.io", reconnectionDelayMax: 8000 });
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
