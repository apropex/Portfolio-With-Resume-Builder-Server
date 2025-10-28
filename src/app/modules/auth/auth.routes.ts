import express from "express";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/google", AuthController.authWithGoogle);

export const authRouter = router;
