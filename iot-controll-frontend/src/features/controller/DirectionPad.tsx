import type { KeyboardEvent, ReactNode } from "react";
import { ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { Direction } from "./commands";

const ICON: Record<Direction, ReactNode> = {
  up: <ArrowUpOutlined />,
  down: <ArrowDownOutlined />,
  left: <ArrowLeftOutlined />,
  right: <ArrowRightOutlined />,
};

interface DirectionPadProps {
  label: string;
  /** Accessible name per direction, e.g. { up: "Forward", … } */
  names: Record<Direction, string>;
  /** Keyboard hint per direction, shown on the button */
  keys: Record<Direction, string>;
  active: Set<Direction>;
  disabled?: boolean;
  onPress: (d: Direction) => void;
  onRelease: (d: Direction) => void;
  /** Rendered in the middle cell (e.g. a Stop button) */
  center?: ReactNode;
  size?: "lg" | "md";
}

/** 4-way pad where each button acts while held (pointer, touch, or Enter/Space). */
const DirectionPad = ({ label, names, keys, active, disabled, onPress, onRelease, center, size = "lg" }: DirectionPadProps) => {
  const btn = (d: Direction) => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      e.stopPropagation();
      if (down && !e.repeat) onPress(d);
      if (!down) onRelease(d);
    };
    return (
      <button
        type="button"
        className={`pad__btn pad__btn--${d}${active.has(d) ? " is-active" : ""}`}
        aria-label={names[d]}
        aria-pressed={active.has(d)}
        disabled={disabled}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onPress(d);
        }}
        onPointerUp={() => onRelease(d)}
        onPointerCancel={() => onRelease(d)}
        onLostPointerCapture={() => onRelease(d)}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => onKey(e, true)}
        onKeyUp={(e) => onKey(e, false)}
        onBlur={() => onRelease(d)}
      >
        {ICON[d]}
        <kbd>{keys[d]}</kbd>
      </button>
    );
  };

  return (
    <div className={`pad pad--${size}`} role="group" aria-label={label}>
      {btn("up")}
      {btn("left")}
      <div className="pad__center">{center}</div>
      {btn("right")}
      {btn("down")}
    </div>
  );
};

export default DirectionPad;
