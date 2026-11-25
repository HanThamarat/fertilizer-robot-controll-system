import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "antd";
import { getErrorMessage } from "../../api/axiosClient";
import { DIRECTION_CHANNEL, DIRECTIONS, sendCommand, type Direction } from "./commands";

/**
 * Hold-to-move control for a 4-channel device: pressing a direction sends `true`
 * to its channel, releasing sends `false`. Everything held is released when the
 * window loses focus, the tab is hidden, or the page unmounts, so the robot never
 * keeps moving because a key-up or pointer-up got lost.
 */
export const useHoldControl = (deviceId: string, label: string) => {
  const { message } = App.useApp();
  const [active, setActive] = useState<Set<Direction>>(() => new Set());
  /** Source of truth for what's held; `active` mirrors it for rendering. */
  const heldRef = useRef(new Set<Direction>());

  const send = useCallback(
    (dir: Direction, on: boolean) => {
      sendCommand(deviceId, DIRECTION_CHANNEL[dir], on).catch((err) => {
        message.error({ key: `${deviceId}-err`, content: `${label}: ${getErrorMessage(err, "command failed")}` });
      });
    },
    [deviceId, label, message],
  );

  const press = useCallback(
    (dir: Direction) => {
      if (heldRef.current.has(dir)) return;
      heldRef.current.add(dir);
      setActive(new Set(heldRef.current));
      send(dir, true);
    },
    [send],
  );

  const release = useCallback(
    (dir: Direction) => {
      if (!heldRef.current.has(dir)) return;
      heldRef.current.delete(dir);
      setActive(new Set(heldRef.current));
      send(dir, false);
    },
    [send],
  );

  /** Releases only what is currently held. */
  const releaseAll = useCallback(() => [...heldRef.current].forEach((d) => release(d)), [release]);

  /** Sends `false` to every channel, held or not. */
  const stopAll = useCallback(() => {
    heldRef.current.clear();
    setActive(new Set());
    DIRECTIONS.forEach((d) => send(d, false));
  }, [send]);

  useEffect(() => {
    const onVisibility = () => document.hidden && releaseAll();
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onVisibility);
      releaseAll();
    };
  }, [releaseAll]);

  return { active, press, release, releaseAll, stopAll };
};
