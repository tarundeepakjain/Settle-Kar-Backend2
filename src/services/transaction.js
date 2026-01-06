import { supabase } from "../utils/supabaseClient.js";
import { validate as isUUID } from "uuid";
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

export const deleteFromTransactionService = async(tid) =>{
    const {data,error} = await supabase
    .from('Transactions')
    .delete()
    .eq('id',tid)
    .select();

    if(error) throw error;

    if(!data){
        console.log("Transaction not found.");
        return;
    }
    return data[0];
};

export const addGroupTransactionService = async(req,groupId,groupSize)=>{
    if (!isUUID(req.paidById)) {
  throw new Error(`Invalid paidById: ${req.paidById}`);
}
    const {data:transactionData,error:transactionError} = await supabase
    .from('Transactions')
    .insert({
        description:req.desc,
        created_by:req.paidById,
        amount:req.amount,
        isGroup:true,
        group_id:groupId,
    })
    .select()
    .single();
   req.splitAmong = req.splitAmong
  .filter(id => isUUID(id));
  console.log("Split among",req.splitAmong);
  console.log("Payer id:",req.paidById);
    if(transactionError) throw transactionError;
    const share = req.amount/req.splitAmong.length;

    // fetch payer balance
    const { data: payerRow, error: payerFetchError } = await supabase
    .from("Group_members")
    .select("net_balance")
    .eq("user_id", req.paidById)
    .eq("group_id", groupId)
    .single();
    if (payerFetchError) throw payerFetchError;
    // update payer balance
    const { error: payerUpdateError } = await supabase
    .from("Group_members")
    .update({
        net_balance: payerRow.net_balance + req.amount,
    })
    .eq("user_id", req.paidById)
    .eq("group_id", groupId);
    if (payerUpdateError) throw payerUpdateError;

    for (const userId of req.splitAmong) {
        const { data: row, error: fetchError } = await supabase
            .from("Group_members")
            .select("net_balance")
            .eq("user_id", userId)
            .eq("group_id", groupId)
            .single();
        if (fetchError) throw fetchError;
        const { error: updateError } = await supabase
            .from("Group_members")
            .update({
            net_balance: row.net_balance - share,
            })
            .eq("user_id", userId)
            .eq("group_id", groupId);
        if (updateError) throw updateError;
    }

    if(groupSize!==req.splitAmong.length){
        for (const userId of req.splitAmong) {
           const { error:partialTransactionError } = await supabase
           .from('Group_partial_transactions')
           .insert({ 
            transaction_id: transactionData.id,
            user_id: userId, 
            to_pay_amount:share,
            })
            if(partialTransactionError) throw partialTransactionError;
        }
        const { error } = await supabase
        .from('Group_partial_transactions')
        .update({ 
            to_pay_amount:share-req.amount,
        })
        .eq('user_id',req.paidById)
        .eq('transaction_id', transactionData.id);

        if(error) throw error;
    }
};

export const deleteGroupTransactionService = async(transaction,userData) => {
    const tid=transaction.id;
    const groupId=transaction.group_id;

    console.log(userData);
    
    if(!userData||userData.length===0){
        // Fetch all group members
        const { data: members, error: membersError } = await supabase
            .from("Group_members")
            .select("user_id, net_balance")
            .eq("group_id", groupId);

        if (membersError) throw membersError;

        const splitAmount = transaction.amount / members.length;

        for (const member of members) {
            let rollback = splitAmount;

            // payer had extra deduction earlier
            if (member.user_id === transaction.created_by) {
                rollback = splitAmount - transaction.amount;
            }

            const { error: updateError } = await supabase
                .from("Group_members")
                .update({
                    net_balance: member.net_balance + rollback,
                })
                .eq("user_id", member.user_id)
                .eq("group_id", groupId);

            if (updateError) throw updateError;
        }
        return;
    }
    for (const row of userData){
        const {user_id,to_pay_amount} = row;
        const { data: memberRow, error: fetchError } = await supabase
            .from("Group_members")
            .select("net_balance")
            .eq("user_id", user_id)
            .eq("group_id", groupId)
            .single();

        if (fetchError) throw fetchError;
        const { error: updateError } = await supabase
        .from("Group_members")
        .update({
            net_balance: memberRow.net_balance + to_pay_amount,
        })
        .eq("user_id", user_id)
        .eq("group_id", groupId);
        if (updateError) throw updateError;
    }
};

export const getGroupTransactionService = async(groupId)=>{
    const {data,error} = await supabase
    .from('Transactions')
    .select('*')
    .eq('group_id',groupId)
    .order('created_at',{ascending:false});

    if (error) throw error;
    return data;
};