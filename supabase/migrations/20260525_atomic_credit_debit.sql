-- Atomic credit debit to prevent concurrent TOCTOU race conditions
-- Created: 2026-05-25

CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id TEXT,
  p_amount INTEGER,
  p_reason TEXT,
  p_generation_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE(new_balance INTEGER, entry_id UUID) AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_entry_id UUID;
BEGIN
  -- Lock the user's ledger rows to prevent concurrent debits
  SELECT COALESCE(SUM(delta), 0) INTO v_balance
  FROM hudforge_credit_ledger
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits: required %, available %', p_amount, v_balance;
  END IF;

  v_new_balance := v_balance - p_amount;

  INSERT INTO hudforge_credit_ledger (user_id, delta, balance_after, reason, generation_id, metadata)
  VALUES (p_user_id, -p_amount, v_new_balance, p_reason, p_generation_id, p_metadata)
  RETURNING id INTO v_entry_id;

  RETURN QUERY SELECT v_new_balance, v_entry_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION debit_credits(TEXT, INTEGER, TEXT, TEXT, JSONB) TO service_role;
