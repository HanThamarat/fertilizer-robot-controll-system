import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseOutlined, ReloadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../store/hooks";
import { readingKey } from "../devices/devicesSlice";
import { grams } from "../devices/deviceCatalog";
import DirectionPad from "./DirectionPad";
import { useHoldControl } from "./useHoldControl";
import "./gamepad.css";

/** Same key CameraView saves the stream URL under. */
const CAMERA_URL_KEY = "frc.cameraUrl";
const NO_KEYS = { up: "", down: "", left: "", right: "" };

type OwnState = "loading" | "playing" | "error";

/**
 * The master board relay serves ONE viewer at a time and drops the old one when a new
 * viewer connects. So if the Controller page is already showing the stream, reuse it.
 */
const findPageStream = () => {
  const img = document.querySelector<HTMLImageElement>(".cam__frame img");
  return img && img.complete && img.naturalWidth > 0 ? img : null;
};

/** Abort an MJPEG request when its <img> goes away, so the relay connection is freed. */
const abortOnRemove = (el: HTMLImageElement | null) => {
  if (!el) return;
  return () => el.removeAttribute("src");
};

interface GamepadModeProps {
  onClose: () => void;
}

/**
 * Full-screen "game controller" layout for phones: drive pad on the left thumb,
 * camera pad on the right thumb, STOP in the middle, stats along the top.
 * The camera stream can be turned on as a full-screen backdrop behind the controls.
 */
