# Project Rules — Fertilizer Robot Control System

Monorepo with two apps, both in TypeScript:

- `iot-controll-frontend/`: React + Vite
- `iot-controll-backend/`: Express + Firebase Realtime Database + Socket.IO

Follow these rules whenever you add or change code.

---

## Frontend (`iot-controll-frontend`)

### Stack
- **State:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **HTTP:** Axios
- **UI components:** Ant Design (`antd`, `@ant-design/icons`)

### Rules
1. **All API calls go in Redux slices.** Make each request with `createAsyncThunk` inside the feature's slice file. Components never call Axios or `fetch` themselves.
2. **One shared Axios instance.** Create it in `src/api/axiosClient.ts` with `baseURL` from `import.meta.env.VITE_API_URL`. Every thunk imports this instance instead of calling `axios` directly.
3. **Each slice covers its async states.** Every thunk handles `pending`, `fulfilled` and `rejected` in `extraReducers`, and the slice state tracks `loading` and `error` next to the data.
4. **Components only dispatch and select.** Use the typed hooks `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts`.
5. **Use Ant Design components for the UI.** Use `Button`, `Table`, `Form`, `Input`, `Modal`, `Card`, `Layout`, `Menu`, `Spin`, `message`, `notification` and so on. Don't build your own versions of components antd already has. Theme through `ConfigProvider`, not CSS overrides.
6. **Show feedback with antd.** Show `loading` with `Spin` or the `loading` prop, and show `error` with `message.error` or `Alert`.

### Structure
```
src/
  api/
    axiosClient.ts        # shared axios instance
  store/
    index.ts              # configureStore, RootState, AppDispatch
    hooks.ts              # useAppDispatch, useAppSelector
  features/
    <feature>/
      <feature>Slice.ts   # state + createAsyncThunk API calls
      <Feature>Page.tsx   # page using antd components
      components/         # feature-specific components
  components/             # shared components
  layouts/                # antd Layout wrappers
  App.tsx
  main.tsx                # <Provider store={store}>
```

### Slice example
```ts
// src/features/robot/robotSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchRobots = createAsyncThunk(
  "robot/fetchRobots",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/robots");
      return res.data.body;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

interface RobotState {
  list: any[];
  loading: boolean;
  error: string | null;
}

const initialState: RobotState = { list: [], loading: false, error: null };

const robotSlice = createSlice({
  name: "robot",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRobots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRobots.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRobots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default robotSlice.reducer;
```

---

## Backend (`iot-controll-backend`)

### Stack
- **Server:** Express
- **Database:** Firebase Realtime Database (`firebaseDB` from `src/conf/firebase.ts`)
- **Realtime:** Socket.IO (`src/socket/socketServer.ts`)

### Layers: routes → controllers → database
1. **Routes** (`src/routes/`) only map HTTP method and path to a controller function. No logic goes here.
2. **Controllers** (`src/controllers/`) read and validate `req`, call database functions, and send the response with `setResonse` or `setErrResonse` from `src/hooks/response.ts`. Every controller is wrapped in `try/catch`.
3. **Database functions** (`src/database/`) are the only place that imports `firebaseDB` or calls `ref`, `get`, `set`, `update`, `push` or `remove`. They take plain arguments, return plain data, and never touch `req` or `res`.
4. `server.ts` only sets up the app, mounts routers under `/api`, and starts the server and socket.
5. Secrets and URLs come from `.env`, and each new variable also goes in `.env.example`.

### Structure
```
src/
  conf/
    firebase.ts           # firebaseDB
  hooks/
    response.ts           # setResonse / setErrResonse
  routes/
    index.ts              # mounts all feature routers
    robot.routes.ts
  controllers/
    robot.controller.ts
  database/
    robot.db.ts
  socket/
    socketServer.ts
  server.ts
```

### Example
```ts
// src/database/robot.db.ts
import { ref, get, set } from "firebase/database";
import { firebaseDB } from "../conf/firebase";

export const getAllRobots = async () => {
  const snapshot = await get(ref(firebaseDB, "robots"));
  return snapshot.exists() ? snapshot.val() : {};
};

export const setRobotCommand = async (id: string, command: object) => {
  await set(ref(firebaseDB, `robots/${id}/command`), command);
};
```

```ts
// src/controllers/robot.controller.ts
import { Request, Response } from "express";
import { setResonse, setErrResonse } from "../hooks/response";
import { getAllRobots } from "../database/robot.db";

export const getRobots = async (req: Request, res: Response) => {
  try {
    const robots = await getAllRobots();
    return setResonse({ res, statusCode: 200, message: "Get robots success", body: robots });
  } catch (error) {
    return setErrResonse({ res, statusCode: 500, message: "Get robots failed", error });
  }
};
```

```ts
// src/routes/robot.routes.ts
import { Router } from "express";
import { getRobots } from "../controllers/robot.controller";

const router = Router();
router.get("/", getRobots);
export default router;
```

```ts
// src/routes/index.ts
import { Router } from "express";
import robotRoutes from "./robot.routes";

const router = Router();
router.use("/robots", robotRoutes);
export default router;

// server.ts → app.use("/api", routes);
```

---

## Shared conventions
- Every API response looks like `{ status, message, body | error }`, and frontend thunks read `res.data.body`.
- File names: `<feature>.routes.ts`, `<feature>.controller.ts`, `<feature>.db.ts`, `<feature>Slice.ts`.
- Use TypeScript everywhere, and define interfaces for request bodies and slice state.
