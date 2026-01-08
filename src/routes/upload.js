import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import { Authentication } from "../middleware/auth.js";
import multer from "multer";
const router=express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/",Authentication,upload.single("file"),async(req,res,next)=>{
    try {
    const file=req.file;
    const user_id=req.user.id;
    const filename=`${user_id}/${Date.now()}.jpg`;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
    const {data,error}=await supabase.storage
    .from("bills")
    .upload(filename,file.buffer,
        {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
        }
    )
    if (error) {
    throw error;
  }
  const {err}=await supabase
  .from("bills")
  .insert(
    [{
    user_id,
    link:data.path
  }]);
  if(err){
    throw err;
  }
   res.status(201).json({
        message: "Bill uploaded successfully",
        path: data.path,
      });
  }
    catch (error) {
        next(error);
    }
});
export default router;
