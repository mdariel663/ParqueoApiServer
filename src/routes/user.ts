import express from "express";
import {
  onlyAuthenticatedAccess,
  onlyAdminAccess,
} from "../controllers/controllers";
import UserController from "../controllers/UserController";

const router = express.Router();

router.get("/", onlyAuthenticatedAccess, UserController.getCurrent);
router.get("/list", onlyAuthenticatedAccess, onlyAdminAccess, UserController.getUsers);
router.post("/", onlyAuthenticatedAccess, UserController.create);
router.put("/", onlyAuthenticatedAccess, UserController.update);
router.delete("/", onlyAuthenticatedAccess, UserController.delete);
router.post("/login", UserController.login);

export default router;
