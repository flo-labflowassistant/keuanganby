import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = 'https://awrvbjezmfexucajsmyr.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key || '');

async function testInsert() {
    // 1. Get a valid category
    const { data: cat } = await supabase.from('categories').select('id').limit(1).single();
    if (!cat) return console.log('No categories found');

    // 2. Try inserting without account_id
    const { data, error } = await supabase.from('transactions').insert({
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Test Error',
        amount: 100,
        type: 'expense',
        category_id: cat.id
    });

    console.log('Result:', data);
    if (error) {
        console.error('Error:', error);
    }
}

testInsert();
