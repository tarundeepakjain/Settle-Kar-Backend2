import express from "express";
import GroupController from "../controllers/group.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/new",Authentication,GroupController.createGroup);
router.post("/join",Authentication,GroupController.joinGroup);
router.get("/fetch",Authentication,GroupController.fetchAllGroups);
router.get("/fetch/:groupId",Authentication,GroupController.fetchGroup);
export default router;
