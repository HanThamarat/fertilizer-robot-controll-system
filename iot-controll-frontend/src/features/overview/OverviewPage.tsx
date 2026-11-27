import { useEffect } from "react";
import { Alert, Tag } from "antd";
import LinkStatus from "../../components/LinkStatus";
import DeviceList from "../devices/DeviceList";
import { formatSince } from "../connection/formatSince";
import { useAppSelector } from "../../store/hooks";

const STATUS_TEXT = {
  online: "Connected. Device updates arrive as they happen.",
  connecting: "Trying to reach the control server…",
  offline: "Can't reach the control server. Device data may be out of date until it reconnects. If this lasts, contact your system admin.",
} as const;

const OverviewPage = () => {
  const { status, since } = useAppSelector((s) => s.connection);
  const { robot, mqttConnected, error } = useAppSelector((s) => s.devices);

  useEffect(() => {
    document.title = "Overview · Fertilizer Robot Control";
  }, []);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Overview</h1>
          <p>Realtime link and devices at a glance.</p>
        </div>
      </header>

      <section className="page__section" aria-labelledby="link-h">
        <h2 id="link-h">Realtime link</h2>
        <dl className="box">
          <div className="box__row">
            <dt>Status</dt>
            <dd>
              <LinkStatus />
            </dd>
          </div>
          <div className="box__row">
            <dt>Detail</dt>
            <dd>{STATUS_TEXT[status]}</dd>
          </div>
          <div className="box__row">
            <dt>Last change</dt>
            <dd className="tabular">{formatSince(since)}</dd>
          </div>
          <div className="box__row">
            <dt>Robot</dt>
            <dd>
              {!robot || robot.at === null ? (
                <Tag>Never connected</Tag>
              ) : (
                <>
                  <Tag color={robot.online ? "green" : "red"}>{robot.online ? "Online" : "Offline"}</Tag>
                  <span className="tabular">since {formatSince(robot.at)}</span>
                </>
              )}
              {mqttConnected === false && <Tag color="orange">Server not connected to MQTT</Tag>}
            </dd>
          </div>
          <div className="box__row">
            <dt>Endpoint</dt>
            <dd className="mono">{window.location.host}/socket.io</dd>
          </div>
        </dl>
      </section>

      <section className="page__section" aria-labelledby="devices-h">
        <h2 id="devices-h">Devices</h2>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 12 }} />}
        <DeviceList />
      </section>
    </div>
  );
};

export default OverviewPage;
