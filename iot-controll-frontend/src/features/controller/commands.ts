import axiosClient from "../../api/axiosClient";
import type { SensorValue } from "../devices/deviceCatalog";

/**
 * Sends a command to the robot. The backend publishes it to MQTT on
 * fertbot/<robotId>/cmd/<deviceId>/<channel>.
 */
export const sendCommand = (deviceId: string, channel: number, value: SensorValue) =>
  axiosClient.post(`/devices/${deviceId}/command`, { channel, value });

export type Direction = "up" | "down" | "left" | "right";

/**
 * Which command channel each direction drives. The ESP32 firmware must use the same mapping:
 *   movement/1 forward, /2 backward, /3 left, /4 right
 *   camera-movement/1 tilt up, /2 tilt down, /3 pan left, /4 pan right
 */
export const DIRECTION_CHANNEL: Record<Direction, number> = {
  up: 1,
  down: 2,
  left: 3,
  right: 4,
};

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];
