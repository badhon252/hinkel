import express from "express";
import { generateLineArtPreview } from "../GEMINI/gemini.controller.js";
import { verifyToken } from "../../core/middlewares/authMiddleware.js";

const router = express.Router();

// Define the POST route
router.post("/generate-preview", verifyToken, generateLineArtPreview);

export default router;
