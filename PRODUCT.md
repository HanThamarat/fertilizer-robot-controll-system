# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People who sign in to monitor and control the IoT devices behind the fertilizer robot. The primary user role, the setting they use it in (field or desk), and whether there is more than one role are **not decided yet**.

## Product Purpose
A web control system for IoT devices, starting with a fertilizer robot. Users sign in, then work from a dashboard where device status and controls will live.

**Current scope (first milestone):** only the **sign-in** screen and the **dashboard layout shell** (navigation, header, content area). Device controls and data views come later.

## Operating Context
- The dashboard is an operational tool. Users come to check on devices and act on them, not to browse.
- Device state reaches the app in real time through Socket.IO, backed by Firebase Realtime Database.

## Capabilities and Constraints
- **Frontend:** React + Vite + TypeScript, routed with `react-router`. Project rules (`my-skill.MD`) require Redux Toolkit, with Axios calls made inside slices via `createAsyncThunk`, and Ant Design components. Tailwind is currently installed as well.
- **Backend:** Express + Firebase Realtime Database + Socket.IO, layered as routes → controllers → database functions. Responses take the shape `{ status, message, body | error }`.
- **Open decisions:**
  - Authentication method (Firebase Auth or a custom backend) and the sign-in fields.
  - Which device data and controls the dashboard shows.
  - How many devices a user manages.
  - User roles.
  - UI language.

## Brand Commitments
- Visual direction set by the user: **"like GitHub dark"**. The app should be a dark, developer-tool-style interface in the spirit of GitHub's dark theme. This is a reference for the feel, not permission to copy GitHub's branding, logo or name.
- Product name: "Fertilizer Robot Control System" is a working name (taken from the repo name), not a confirmed brand.

## Evidence on Hand
No logo, brand assets, real device data, screenshots or users are on hand yet. Don't invent device names, metrics or readings, and present them as real. Use placeholders that are clearly labeled as such.

## Product Principles
1. **State first.** Whether a device is online and working should be readable at a glance, before any control.
2. **Safe control.** Commands that move hardware or dispense fertilizer must be deliberate and must confirm their result. Never fire them by accident.
3. **Shell before features.** Build the sign-in and layout so device features can be added later without rework.
4. **Familiar tooling feel.** Follow conventions developer-tool users already know, rather than novelty.
