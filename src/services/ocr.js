import {createWorker} from "tesseract.js";
import {GoogleGenAI} from '@google/genai';
import { supabase } from "../utils/supabaseClient.js";
import { addPersonalTransactionService,
  addGroupTransactionService
 } from "./transaction.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const scanBill = async(imageBuffer) => {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageBuffer  );
    const dt = ret.data.text;
    await worker.terminate();
    return dt;
};

export const organizeScannedBill=async(txt)=>{
    const prompt=`You are an intelligent expense extraction system.
    Extract expense-related information and return a VALID JSON object ONLY.
    Rules:
    - "description" (string) is MANDATORY
    - "amount" (number) is MANDATORY
    - Amount must be numeric (no currency symbols)
    - Choose the FINAL payable amount
    - Missing fields must be null
    - Output must be STRICT JSON
    Allowed fields:
    {
    "description":string,
    "amount":number,
    "currency":string|null,
    "date":string|null,
    "merchant":string|null,
    "tax":number|null,
    "tip":number|null,
    "payment_method":string|null,
    "category":string|null
    }
    OCR TEXT:
    """
    ${txt}
    """`;

    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:[
            {
                role:"user",
                parts:[{text:prompt}]
            }],
        generationConfig:{responseMimeType:"application/json",temperature:0}
    });

    const text=response.text.trim();
    try{
        return JSON.parse(text);
    }catch{
        const match=text.match(/\{[\s\S]*\}/);
        if(!match)throw new Error("Gemini did not return valid JSON");
        return JSON.parse(match[0]);}
};


export const uploadBillService = async ({ file, user_id },groupId) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const filename = `${user_id}/${Date.now()}.jpg`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("bills")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Insert DB record
  const { error: insertError } = await supabase
    .from("bills")
    .insert([
      {
        user_id,
        link: data.path,
      },
    ]);

  if (insertError) throw insertError;

  // Download image for OCR
  const { data: imageData, error: downloadError } =
    await supabase.storage.from("bills").download(data.path);

  if (downloadError) throw downloadError;

  const imageBuffer = Buffer.from(await imageData.arrayBuffer());

  // OCR scan
  const txt = await scanBill(imageBuffer);
  const organisedTxt = await organizeScannedBill(txt);

  if(groupId){
    const { data, error } = await supabase
    .from('Group_members')
    .select('user_id')
    .eq('group_id',groupId);
    const splitAmong = data.map(item => item.user_id);
    try{
      await addGroupTransactionService({
        desc:organisedTxt.description,
        paidById:user_id,
        amount:organisedTxt.amount,
        splitAmong:splitAmong,
      },groupId);
    }catch(error){
      throw error;
    }
  }else{
    try{
        await addPersonalTransactionService({
            description:organisedTxt.description,
            userid:user_id,
            amount:Number(organisedTxt.amount),
        });
    }catch(error){
        throw error;
    }
  }
};

export const getBillsService = async (user_id) => {
  const { data: bills, error } = await supabase
    .from("bills")
    .select("id, user_id, link, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return bills.map((bill) => {
    const { data } = supabase.storage
      .from("bills")
      .getPublicUrl(bill.link);

    return {
      id: bill.id,
      created_at: bill.created_at,
      imageUrl: data.publicUrl,
    };
  });
};
