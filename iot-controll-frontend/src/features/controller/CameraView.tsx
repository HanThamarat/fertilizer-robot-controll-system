import { useRef, useState } from "react";
import { Button, Input, Popover, Tooltip } from "antd";
import { FullscreenOutlined, ReloadOutlined, SettingOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../store/hooks";
import { readingKey } from "../devices/devicesSlice";

const URL_KEY = "frc.cameraUrl";

type StreamState = "empty" | "loading" | "playing" | "error";

/**
 * Live camera view. Shows an MJPEG stream (ESP32-CAM: http://<ip>:81/stream) or any
 * image URL. The URL comes from Settings (saved in this browser) or VITE_CAMERA_URL.
 */
const CameraView = () => {
  const [url, setUrl] = useState(() => localStorage.getItem(URL_KEY) ?? import.meta.env.VITE_CAMERA_URL ?? "");
  const [draft, setDraft] = useState(url);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<StreamState>(url ? "loading" : "empty");
  const frameRef = useRef<HTMLDivElement>(null);

  const liveReading = useAppSelector((s) => s.devices.readings[readingKey("camera-live", 1)]);
  const linkOnline = useAppSelector((s) => s.connection.status === "online");
  const cameraOn = liveReading ? Boolean(liveReading.value) : null;

  const reload = () => {
    if (!url) return;
    setState("loading");
    setNonce((n) => n + 1);
  };

  const saveUrl = () => {
    const next = draft.trim();
    localStorage.setItem(URL_KEY, next);
    setUrl(next);
    setState(next ? "loading" : "empty");
    setNonce((n) => n + 1);
    setSettingsOpen(false);
  };

  const src = url ? `${url}${url.includes("?") ? "&" : "?"}_=${nonce}` : "";
  const mixedContent = url.startsWith("http:") && window.location.protocol === "https:";

  const badge =
    state === "playing"
      ? { cls: "live", text: "Live" }
      : state === "loading"
        ? { cls: "loading", text: "Connecting" }
        : state === "error"
          ? { cls: "error", text: "No video" }
          : { cls: "idle", text: "Not set up" };

  return (
    <div className="cam">
      <div className="cam__bar">
        <div className="cam__title">
          <VideoCameraOutlined aria-hidden />
          <span>Camera live</span>
          <span className={`cam__badge cam__badge--${badge.cls}`} role="status">
            <span className="cam__dot" aria-hidden />
            {badge.text}
          </span>
          {cameraOn !== null && (
            <span className="cam__sensor">
              Sensor: {cameraOn ? "streaming" : "no signal"}
              {!linkOnline && " (may be out of date)"}
            </span>
          )}
        </div>
        <div className="cam__tools">
          <Tooltip title="Reload stream">
            <Button type="text" size="small" icon={<ReloadOutlined />} aria-label="Reload stream" onClick={reload} disabled={!url} />
          </Tooltip>
          <Tooltip title="Full screen">
            <Button
              type="text"
              size="small"
              icon={<FullscreenOutlined />}
              aria-label="Full screen"
              onClick={() => frameRef.current?.requestFullscreen?.()}
              disabled={!url}
            />
          </Tooltip>
          <Popover
            open={settingsOpen}
            onOpenChange={(o) => {
              setSettingsOpen(o);
              if (o) setDraft(url);
            }}
            trigger="click"
            placement="bottomRight"
            title="Camera stream URL"
            content={
              <form
                className="cam__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveUrl();
                }}
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="http://192.168.1.60:81/stream"
                  aria-label="Camera stream URL"
                  autoFocus
                />
                <p>MJPEG stream or image URL. For ESP32-CAM use port 81, path /stream. Saved in this browser.</p>
                <Button type="primary" htmlType="submit" block>
                  Save
                </Button>
              </form>
            }
          >
            <Tooltip title="Stream settings">
              <Button type="text" size="small" icon={<SettingOutlined />} aria-label="Stream settings" />
            </Tooltip>
          </Popover>
        </div>
      </div>

      <div className="cam__frame" ref={frameRef}>
        {url && state !== "error" && (
          <img
            key={nonce}
            src={src}
            alt="Live view from the robot camera"
            onLoad={() => setState("playing")}
            onError={() => setState("error")}
          />
        )}

        {state === "empty" && (
          <div className="cam__msg">
            <VideoCameraOutlined aria-hidden />
            <h3>No camera stream set</h3>
            <p>Add the camera's stream URL to see the live view.</p>
            <Button onClick={() => setSettingsOpen(true)}>Set stream URL</Button>
          </div>
        )}

        {state === "error" && (
          <div className="cam__msg">
            <VideoCameraOutlined aria-hidden />
            <h3>Can't load the camera stream</h3>
            <p>
              {mixedContent
                ? "This page is HTTPS but the camera is HTTP, so the browser blocks it. Use an HTTPS stream or open the dashboard over HTTP."
                : "Check that the camera is powered, on the same network, and that the URL is right."}
            </p>
            <p className="mono">{url}</p>
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
