import {addPersonalTransaction} from "../services/transaction.js"

class TransactionController{
    addPersonalTransaction = async(req,res,next)=>{
        try{
            await addPersonalTransaction(req.body);
            res.status(201).json({message:"Personal Expense Added."});
        }catch(error){
            next(error);
        }
    };
}

export default new TransactionController();