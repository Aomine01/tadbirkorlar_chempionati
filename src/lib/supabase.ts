import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const DEFAULT_SUPABASE_URL = "https://orxgpsqmadgfkmeqkvpy.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeGdwc3FtYWRnZmttZXFrdnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTM0NDksImV4cCI6MjA5ODk4OTQ0OX0.WJLQsjic1uxbY5F-fu4mYOJLVfc7WfUtgPkrZoopmq0";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
