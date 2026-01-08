import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import { Authentication } from "../middleware/auth.js";
import multer from "multer";
import { scanBill } from "../services/ocr.js";
const router=express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/upload",Authentication,upload.single("file"),async(req,res,next)=>{
    try {
    const file=req.file;
    const user_id=req.user.id;
    const filename=`${user_id}/${Date.now()}.jpg`;
    if (!file){
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
  const { data: imageData, downloaderror } = await supabase.storage
  .from("bills")
  .download(data.path);

if (downloaderror) throw downloaderror;

const imageBuffer = Buffer.from(await imageData.arrayBuffer());
const txt=await scanBill(imageBuffer)
   res.status(201).json({
        message: "Bill uploaded and scanned successfully",
     
        txt
      });
  }
    catch (error) {
        next(error);
    }
});

router.get("/", Authentication, async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const { data: bills, error } = await supabase
      .from("bills")
      .select("id, user_id, link, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const billsWithImages = bills.map((bill) => {
      const { data } = supabase.storage
        .from("bills")
        .getPublicUrl(bill.link);

      return {
        id: bill.id,
        created_at: bill.created_at,
        imageUrl: data.publicUrl,
      };
    });

    res.json({ bills: billsWithImages });
  } catch (err) {
    next(err);
  }
});
export default router;
