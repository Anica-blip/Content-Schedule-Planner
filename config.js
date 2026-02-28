/**
 * Configuration file for 3C Content Schedule Planner
 * Supabase credentials
 */

const config = {
  supabase: {
    url: typeof process !== 'undefined' && process.env?.SUPABASE_URL 
      ? process.env.SUPABASE_URL 
      : 'https://cgxjqsbrditbteqhdyus.supabase.co',
    anonKey: typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY 
      ? process.env.SUPABASE_ANON_KEY 
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneGpxc2JyZGl0YnRlcWhkeXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTY1ODEsImV4cCI6MjA2NjY5MjU4MX0.xUDy5ic-r52kmRtocdcW8Np9-lczjMZ6YKPXc03rIG4',
    serviceKey: typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_KEY 
      ? process.env.SUPABASE_SERVICE_KEY 
      : ''
  }
};

// Export for use in other files
const SUPABASE_URL = config.supabase.url;
const SUPABASE_ANON_KEY = config.supabase.anonKey;
