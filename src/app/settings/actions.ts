'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateReferralRewards(newRewards: { 
  inviter_reward: number; 
  invitee_bonus: number 
}) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        message: 'Unauthorized - please log in' 
      };
    }

    // Check user claims for agent status
    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    
    if (userType !== 'agent') {
      return { 
        success: false, 
        message: 'Only agents can update settings' 
      };
    }

    // Validate input
    if (!newRewards.inviter_reward || !newRewards.invitee_bonus) {
      return { 
        success: false, 
        message: 'Invalid rewards - both values are required' 
      };
    }

    // Update the app_settings table
    const { data, error } = await supabase
      .from('app_settings')
      .update({ value: newRewards })
      .eq('key', 'referral_rewards')
      .select();

    if (error) {
      console.error('Database update error:', error);
      return { 
        success: false, 
        message: `Failed to update settings: ${error.message}` 
      };
    }

    // Revalidate the settings page to show fresh data
    revalidatePath('/settings');

    return { 
      success: true, 
      message: 'Referral rewards updated successfully!',
      data 
    };
  } catch (err) {
    console.error('Unexpected error in updateReferralRewards:', err);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
}

export async function updateCashoutLimit(newLimit: number) {
  console.log('Updating cashout limit to:', newLimit);
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return { 
        success: false, 
        message: 'Unauthorized - please log in' 
      };
    }

    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    
    if (userType !== 'agent') {
      console.log('User is not an agent. User type:', userType);
      return { 
        success: false, 
        message: 'Only agents can update settings' 
      };
    }

    if (newLimit === null || newLimit === undefined || newLimit < 0) {
      console.log('Invalid limit provided:', newLimit);
      return { 
        success: false, 
        message: 'Invalid limit - must be a positive number' 
      };
    }

    console.log('Attempting to update cashout_limit...');
    const { data, error } = await supabase
      .from('app_settings')
      .update({ value: { limit: newLimit } })
      .eq('key', 'cashout_limit')
      .select();

    if (error) {
      console.error('Database update error:', error);
      return { 
        success: false, 
        message: `Failed to update settings: ${error.message}` 
      };
    }

    if (!data || data.length === 0) {
      console.log('cashout_limit setting not found. Attempting to insert...');
      const { data: insertData, error: insertError } = await supabase
        .from('app_settings')
        .insert({ key: 'cashout_limit', value: { limit: newLimit } });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return { 
          success: false, 
          message: `Failed to create setting: ${insertError.message}` 
        };
      }
      console.log('Insert successful:', insertData);
      revalidatePath('/settings');
      return { 
        success: true, 
        message: 'Cashout limit created successfully!',
        data: insertData
      };
    }

    console.log('Update successful:', data);
    revalidatePath('/settings');

    return { 
      success: true, 
      message: 'Cashout limit updated successfully!',
      data 
    };
  } catch (err) {
    console.error('Unexpected error in updateCashoutLimit:', err);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
}