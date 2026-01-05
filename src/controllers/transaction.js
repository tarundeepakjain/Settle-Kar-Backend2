import {addPersonalTransactionService,getTransactionsService} from "../services/transaction.js"

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
            res.status(201).json(expenses);
        }catch(error){
            next(error);
        }
    };
}

export default new TransactionController();