import express from "express";
import TransactionController from "../controllers/transaction.js";
import scan from "../controllers/scan.js";
import { Authentication } from "../middleware/auth.js";

const router=express.Router();

router.post("/add-personal",Authentication,TransactionController.addPersonalTransaction);
router.post("/add-group/:groupSize/:groupId/",Authentication,TransactionController.addGroupTransaction);
router.get("/get-transactions",Authentication,TransactionController.getTransactions);
router.delete("/delete-transaction/:tid",Authentication,TransactionController.deleteTransaction);
router.get("/get-group/:groupId",Authentication,TransactionController.getGroupTransaction);
router.get("/scan",scan.scanBill);
export default router;
