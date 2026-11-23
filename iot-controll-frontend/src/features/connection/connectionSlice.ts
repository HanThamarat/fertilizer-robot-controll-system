import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LinkStatus = "connecting" | "online" | "offline";

interface ConnectionState {
  status: LinkStatus;
  /** ms timestamp of the last status change */
  since: number;
}

const initialState: ConnectionState = { status: "connecting", since: Date.now() };

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setLinkStatus(state, action: PayloadAction<LinkStatus>) {
      if (state.status === action.payload) return;
      state.status = action.payload;
      state.since = Date.now();
    },
  },
});

export const { setLinkStatus } = connectionSlice.actions;
export default connectionSlice.reducer;
