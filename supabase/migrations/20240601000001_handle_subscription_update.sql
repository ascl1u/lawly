-- Create a stored procedure to handle subscription updates atomically
CREATE OR REPLACE FUNCTION handle_subscription_update(
  p_user_id UUID,
  p_subscription_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_cancel_at_period_end BOOLEAN,
  p_price_id TEXT,
  p_tier TEXT,
  p_analysis_limit INTEGER
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Begin transaction
  BEGIN
    -- Update subscription record
    UPDATE subscriptions
    SET 
      status = p_status,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      cancel_at_period_end = p_cancel_at_period_end,
      price_id = p_price_id,
      updated_at = NOW()
    WHERE stripe_subscription_id = p_subscription_id;
    
    -- If subscription is not canceled at period end and is active/trialing, update user tier
    IF NOT p_cancel_at_period_end AND (p_status = 'active' OR p_status = 'trialing') THEN
      UPDATE users
      SET 
        tier = p_tier,
        analysis_limit = p_analysis_limit,
        updated_at = NOW()
      WHERE id = p_user_id;
    END IF;
    
    -- Return success result
    result = jsonb_build_object(
      'success', TRUE,
      'user_id', p_user_id,
      'subscription_id', p_subscription_id,
      'status', p_status,
      'cancel_at_period_end', p_cancel_at_period_end,
      'tier', p_tier,
      'analysis_limit', p_analysis_limit,
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
COMMENT ON FUNCTION handle_subscription_update IS 'Handles subscription updates by atomically updating subscription and user records'; 