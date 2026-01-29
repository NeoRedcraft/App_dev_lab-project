import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://kqevtrpejsujjgidpngy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZXZ0cnBlanN1ampnaWRwbmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTQ5MzksImV4cCI6MjA4NTE5MDkzOX0.70QEGeS6BahwzOer7QAczeNqETkcbgvDTCUfTEuM8dw'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)