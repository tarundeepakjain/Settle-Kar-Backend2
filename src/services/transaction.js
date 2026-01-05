import { supabase } from "../utils/supabaseClient.js";

export const addPersonalTransaction = async(req) =>{
    const {error} = await supabase.from('Transactions').insert({
        description:req.description,
        created_by:req.userid,
        amount:req.amount,
    })
    if(error) throw error;
};

