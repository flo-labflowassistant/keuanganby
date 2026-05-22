import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const allocations = {
    "Listrik & Air": 750000,
    "Cicilan": 699000,
    "Pulsa & Internet": 85000,
    "Belanja Supir": 286240,
    "Transportasi": 801126,
    "Uang Jalan": 600000,
    "Laundry": 90000,
    "Makan di luar / Ngopi": 500000,
    "Jalan-jalan / Rekreasi": 0,
    "Beri Orang Tua": 500000,
    "Gifts / Sumbangan": 0,
    "Skincare & Toko Oren": 0,
    "Transfer": 1100000,
    "Lainnya": 1576656,
    "Tabungan": 192984,
    "Emergency": 0,
    "Total": 5861342,
    "Monthly Salary": 5969800,
    "Freelance/Business": 0,
    "Allocated Money": 0,
    "Non-allocated Money": -84526
};

async function main() {
    for (const [name, amount] of Object.entries(allocations)) {
        const { error } = await supabase
            .from('categories')
            .update({ budget_allocation: amount })
            .eq('name', name);

        if (error) {
            console.error(`Error updating ${name}:`, error.message);
        } else {
            console.log(`Updated ${name} to ${amount}`);
        }
    }
    console.log("Done");
}

main();
