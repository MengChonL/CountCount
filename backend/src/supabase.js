require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use .trim() to forcibly remove any leading/trailing spaces or newline characters
const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : undefined;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.trim() : undefined;

console.log('--- Checking Environment Variables ---');
console.log('URL Length:', supabaseUrl ? supabaseUrl.length : 0);
console.log('------------------------------------');

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Failed to read environment variables! Please check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
