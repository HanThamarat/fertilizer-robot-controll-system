import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SensorValue } from "./deviceCatalog";

/** Payload of the `sensor:reading` Socket.IO event. Channels are 1-based. */
export interface SensorReading {
  deviceId: string;
  channel: number;
  value: SensorValue;
  /** ms timestamp from the device; defaults to arrival time */
  at?: number;
}

export interface ChannelReading {
  value: SensorValue;
  at: number;
}

interface DevicesState {
  /** keyed by `${deviceId}:${channel}` */
  readings: Record<string, ChannelReading>;
}

export const readingKey = (deviceId: string, channel: number) => `${deviceId}:${channel}`;

const initialState: DevicesState = { readings: {} };

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    receiveReading(state, { payload }: PayloadAction<SensorReading>) {
      state.readings[readingKey(payload.deviceId, payload.channel)] = {
        value: payload.value,
        at: payload.at ?? Date.now(),
      };
    },
  },
});

export const { receiveReading } = devicesSlice.actions;
export default devicesSlice.reducer;
