import { 
    uploadBillService,
    getBillsService
} from "../services/ocr.js";
import{
    addGroupTransactionService,
    addPersonalTransactionService
} from "../services/transaction.js";

class Scan{
    uploadBillController = async(req,res,next)=>{
        try {
            const file = req.file;
            const user_id = req.user.id;
            const groupId = req.body.group_id ?? null;

            const txt = await uploadBillService({ file, user_id },groupId);

            res.status(201).json({
            message: "Bill uploaded and scanned successfully",
            txt,
            });
        } catch (error) {
            next(error);
        }
    };
    getBillsController = async(req,res,next)=>{
        try {
            const user_id = req.user.id;

            const bills = await getBillsService(user_id);

            res.json({ bills });
        } catch (error) {
            next(error);
        }
    };
    addTransaction = async(req,res,next)=>{

    }
};

export default new Scan();