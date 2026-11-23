import { Tooltip } from "antd";
import { useAppSelector } from "../store/hooks";
import type { LinkStatus as Status } from "../features/connection/connectionSlice";
import { formatSince } from "../features/connection/formatSince";
import "./linkStatus.css";

const LABEL: Record<Status, string> = {
  online: "Live",
  connecting: "Connecting",
  offline: "Offline",
};

const HINT: Record<Status, string> = {
  online: "Receiving realtime updates from the control server.",
  connecting: "Opening the realtime link to the control server…",
  offline: "No realtime link. Device data may be out of date.",
};

interface LinkStatusProps {
  /** Short label only ("Live"), for narrow headers. */
  compact?: boolean;
  /** Announce changes to screen readers. Enable on one instance only. */
  live?: boolean;
}

/** Realtime link pill: mirrors the Socket.IO connection state. */
const LinkStatus = ({ compact = false, live = false }: LinkStatusProps) => {
  const { status, since } = useAppSelector((s) => s.connection);
  return (
    <Tooltip title={`${HINT[status]} Since ${formatSince(since)}.`} placement="bottomRight">
      <span
        className={`link-pill link-pill--${status}`}
        role={live ? "status" : undefined}
        aria-live={live ? "polite" : undefined}
        tabIndex={0}
      >
        <span className="link-pill__dot" aria-hidden />
        {compact ? (
          <>
            <span className="sr-only">Realtime </span>
            {LABEL[status]}
          </>
        ) : (
          <>Realtime · {LABEL[status]}</>
        )}
      </span>
    </Tooltip>
  );
};

export default LinkStatus;
