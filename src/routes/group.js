import express from "express";
import GroupController from "../controllers/group.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/new",Authentication,GroupController.createGroup);

export default router;
