-- Savings transfer model migration.
-- Run this once in Supabase SQL Editor or with a service-role/Postgres connection.

UPDATE categories
SET
    name = 'Tabungan',
    main_category = 'Savings',
    icon = 'PiggyBank'
WHERE name IN ('General Savings', 'Tabungan');

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS transfer_group_id UUID,
    ADD COLUMN IF NOT EXISTS transfer_role TEXT;

ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_transfer_role_check;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_transfer_role_check
    CHECK (transfer_role IS NULL OR transfer_role IN ('source', 'destination'));

CREATE INDEX IF NOT EXISTS idx_transactions_transfer_group_id
    ON transactions (transfer_group_id);

WITH matched_pairs AS (
    SELECT
        source_txn.id AS source_id,
        destination_txn.id AS destination_id,
        gen_random_uuid() AS group_id,
        ROW_NUMBER() OVER (
            PARTITION BY source_txn.id
            ORDER BY destination_txn.created_at, destination_txn.id
        ) AS source_rank,
        ROW_NUMBER() OVER (
            PARTITION BY destination_txn.id
            ORDER BY source_txn.created_at, source_txn.id
        ) AS destination_rank
    FROM transactions source_txn
    JOIN accounts source_account
        ON source_account.id = source_txn.account_id
        AND source_account.name = 'Kartu Utama'
    JOIN categories savings_category
        ON savings_category.id = source_txn.category_id
        AND savings_category.main_category = 'Savings'
    JOIN transactions destination_txn
        ON destination_txn.transaction_date = source_txn.transaction_date
        AND destination_txn.amount = source_txn.amount
        AND destination_txn.category_id = source_txn.category_id
        AND destination_txn.type = 'income'
        AND destination_txn.description IN (
            'Tabungan: ' || source_txn.description,
            'General Savings: ' || source_txn.description
        )
    JOIN accounts destination_account
        ON destination_account.id = destination_txn.account_id
        AND destination_account.name = 'Kartu Tabungan'
    WHERE
        source_txn.type = 'expense'
        AND source_txn.transfer_group_id IS NULL
        AND destination_txn.transfer_group_id IS NULL
),
deduped_pairs AS (
    SELECT source_id, destination_id, group_id
    FROM matched_pairs
    WHERE source_rank = 1 AND destination_rank = 1
)
UPDATE transactions txn
SET
    transfer_group_id = pair.group_id,
    transfer_role = CASE
        WHEN txn.id = pair.source_id THEN 'source'
        ELSE 'destination'
    END
FROM deduped_pairs pair
WHERE txn.id IN (pair.source_id, pair.destination_id);
