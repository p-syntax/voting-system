import express from "express";
import { adminLogin,voterLogin } from "../controllers/authControllers.js";

const router = express.Router();

// Public routes
router.post("/admin/login", adminLogin);
router.post("/voter/login", voterLogin);

export default router;
