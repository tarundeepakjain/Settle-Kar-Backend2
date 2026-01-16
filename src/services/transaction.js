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

export const addGroupTransactionService = async(req,groupId)=>{
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

    if(transactionError) throw transactionError;
    const share = Number((req.amount / req.splitAmong.length).toFixed(2));

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

    for (const userId of req.splitAmong) {
       // if(userId!==req.paidById){
        const { error:partialTransactionError } = await supabase
        .from('Group_transactions')
        .insert({ 
        transaction_id: transactionData.id,
        user_id: userId, 
        to_pay_amount:share,
        to_pay_id:req.paidById,
        })
        if(partialTransactionError) throw partialTransactionError;
       // }
    }
    if(error) throw error;
    
};

export const deleteGroupTransactionService = async(transaction,userData) => {
    const tid=transaction.id;
    const groupId=transaction.group_id;
    const payer=transaction.created_by;
    const amount=transaction.amount;


    console.log(userData);
    
    for (const row of userData){
        const {user_id,to_pay_amount} = row;
        const add = to_pay_amount;
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
            net_balance: memberRow.net_balance + add,
        })
        .eq("user_id", user_id)
        .eq("group_id", groupId);
        if (updateError) throw updateError;
    }
    const { data: memberRow, error: fetchError } = await supabase
    .from("Group_members")
    .select("net_balance")
    .eq("user_id", payer)
    .eq("group_id", groupId)
    .single();

    if (fetchError) throw fetchError;
    const { error: updateError } = await supabase
    .from("Group_members")
    .update({
        net_balance: memberRow.net_balance - amount,
    })
    .eq("user_id", payer)
    .eq("group_id", groupId);
    if (updateError) throw updateError;
};

export const getGroupTransactionService = async(groupId)=>{
    const {data,error} = await supabase
    .from('Transactions')
    .select(`*,
            Profiles(
                name
            )
        `)
    .eq('group_id',groupId)
    .order('created_at',{ascending:false});

    if (error) throw error;
    return data;
};

export const getUserGroupBalancesService = async (groupId, userId) => {
  /**
   * Step 1: Fetch only transactions involving this user
   */
    const { data: transactions, error } = await supabase
    .from("Group_transactions")
    .select(`
        user_id,
        to_pay_id,
        to_pay_amount,
        Transactions!inner (
        group_id
        )
    `)
    .eq("Transactions.group_id", groupId)
    .or(`user_id.eq.${userId},to_pay_id.eq.${userId}`);


  if (error) throw error;

  /**
   * Step 2: Calculate relative balances
   */
  const balanceMap = {};

  for (const tx of transactions) {
    const amount = Number(tx.to_pay_amount);

    // Case 1: Other user owes YOU
    if (tx.to_pay_id === userId) {
      const otherUser = tx.user_id;
      if (!balanceMap[otherUser]) balanceMap[otherUser] = 0;
      balanceMap[otherUser] -= amount;
    }

    // Case 2: YOU owe other user
    if (tx.user_id === userId) {
      const otherUser = tx.to_pay_id;
      if (!balanceMap[otherUser]) balanceMap[otherUser] = 0;
      balanceMap[otherUser] += amount;
    }
  }

  /**
   * Step 3: Fetch names
   */
  const otherUserIds = Object.keys(balanceMap);

  const { data: users, error: userError } = await supabase
    .from("Profiles")
    .select("id, name")
    .in("id", otherUserIds);

  if (userError) throw userError;

  const userMap = {};
  users.forEach(u => (userMap[u.id] = u.name));

  /**
   * Step 4: Shape response
   */
  const balances = otherUserIds.map(uid => ({
    userId: uid,
    name: userMap[uid] || "Unknown",
    netBalance: Number(balanceMap[uid].toFixed(2)),
  }));

  return {
    success: true,
    balances,
  };
};
