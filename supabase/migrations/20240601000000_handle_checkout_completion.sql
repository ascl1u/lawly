-- Create a stored procedure to handle checkout completion atomically
CREATE OR REPLACE FUNCTION handle_checkout_completion(
  p_user_id UUID,
  p_customer_id TEXT,
  p_subscription_id TEXT,
  p_session_id TEXT,
  p_price_id TEXT,
  p_tier TEXT,
  p_analysis_limit INTEGER,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Begin transaction
  BEGIN
    -- Update subscription record
    UPDATE subscriptions
    SET 
      stripe_customer_id = p_customer_id,
      stripe_subscription_id = p_subscription_id,
      stripe_checkout_session_id = p_session_id,
      status = 'active',
      price_id = p_price_id,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      cancel_at_period_end = FALSE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- If no subscription record exists, insert one
    IF NOT FOUND THEN
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        status,
        price_id,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        p_customer_id,
        p_subscription_id,
        p_session_id,
        'active',
        p_price_id,
        p_current_period_start,
        p_current_period_end,
        FALSE,
        NOW(),
        NOW()
      );
    END IF;
    
    -- Update user tier and analysis limit
    UPDATE users
    SET 
      tier = p_tier,
      analysis_limit = p_analysis_limit,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return success result
    result = jsonb_build_object(
      'success', TRUE,
      'user_id', p_user_id,
      'tier', p_tier,
      'analysis_limit', p_analysis_limit,
      'subscription_id', p_subscription_id,
      'current_period_end', p_current_period_end
    );
    
    -- Commit transaction
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on error
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to function
COMMENT ON FUNCTION handle_checkout_completion IS 'Handles checkout completion by atomically updating subscription and user records'; 