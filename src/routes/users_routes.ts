import express from "express";
import {
  getAuthenticatedUser,
  login,
  logout,
  signup,
} from "../controllers/users_controllers";
import { checkAuthentication } from "../middleware/auth";

const router = express.Router();

router.get("/", checkAuthentication, getAuthenticatedUser);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
