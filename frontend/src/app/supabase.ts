/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axtcsaknntdxhzxwzvmo.supabase.co';
// The Anon Key MUST be provided in the .env file as VITE_SUPABASE_ANON_KEY for security reasons
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("VITE_SUPABASE_ANON_KEY is missing from the environment variables! Image uploads will fail. Please add it to your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey || 'MISSING_ANON_KEY');
