import { supabase } from "../utils/supabaseClient";

exports.addPersonalTransaction = async(req) =>{
    const {error} = await supabase.from('Transactions').insert({
        description:req.description,
        created_by:req.created_by,
    })
    if(error) throw error;
};

