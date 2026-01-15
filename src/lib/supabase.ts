import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://xjvjwtemjigpbvikzxwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqdmp3dGVtamlncGJ2aWt6eHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDkyMTMsImV4cCI6MjA4NDA4NTIxM30.gXXNel0xFwgCuSiGViGiyoj65nTJNOFtpzU-hXr_cfI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
