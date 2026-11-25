import { Router } from "express";
import { signIn } from "../controllers/auth.controller";
import { changeMyPassword, getMe } from "../controllers/user.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/signin", signIn);
router.get("/me", requireAuth, getMe);
router.put("/me/password", requireAuth, changeMyPassword);

export default router;
