import {
  addPersonalTransactionService,
  getTransactionsService,
  deleteFromTransactionService,
  addGroupTransactionService,
  deleteGroupTransactionService,
  getGroupTransactionService,
  getUserGroupBalancesService,
} from "../services/transaction.js";
import { supabase } from "../utils/supabaseClient.js";
class TransactionController {
  addPersonalTransaction = async (req, res, next) => {
    try {
      await addPersonalTransactionService({
        description: req.body.description,
        userid: req.user.id,
        amount: req.body.amount,
      });
      res.status(201).json({ message: "Personal Expense Added." });
    } catch (error) {
      next(error);
    }
  };
  addGroupTransaction = async (req, res, next) => {
    try {
      const groupSize = Number(req.params.groupSize);
      const groupId = req.params.groupId;
      const { data: grpStatus, error } = await supabase
        .from("Groups")
        .select("is_active")
        .eq("group_id", groupId)
        .single();

      if (!grpStatus) {
        return res.status(400).json({
            message:"Group is currently not active"
        })
      }
      const expense = await addGroupTransactionService(
        req.body,
        groupId
      );
      res.status(201).json({ message: "Group Expense Added." }, expense);
    } catch (error) {
      next(error);
    }
  };
  getTransactions = async (req, res, next) => {
    try {
      const data = await getTransactionsService(req.user.id);
      const expenses = data.map((t) => ({
        _id: t.id,
        category: t.isGroup ? "group" : "personal",
        amount: t.amount,
        description: t.description || "",
        date: t.created_at,
      }));
      res.status(200).json(expenses);
    } catch (error) {
      next(error);
    }
  };
  deleteTransaction = async (req, res, next) => {
    try {
      const tid = req.params.tid;
      const { data: userData, error: groupTransactionError } = await supabase
        .from("Group_transactions")
        .delete()
        .eq("transaction_id", tid)
        .select();

      const transactionData = await deleteFromTransactionService(tid);
      if (transactionData.isGroup) {
        await deleteGroupTransactionService(transactionData, userData);
      }
      res.status(200).json({ message: "Transaction deleted successfully." });
    } catch (error) {
      next(error);
    }
  };
  getGroupTransaction = async (req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const txs = await getGroupTransactionService(groupId);
      const data = txs.map((tx) => ({
        _id: tx.id,
        description: tx.description,
        amount: tx.amount,
        paidBy: {
          _id: tx.created_by,
          name: tx.Profiles?.name || null,
        },
      }));
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  getUserGroupBalances = async (req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      const data = await getUserGroupBalancesService(groupId, userId);
      return res.status(200).json({
        success: true,
        balances: data.balances,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new TransactionController();
