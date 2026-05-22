import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Setting up accounts...");
    
    // 1. Insert accounts if they don't exist
    const { data: accountsData, error: accountsError } = await supabase.from('accounts').select('id, name');
    if (accountsError) {
        console.error("Error fetching accounts:", accountsError);
        return;
    }

    let utamaId = accountsData.find(a => a.name === 'Kartu Utama')?.id;
    let tabunganId = accountsData.find(a => a.name === 'Kartu Tabungan')?.id;

    if (!utamaId) {
        console.log("Creating 'Kartu Utama'...");
        const { data: newUtama, error: err1 } = await supabase.from('accounts').insert({ name: 'Kartu Utama', type: 'Bank', balance: 0 }).select().single();
        if (err1) throw err1;
        utamaId = newUtama.id;
    } else {
        console.log("'Kartu Utama' already exists.");
    }

    if (!tabunganId) {
        console.log("Creating 'Kartu Tabungan'...");
        const { data: newTabungan, error: err2 } = await supabase.from('accounts').insert({ name: 'Kartu Tabungan', type: 'Savings', balance: 0 }).select().single();
        if (err2) throw err2;
        tabunganId = newTabungan.id;
    } else {
        console.log("'Kartu Tabungan' already exists.");
    }

    // 2. Update existing transactions to use Kartu Utama if they have no account
    console.log("Updating existing transactions to use 'Kartu Utama'...");
    const { error: updateError } = await supabase
        .from('transactions')
        .update({ account_id: utamaId })
        .is('account_id', null);
        
    if (updateError) {
        console.error("Error updating transactions:", updateError);
    } else {
        console.log("Transactions updated successfully.");
    }
}

main().catch(console.error);
