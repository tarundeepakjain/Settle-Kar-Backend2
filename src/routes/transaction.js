import express from "express";
import TransactionController from "../controllers/transaction.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/add-personal",Authentication,TransactionController.addPersonalTransaction);
router.post("/add-group",Authentication,TransactionController.addGroupTransaction);
router.get("/get-transactions",Authentication,TransactionController.getTransactions);
router.delete("/delete-transaction/:tid",Authentication,TransactionController.deleteTransaction);
export default router;
