import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqnmgstlxmfkrnjyehkk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbm1nc3RseG1ma3JuanllaGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Njc0NzEsImV4cCI6MjA4MDM0MzQ3MX0.55EfKeygCMwA9tQANFiHX0Kdl_EyzTEo98vMDV72amM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);