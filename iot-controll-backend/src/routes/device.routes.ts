import { Router } from "express";
import { getDeviceState, sendCommand } from "../controllers/device.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/state", requireAuth, getDeviceState);
router.post("/:deviceId/command", requireAuth, sendCommand);

export default router;
