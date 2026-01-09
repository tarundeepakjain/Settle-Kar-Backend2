import express from "express";
import GroupController from "../controllers/group.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/new",Authentication,GroupController.createGroup);
router.post("/join",Authentication,GroupController.joinGroup);
router.get("/fetch",Authentication,GroupController.fetchAllGroups);
router.get("/fetch/:groupId",Authentication,GroupController.fetchGroup);
router.delete("/leave",Authentication,GroupController.leaveGroup);
router.delete("/remove",Authentication,GroupController.removeMember);
router.post("/change",Authentication,GroupController.changeActivestatus);
export default router;
