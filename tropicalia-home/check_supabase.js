require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env vars", process.env);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: orders } = await supabase.from('orders').select('*, order_items(*)');
    console.log("Orders:", JSON.stringify(orders.filter(o => o.order_number === 'ISN632' || o.id === 632 || o.order_number?.includes('632')) , null, 2));

    const { data: weekItems } = await supabase.from('weekly_menu_items').select('menu_item_id, dia');
    console.log("Week items:", weekItems);
}
main();
