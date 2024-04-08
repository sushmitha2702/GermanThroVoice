import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://smpvnyrrmdllumhcfuok.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcHZueXJybWRsbHVtaGNmdW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE0MDU0OTUsImV4cCI6MjAyNjk4MTQ5NX0.iJ6_jAjRalOXXpO8p0-u9hwdwUvwDkILr7goI6mVRg8')