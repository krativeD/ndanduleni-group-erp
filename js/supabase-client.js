// Supabase Client Configuration
const SUPABASE_URL = 'https://eifftlxxlcwkmfzmjpaa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SXxc4M6e53WmwtjUTI-gLg_1UXPR-NQ';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabaseClient;
