import { Router } from "express";
import { sendCommand } from "../controllers/device.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/:deviceId/command", requireAuth, sendCommand);

export default router;
