import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmekzaulujsgnqiwtsfz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_J9KgM91vEcB-XDDFjFNi3w_EbVVvfCb';

export const supabase = createClient(supabaseUrl, supabaseKey);
