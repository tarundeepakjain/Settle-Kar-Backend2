import {
    addPersonalTransactionService,
    getTransactionsService,
    deleteFromTransactionService,
    addGroupTransactionService,
    deleteGroupTransactionService
} from "../services/transaction.js"

class TransactionController{
    addPersonalTransaction = async(req,res,next)=>{
        try{
            await addPersonalTransactionService({
                description:req.body.description,
                userid:req.user.id,
                amount:req.body.amount
            });
            res.status(201).json({message:"Personal Expense Added."});
        }catch(error){
            next(error);
        }
    };
    addGroupTransaction = async(req,res,next)=>{
        try{
            const groupId = req.params.groupId;
            const groupSize = Number(req.params.groupSize);
            await addGroupTransactionService(req.body,groupId,groupSize);
            res.status(201).json({message:"Group Expense Added."});
        }catch(error){
            next(error);
        }
    };
    getTransactions = async(req,res,next)=>{
        try{
            const data = await getTransactionsService(req.user.id);
            const expenses = data.map(t => ({
            _id: t.id,
            category: t.isGroup ? "group" : "personal",
            amount: t.amount,
            description: t.description || "",
            date: t.created_at,
            }));
            res.status(200).json(expenses);
        }catch(error){
            next(error);
        }
    };
    deleteTransaction = async(req,res,next)=>{
        try{
            const tid=req.params.tid;
            const transactionData = await deleteFromTransactionService(tid);
            if(transactionData.isGroup){
                await deleteGroupTransactionService(tid,transactionData.group_id);
            }
            res.status(200).json({message:"Transaction deleted successfully."})
        }catch(error){
            next(error);
        }
    };
}

export default new TransactionController();