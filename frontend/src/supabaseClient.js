import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("找不到 Supabase 環境變數！請檢查 frontend/.env 檔案");
}

export const supabase = createClient(supabaseUrl, supabaseKey);