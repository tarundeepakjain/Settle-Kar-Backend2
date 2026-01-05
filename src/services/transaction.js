import { supabase } from "../utils/supabaseClient.js";

export const addPersonalTransactionService = async(req) =>{
    const {error} = await supabase.from('Transactions').insert({
        description:req.description,
        created_by:req.userid,
        amount:req.amount,
    })
    if(error) throw error;
};

export const getTransactionsService = async(userId) =>{
    const {data,error} = await supabase
    .from('Transactions')
    .select('*')
    .eq('created_by',userId)
    .order('created_at',{ascending:false});

    if (error) throw error;
    return data;
};

