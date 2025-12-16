import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imsguyidxtmusvghenxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imltc2d1eWlkeHRtdXN2Z2hlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTM1NjQsImV4cCI6MjA4MTM4OTU2NH0.SwJHSkHOIbMyAJIMZBKSPAbd59VriUEjm2Tys4fOBpc';

export const supabase = createClient(supabaseUrl, supabaseKey);