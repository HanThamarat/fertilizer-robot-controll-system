import { Router } from "express";
import authRoutes from "./auth.routes";
import deviceRoutes from "./device.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/devices", deviceRoutes);
router.use("/users", userRoutes);

export default router;
