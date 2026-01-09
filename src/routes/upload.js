import express from "express";
import { Authentication } from "../middleware/auth.js";
import multer from "multer";
import scan from "../controllers/scan.js";

const router=express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload",Authentication,upload.single("file"),scan.uploadBillController);
router.get("/",Authentication,scan.getBillsController);
export default router;
