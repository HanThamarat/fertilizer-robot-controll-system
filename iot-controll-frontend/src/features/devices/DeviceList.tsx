import { Tooltip } from "antd";
import { useAppSelector } from "../../store/hooks";
import { formatSince } from "../connection/formatSince";
import { DEVICES, TOTAL_CHANNELS, type DeviceSpec } from "./deviceCatalog";
import { readingKey } from "./devicesSlice";
import "./devices.css";

const DeviceRow = ({ device, stale }: { device: DeviceSpec; stale: boolean }) => {
  const readings = useAppSelector((s) => s.devices.readings);
  const channels = Array.from({ length: device.channels }, (_, i) => i + 1);
  const reporting = channels.filter((ch) => readings[readingKey(device.id, ch)]).length;

  return (
    <li className="device">
      <div className="device__id">
        <span className="device__icon" aria-hidden>
          {device.icon}
        </span>
        <div className="device__text">
          <h3>{device.name}</h3>
          <p>
            {device.description} · {device.channels} {device.channels === 1 ? "channel" : "channels"}
          </p>
        </div>
      </div>

      <ul className="device__channels" aria-label={`${device.name} channels, ${reporting} of ${device.channels} reporting`}>
        {channels.map((ch) => {
          const r = readings[readingKey(device.id, ch)];
          const state = !r ? "none" : stale ? "stale" : "live";
          const label = device.channels > 1 ? `CH${ch}` : "Value";
          const tip = r
            ? `${device.name} ${label}: updated ${formatSince(r.at)}${stale ? " (link offline, may be out of date)" : ""}`
            : `${device.name} ${label}: no data received yet`;
          return (
            <Tooltip key={ch} title={tip}>
              <li className={`chan chan--${state}`} tabIndex={0}>
                <span className="chan__dot" aria-hidden />
                <span className="chan__label">{label}</span>
                <span className="chan__value tabular">{r ? device.format(r.value) : "—"}</span>
              </li>
            </Tooltip>
          );
        })}
      </ul>
    </li>
  );
};

/** All IoT sensors on the robot, one row per sensor with a cell per channel. */
const DeviceList = () => {
  const linkStatus = useAppSelector((s) => s.connection.status);
  const readings = useAppSelector((s) => s.devices.readings);
  const reporting = DEVICES.reduce(
    (n, d) => n + Array.from({ length: d.channels }, (_, i) => readings[readingKey(d.id, i + 1)]).filter(Boolean).length,
    0,
  );
  const stale = linkStatus !== "online";

  return (
    <div className="box">
      <div className="device-list__head">
        <span>
          <strong>{DEVICES.length}</strong> sensors · <strong>{TOTAL_CHANNELS}</strong> channels
        </span>
        <span className="device-list__count tabular">
          {reporting} / {TOTAL_CHANNELS} reporting
        </span>
      </div>
      <ul className="device-list">
        {DEVICES.map((d) => (
          <DeviceRow key={d.id} device={d} stale={stale} />
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;
