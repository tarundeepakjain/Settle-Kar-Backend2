import { scanBill } from "../services/ocr.js";

class Scan{
    scanBill = async(req,res,next) => {
        try{
            const resp = await scanBill();
            console.log(resp);
            res.status(200).json(resp);
        }catch(error){
            next(error);
        }
    };
};

export default new Scan();