import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/auth.js";
const router = express.Router();
router.use(protect, admin);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
export default router;
