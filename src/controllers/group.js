import { supabase } from "../utils/supabaseClient.js";

class GroupController{
 generateId = async () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let inviteId;
    let exists = true;

    while (exists) {
      inviteId = Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");

     const { data, error } = await supabase
  .from("Groups")
  .select("id")
  .eq("invite_id", inviteId)
  .maybeSingle();

      exists = !!data;
    }

    return inviteId;
  };

 createGroup=async(req,res,next)=>{
    try {
        const {name,description}=req.body;
        const created_by = req.user.id;
        if (!name ) {
        return res.status(400).json({
          message: "group_name and created_by are required"
        });
      }
      const { data: existingGroup } = await supabase
  .from("Groups")
  .select("id")
  .eq("group_name", name)
  .eq("created_by", created_by)
  .maybeSingle();

if (existingGroup) {
  return res.status(409).json({
    message: "Group with this name already exists"
  });
}

      const invite_id = await this.generateId(); 

      const { data, error } = await supabase
        .from("Groups")
        .insert([
          {
            group_name:name,
            description,
            created_by,
            invite_id
          }
        ])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }
    const { error: memberError } = await supabase
    .from("Group_members")
    .insert([
      {
        group_id: data.id,
        user_id:created_by,
        role: "admin",
        net_balance: 0
      }
    ]);
if (memberError) throw memberError;
      return res.status(201).json({
        message: "Group created successfully",
        group: data
      });

    } catch (error) {
        next(error);
    }
}
joinGroup=async(req,res,next)=>{
  try {
    const {inviteid}=req.body;
    if(!inviteid){
      return res.status(400).json({
        "message":"invite id is required"
      });
    }
    const user_id=req.user.id;
    const {data:group,error} =await supabase
    .from("Groups")
    .select("id")
    .eq("invite_id",inviteid)
    .maybeSingle();
if(!group){
  return res.status(404).json({
        "message":"no group found"
      });
}
if(error) throw error;
const {data:already,existerror}=await supabase
.from("Group_members")
.select("id")
.eq("group_id",group.id)
.eq("user_id",user_id)
.maybeSingle();
if(existerror) throw existerror;
if(already){
  return res.status(400).json({
    "message":"User already in group"
  });
}
 const { error: memberError } = await supabase
    .from("Group_members")
    .insert([
      {
        group_id: group.id,
        user_id:user_id,
        role: "member",
        net_balance: 0
      }
    ]);
    if(memberError) throw memberError;
    return res.status(201).json({
      "message":"succesfully joined the group"
    })
  } catch (error) {
    next(error);
  }
}

fetchAllGroups=async(req,res,next)=>{
  try {
    const user_id=req.user.id;
    const { data:groups, error } = await supabase
      .from("Group_members")
      .select(`
        role,
        net_balance,
        joined_at,
        Groups (
          id,
          group_name,
          invite_id,
          created_by,
          created_at,
          Group_members ( id )
        )
      `)
      .eq("user_id", user_id);
  if(error) throw error;
 
    return res.status(200).json({
      "message":"Groups fetched",
      groups
    });
  } catch (error) {
    next(error);
  }
}
fetchGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const user_id = req.user.id;

    // 1️⃣ Authorization
    const { data: member } = await supabase
      .from("Group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user_id)
      .maybeSingle();

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    // 2️⃣ Fetch group
    const { data: group, error } = await supabase
      .from("Groups")
      .select(`
        id,
        group_name,
        description,
        invite_id,
        is_active,
        created_by,
        created_at,
        Group_members (
          user_id,
          role,
          Profiles (
            id,
            name,
            email
          )
        )
      `)
      .eq("id", groupId)
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: "Group fetched successfully",
      group,
    });

  } catch (error) {
    next(error);
  }
};

leaveGroup=async(req,res,next)=>{
  try {
    const user_id=req.user.id;
    const {group_id}=req.body;
    const {data,error}=await supabase
    .from("Group_members")
    .select("role")
    .eq("group_id",group_id)
    .eq("user_id",user_id)
    .single();
    if(error) throw error;
    if(data.role==="admin"){
      return res.status(400).json({
        message:"Admin cannot leave group"
      })
    }
    const {error:err}=await supabase
    .from("Group_members")
    .delete()
    .eq("group_id",group_id)
    .eq("user_id",user_id)
   

    if(err) throw err;
    return res.status(200).json({
      message:"User leaved from grp"
    });

  } catch (error) {
    next(error);
  }
};

removeMember=async(req,res,next)=>{
  try {
    const admin_id=req.user.id;
    const {group_id,user_id}=req.body;
    const {data,error}=await supabase
    .from("Group_members")
    .select("role")
    .eq("group_id",group_id)
    .eq("user_id",admin_id)
    .single();
    if(error) throw error;
    if(data.role!=="admin"){
      return res.status(401).json({
        message:"only admin can remove members"
      })
    }
    const {error:err}=await supabase
    .from("Group_members")
    .delete()
    .eq("group_id",group_id)
    .eq("user_id",user_id);
    if(err) throw err;
    return res.status(200).json({
      message:"User removed from grp"
    })
  } catch (error) {
    next(error);
  }
};

changeActivestatus=async(req,res,next)=>{
try {
  const user_id=req.user.id;
  const {group_id}=req.body;
  const {data,error}=await supabase
  .from("Group_members")
  .select("role")
  .eq("group_id",group_id)
  .eq("user_id",user_id)
  .single();
   if(error) throw error;
    if(data.role!=="admin"){
      return res.status(401).json({
        message:"only admin can change group active status"
      })
    }

   const { data: group, error: groupError } = await supabase
      .from("Groups")
      .select("is_active")
      .eq("id", group_id)
      .single();

    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from("Groups")
      .update({ is_active: !group.is_active })
      .eq("id", group_id);

    if (updateError) throw updateError;
   return res.status(200).json({
    message:"Group active status changed"
   })
} catch (error) {
  next(error);
}
};

   };

   export default new GroupController();