const GamepadMode = ({ onClose }: GamepadModeProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const online = useAppSelector((s) => s.connection.status === "online");
  const readings = useAppSelector((s) => s.devices.readings);
  const drive = useHoldControl("movement", "Drive");
  const cam = useHoldControl("camera-movement", "Camera");

  const [camUrl] = useState(() => localStorage.getItem(CAMERA_URL_KEY) ?? import.meta.env.VITE_CAMERA_URL ?? "");
  const [camOn, setCamOn] = useState(false);
  /** The Controller page's own live <img>, mirrored onto a canvas so we don't open a 2nd stream. */
  const [mirror, setMirror] = useState<HTMLImageElement | null>(null);
  const [ownState, setOwnState] = useState<OwnState>("loading");
  const [nonce, setNonce] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const power = readings[readingKey("power", 1)];
  const powerOn = power ? Boolean(power.value) : null;
  const canMove = online && powerOn !== false;

  const battery = readings[readingKey("battery", 1)];
  const fluffy = readings[readingKey("total-fluffy", 1)];
  const door = readings[readingKey("truck-door", 1)];
  const doorOpen = door ? Boolean(door.value) : null;
  const batteryPct = battery ? Math.round(Number(battery.value)) : null;

  const { releaseAll: driveReleaseAll, stopAll: driveStop } = drive;
  const { releaseAll: camReleaseAll, stopAll: camStop } = cam;

  // Lock motion if the link drops or the robot turns off.
  useEffect(() => {
    if (!canMove) {
      driveReleaseAll();
      camReleaseAll();
    }
  }, [canMove, driveReleaseAll, camReleaseAll]);

  // Enter browser full screen + landscape where supported; stop scrolling behind the overlay.
  useEffect(() => {
    const el = rootRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.requestFullscreen?.()
      .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape"))
      .catch(() => {
        /* not supported (e.g. iPhone Safari) — the fixed overlay still fills the viewport */
      });
    return () => {
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  const stopEverything = () => {
    driveStop();
    camStop();
  };

  const exit = () => {
    stopEverything();
    onClose();
  };

  const connectOwn = () => {
    setMirror(null);
    setNonce(Date.now()); // fresh URL every time so the browser never shows a cached frame
    setOwnState(camUrl ? "loading" : "error");
  };

  const toggleCamera = () => {
    if (camOn) {
      setCamOn(false);
      setMirror(null);
      return;
    }
    setCamOn(true);
    const live = findPageStream();
    if (live) setMirror(live);
    else connectOwn();
  };

  // Mirror mode: copy the page's live frames onto our canvas.
  useEffect(() => {
    if (!mirror) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const draw = () => {
      if (!mirror.isConnected) {
        // Page stream went away -> open our own.
        setMirror(null);
        setNonce(Date.now());
        setOwnState("loading");
        return;
      }
      if (mirror.naturalWidth) {
        if (canvas.width !== mirror.naturalWidth) canvas.width = mirror.naturalWidth;
        if (canvas.height !== mirror.naturalHeight) canvas.height = mirror.naturalHeight;
        ctx.drawImage(mirror, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mirror]);

  const ownActive = camOn && !mirror && Boolean(camUrl);

  // Own stream failed (relay dropped us, camera rebooting, …): retry on its own.
  useEffect(() => {
    if (!ownActive || ownState !== "error") return;
    const t = setTimeout(() => {
      setNonce(Date.now());
      setOwnState("loading");
    }, 3000);
    return () => clearTimeout(t);
  }, [ownActive, ownState]);

  // Coming back to the tab: the stream was likely dropped while hidden, reconnect.
  useEffect(() => {
    if (!ownActive) return;
    const onVisible = () => {
      if (document.hidden) return;
      setNonce(Date.now());
      setOwnState("loading");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [ownActive]);

  const camSrc = camUrl ? `${camUrl}${camUrl.includes("?") ? "&" : "?"}_=${nonce}` : "";
  const camLabel = !camOn
    ? "Camera"
    : mirror || ownState === "playing"
      ? "Live"
      : ownState === "loading"
        ? "Connecting"
        : camUrl
          ? "Reconnecting"
          : "Camera";

  const lockMsg = !online
    ? "Realtime link is down — controls locked"
    : powerOn === false
      ? "Robot is powered off — controls locked"
      : null;

  return createPortal(
    <div className="gp" ref={rootRef} role="dialog" aria-modal="true" aria-label="Game controller">
      {/* backdrop */}
      <div className="gp__backdrop">
        {camOn && mirror && <canvas ref={canvasRef} className="gp__feed" aria-label="Live view from the robot camera" />}
        {ownActive && ownState !== "error" && (
          <img
            key={nonce}
            ref={abortOnRemove}
            className="gp__feed"
            src={camSrc}
            alt="Live view from the robot camera"
            onLoad={(e) => e.currentTarget.isConnected && setOwnState("playing")}
            onError={(e) => e.currentTarget.isConnected && setOwnState("error")}
          />
        )}
        {camOn && !mirror && ownState === "error" && (
          <div className="gp__cam-msg">
            <VideoCameraOutlined aria-hidden />
            <p>{camUrl ? "Camera stream dropped — reconnecting…" : "No camera stream URL set. Set it on the Controller page."}</p>
            {camUrl && (
              <button type="button" className="gp__chip" onClick={connectOwn}>
                <ReloadOutlined /> Reconnect now
              </button>
            )}
          </div>
        )}
      </div>

      {/* top HUD */}
      <header className="gp__hud">
        <button type="button" className="gp__icon" onClick={exit} aria-label="Exit game controller">
          <CloseOutlined />
        </button>

        <dl className="gp__stats">
          <div>
            <dt>Battery</dt>
            <dd className={`tabular${batteryPct !== null && batteryPct <= 20 ? " gp__low" : ""}`}>
              {batteryPct === null ? "—" : `${batteryPct}%`}
            </dd>
          </div>
          <div>
            <dt>Total fluffy</dt>
            <dd className="tabular">{fluffy ? grams(fluffy.value) : "—"}</dd>
          </div>
          <div>
            <dt>Truck</dt>
            <dd>{doorOpen === null ? "—" : doorOpen ? "Open" : "Closed"}</dd>
          </div>
        </dl>

        <button type="button" className={`gp__chip${camOn ? " is-on" : ""}`} onClick={toggleCamera} aria-pressed={camOn}>
          <VideoCameraOutlined />
          {camLabel}
        </button>
      </header>

      {lockMsg && <div className="gp__lock" role="status">{lockMsg}</div>}

      {/* thumb controls */}
      <div className="gp__controls">
        <section className="gp__stick" aria-label="Drive">
          <span className="gp__label">Drive</span>
          <DirectionPad
            label="Drive"
            names={{ up: "Forward", down: "Backward", left: "Turn left", right: "Turn right" }}
            keys={NO_KEYS}
            active={drive.active}
            disabled={!canMove}
            onPress={drive.press}
            onRelease={drive.release}
          />
        </section>

        <section className="gp__stick" aria-label="Camera aim">
          <span className="gp__label">Camera</span>
          <DirectionPad
            label="Camera pan and tilt"
            names={{ up: "Tilt up", down: "Tilt down", left: "Pan left", right: "Pan right" }}
            keys={NO_KEYS}
            active={cam.active}
            disabled={!canMove}
            onPress={cam.press}
            onRelease={cam.release}
          />
        </section>
      </div>
    </div>,
    document.body,
  );
};

export default GamepadMode;
