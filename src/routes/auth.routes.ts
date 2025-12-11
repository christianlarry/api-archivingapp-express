import { Router } from "express"
import * as authController from "../controllers/auth.controller"
import { protect } from "../middlewares/auth.middleware"

const router = Router()

router.post(
  "/register",
  authController.register
)

router.post(
  "/login",
  authController.login
)

router.get("/me", protect, authController.getMe)

router.put(
  "/me",
  protect,
  authController.updateProfile
)

router.post(
  "/change-password",
  protect,
  authController.changePassword
)

export default router
