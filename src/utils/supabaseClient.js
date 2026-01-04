import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseUrl=SUPABASE_URL;
const supabaseKey=SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}
export const supabase = createClient(supabaseUrl, supabaseKey);
