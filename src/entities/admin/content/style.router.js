import { Router } from "express";
import { styleController } from "./style.controller.js";
import { adminMiddleware, verifyToken } from "../../../core/middlewares/authMiddleware.js";

const router = Router();

router.get("/", styleController.getStyle);
router.post("/", verifyToken, adminMiddleware, styleController.postStyle);
router.patch("/:id", verifyToken, adminMiddleware, styleController.patchStyle);
router.delete("/:id", verifyToken, adminMiddleware, styleController.removeStyle);

export const styleRoutes= router;
