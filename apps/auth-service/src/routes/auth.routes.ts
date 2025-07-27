import express, { Router } from "express";

import { loginUser, resetUserPassword, userForgotPassword, userRegistration, verifyUser, verifyUserPassword } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-register", userRegistration);
router.post("/user-verify", verifyUser);
router.post("/user-login", loginUser);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyUserPassword);
router.post("/user-reset-password", resetUserPassword);
export default router;