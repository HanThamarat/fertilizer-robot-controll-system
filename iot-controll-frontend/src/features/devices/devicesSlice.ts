import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axiosClient, { getErrorMessage } from "../../api/axiosClient";
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

/** Payload of the `robot:status` Socket.IO event (the ESP32's MQTT online/offline). */
export interface RobotStatus {
  robotId: string;
  online: boolean;
  /** null = the robot has never reported */
  at: number | null;
}

interface DeviceStateResponse {
  mqttConnected: boolean;
  robot: RobotStatus;
  readings: SensorReading[];
}

interface DevicesState {
  /** keyed by `${deviceId}:${channel}` */
  readings: Record<string, ChannelReading>;
  robot: RobotStatus | null;
  /** Whether the backend itself is connected to the MQTT broker. */
  mqttConnected: boolean | null;
  loading: boolean;
  error: string | null;
}

export const readingKey = (deviceId: string, channel: number) => `${deviceId}:${channel}`;

/** Loads the saved current state (last value of every channel + robot status) from the backend. */
export const fetchDeviceState = createAsyncThunk<DeviceStateResponse, void, { rejectValue: string }>(
  "devices/fetchDeviceState",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/devices/state");
      return res.data.body as DeviceStateResponse;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Couldn't load the current device state."));
    }
  },
);

const initialState: DevicesState = { readings: {}, robot: null, mqttConnected: null, loading: false, error: null };

/** Keeps whichever reading is newer, so a slow API response can't overwrite a live socket update. */
const putReading = (state: DevicesState, r: SensorReading) => {
  const key = readingKey(r.deviceId, r.channel);
  const at = r.at ?? Date.now();
  const current = state.readings[key];
  if (current && current.at > at) return;
  state.readings[key] = { value: r.value, at };
};

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    receiveReading(state, { payload }: PayloadAction<SensorReading>) {
      putReading(state, payload);
    },
    receiveRobotStatus(state, { payload }: PayloadAction<RobotStatus>) {
      state.robot = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeviceState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviceState.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.mqttConnected = payload.mqttConnected;
        if (!state.robot || (payload.robot.at ?? 0) >= (state.robot.at ?? 0)) state.robot = payload.robot;
        payload.readings.forEach((r) => putReading(state, r));
      })
      .addCase(fetchDeviceState.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload ?? error.message ?? "Couldn't load the current device state.";
      });
  },
});

export const { receiveReading, receiveRobotStatus } = devicesSlice.actions;
export default devicesSlice.reducer;
