import { useEffect, useState } from "react";
import { Alert, App, Button, Popconfirm } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import { getErrorMessage } from "../../api/axiosClient";
import { useAppSelector } from "../../store/hooks";
import { readingKey } from "../devices/devicesSlice";
import CameraView from "./CameraView";
import DirectionPad from "./DirectionPad";
import { sendCommand, type Direction } from "./commands";
import { useHoldControl } from "./useHoldControl";
import "./controller.css";

const DRIVE_KEYS: Record<string, Direction> = { w: "up", s: "down", a: "left", d: "right" };
const CAM_KEYS: Record<string, Direction> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

const ControllerPage = () => {
  const { message } = App.useApp();
  const online = useAppSelector((s) => s.connection.status === "online");
  const readings = useAppSelector((s) => s.devices.readings);
  const drive = useHoldControl("movement", "Drive");
  const cam = useHoldControl("camera-movement", "Camera");
  const [doorBusy, setDoorBusy] = useState<"open" | "close" | null>(null);
  const [powerBusy, setPowerBusy] = useState<"on" | "off" | null>(null);

  const power = readings[readingKey("power", 1)];
  /** null = robot hasn't reported its power state yet */
  const powerOn = power ? Boolean(power.value) : null;
  // Only lock motion when the robot has actually told us it's off.
  const canMove = online && powerOn !== false;

  useEffect(() => {
    document.title = "Controller · Fertilizer Robot Control";
  }, []);

  const { press: drivePress, release: driveRelease, releaseAll: driveReleaseAll, stopAll: driveStop } = drive;
  const { press: camPress, release: camRelease, releaseAll: camReleaseAll, stopAll: camStop } = cam;

  // Link dropped or robot powered off: let go of anything held so nothing keeps moving unseen.
  useEffect(() => {
    if (!canMove) {
      driveReleaseAll();
      camReleaseAll();
    }
  }, [canMove, driveReleaseAll, camReleaseAll]);

  // Keyboard: WASD drive, arrows camera, Space stops everything.
  useEffect(() => {
    if (!canMove) return;
    const down = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === " ") {
        e.preventDefault();
        driveStop();
        camStop();
      } else if (DRIVE_KEYS[key]) {
        e.preventDefault();
        if (!e.repeat) drivePress(DRIVE_KEYS[key]);
      } else if (CAM_KEYS[key]) {
        e.preventDefault();
        if (!e.repeat) camPress(CAM_KEYS[key]);
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (DRIVE_KEYS[key]) driveRelease(DRIVE_KEYS[key]);
      if (CAM_KEYS[key]) camRelease(CAM_KEYS[key]);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [canMove, drivePress, driveRelease, driveStop, camPress, camRelease, camStop]);

  const door = readings[readingKey("truck-door", 1)];
  const doorOpen = door ? Boolean(door.value) : null;
  const battery = readings[readingKey("battery", 1)];
  const fluffy = readings[readingKey("total-fluffy", 1)];

  const setDoor = async (open: boolean) => {
    setDoorBusy(open ? "open" : "close");
    try {
      await sendCommand("truck-door", 1, open);
      message.success({ key: "door", content: open ? "Open command sent." : "Close command sent." });
    } catch (err) {
      message.error({ key: "door", content: `Truck: ${getErrorMessage(err, "command failed")}` });
    } finally {
      setDoorBusy(null);
    }
  };

  const setPower = async (on: boolean) => {
    setPowerBusy(on ? "on" : "off");
    if (!on) {
      // Stop motion first so the robot doesn't coast when power drops.
      driveStop();
      camStop();
    }
    try {
      await sendCommand("power", 1, on);
      message.success({ key: "power", content: on ? "Power on command sent." : "Power off command sent." });
    } catch (err) {
      message.error({ key: "power", content: `Power: ${getErrorMessage(err, "command failed")}` });
    } finally {
      setPowerBusy(null);
    }
  };

  const stopEverything = () => {
    driveStop();
    camStop();
  };

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Controller</h1>
          <p>Turn the robot on or off, drive it, aim the camera, and open or close the truck.</p>
        </div>
      </header>

      {!online && (
        <Alert
          className="ctl__alert"
          type="error"
          showIcon
          title="Controls are locked while the realtime link is down"
          description="You can't see what the robot is doing right now, so driving is disabled until the link reconnects."
        />
      )}

      {online && powerOn === false && (
        <Alert
          className="ctl__alert"
          type="warning"
          showIcon
          title="The robot is powered off"
          description="Drive and camera controls are locked. Turn the power on to use them."
        />
      )}

      <div className="ctl">
        <section className="ctl__main" aria-label="Camera">
          <CameraView />
          <dl className="ctl__stats">
            <div>
              <dt>Battery</dt>
              <dd className="tabular">{battery ? `${Math.round(Number(battery.value))}%` : "—"}</dd>
            </div>
            <div>
              <dt>Total fluffy</dt>
              <dd className="tabular">{fluffy ? String(fluffy.value) : "—"}</dd>
            </div>
            <div>
              <dt>Truck</dt>
              <dd>{doorOpen === null ? "—" : doorOpen ? "Open" : "Closed"}</dd>
            </div>
          </dl>
        </section>

        <aside className="ctl__side">
          <section className="box ctl__panel" aria-labelledby="power-h">
            <div className="ctl__panel-head">
              <h2 id="power-h">Power</h2>
              <span className="ctl__hint">
                Now:{" "}
                <strong className={powerOn === null ? undefined : powerOn ? "ctl__on" : "ctl__off"}>
                  {powerOn === null ? "unknown" : powerOn ? "On" : "Off"}
                </strong>
              </span>
            </div>
            <div className="ctl__door">
              <Button
                block
                type={powerOn === false ? "primary" : "default"}
                icon={<PoweroffOutlined />}
                loading={powerBusy === "on"}
                disabled={!online || powerBusy !== null || powerOn === true}
                onClick={() => setPower(true)}
              >
                Turn on
              </Button>
              <Popconfirm
                title="Turn the robot off?"
                description="All motion stops and controls lock until it's turned back on."
                okText="Turn off"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                disabled={!online || powerBusy !== null || powerOn === false}
                onConfirm={() => setPower(false)}
              >
                <Button
                  block
                  danger
                  icon={<PoweroffOutlined />}
                  loading={powerBusy === "off"}
                  disabled={!online || powerBusy !== null || powerOn === false}
                >
                  Turn off
                </Button>
              </Popconfirm>
            </div>
          </section>

          <section className="box ctl__panel" aria-labelledby="drive-h">
            <div className="ctl__panel-head">
              <h2 id="drive-h">Drive</h2>
              <span className="ctl__hint">Hold to move · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
            </div>
            <DirectionPad
              label="Drive"
              names={{ up: "Forward", down: "Backward", left: "Turn left", right: "Turn right" }}
              keys={{ up: "W", down: "S", left: "A", right: "D" }}
              active={drive.active}
              disabled={!canMove}
              onPress={drive.press}
              onRelease={drive.release}
              center={
                <button type="button" className="pad__stop" onClick={stopEverything} disabled={!canMove} aria-label="Stop all motion">
                  STOP
                  <kbd>Space</kbd>
                </button>
              }
            />
          </section>

          <section className="box ctl__panel" aria-labelledby="cam-h">
            <div className="ctl__panel-head">
              <h2 id="cam-h">Camera aim</h2>
              <span className="ctl__hint">Hold to pan/tilt · arrow keys</span>
            </div>
            <DirectionPad
              size="md"
              label="Camera pan and tilt"
              names={{ up: "Tilt up", down: "Tilt down", left: "Pan left", right: "Pan right" }}
              keys={{ up: "↑", down: "↓", left: "←", right: "→" }}
              active={cam.active}
              disabled={!canMove}
              onPress={cam.press}
              onRelease={cam.release}
            />
          </section>

          <section className="box ctl__panel" aria-labelledby="truck-h">
            <div className="ctl__panel-head">
              <h2 id="truck-h">Truck</h2>
              <span className="ctl__hint">
                Now: <strong>{doorOpen === null ? "unknown" : doorOpen ? "Open" : "Closed"}</strong>
              </span>
            </div>
            <div className="ctl__door">
              <Button
                block
                type={doorOpen === false ? "primary" : "default"}
                loading={doorBusy === "open"}
                disabled={!online || doorBusy !== null || doorOpen === true}
                onClick={() => setDoor(true)}
              >
                Open truck
              </Button>
              <Button
                block
                loading={doorBusy === "close"}
                disabled={!online || doorBusy !== null || doorOpen === false}
                onClick={() => setDoor(false)}
              >
                Close truck
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ControllerPage;
