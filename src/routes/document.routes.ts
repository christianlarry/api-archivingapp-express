import { Router } from "express"
import * as documentController from "@/controllers/document.controller"
import { protect } from "@/middlewares/auth.middleware"
import { upload } from "@/middlewares/upload.middleware"

const router = Router()

// Protect all routes
router.use(protect)

router.post("/upload", upload.single("file"), documentController.upload)
router.get("/", documentController.index)
router.get("/:id", documentController.show)
router.put("/:id", documentController.update)
router.delete("/:id", documentController.destroy)
router.get("/:id/download", documentController.download)

export default router
