import { Router } from "express";
import { addUser, editUser, getUsers, removeUser } from "../controllers/user.controller";
import { requireAdmin, requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/", getUsers);
router.post("/", addUser);
router.patch("/:email", editUser);
router.delete("/:email", removeUser);

export default router;
