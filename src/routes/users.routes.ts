import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = Router();

// Protect all routes
router.use(protect);
router.use(restrictTo("admin"));

router.get("/", usersController.getAll);
router.put("/:id/role", usersController.updateRole);

export default router;
