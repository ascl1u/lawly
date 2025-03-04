-- Create a stored procedure to handle subscription deletion atomically
CREATE OR REPLACE FUNCTION handle_subscription_deletion(
  p_user_id UUID,
  p_subscription_id TEXT,
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
      status = 'canceled',
      cancel_at_period_end = FALSE,
      current_period_end = p_current_period_end,
      updated_at = NOW()
    WHERE stripe_subscription_id = p_subscription_id;
    
    -- Update user tier to free
    UPDATE users
    SET 
      tier = 'free',
      analysis_limit = 1,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return success result
    result = jsonb_build_object(
      'success', TRUE,
      'user_id', p_user_id,
      'subscription_id', p_subscription_id,
      'status', 'canceled',
      'tier', 'free',
      'analysis_limit', 1
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
COMMENT ON FUNCTION handle_subscription_deletion IS 'Handles subscription deletion by atomically updating subscription and user records'; 