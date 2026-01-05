import express from "express";
import TransactionController from "../controllers/transaction.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/add-personal",Authentication,TransactionController.addPersonalTransaction);
export default router;
