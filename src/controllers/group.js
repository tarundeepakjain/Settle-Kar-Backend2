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

 createGroup=async(req,res)=>{
    try {
        const {group_name}=req.body;
        const created_by = req.user.id;
        if (!group_name ) {
        return res.status(400).json({
          message: "group_name and created_by are required"
        });
      }
      const { data: existingGroup } = await supabase
  .from("Groups")
  .select("id")
  .eq("group_name", group_name)
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
            group_name,
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
   };

   export default new GroupController();
