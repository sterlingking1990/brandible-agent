'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type CoinPackageData = {
  name: string;
  coin_amount: number;
  price_usd: number;
  price_ngn: number;
  bonus_coins: number;
};

export async function updateCoinPackage(id: string, data: CoinPackageData) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is an agent
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'agent') {
      return { success: false, error: 'Access denied: Only agents can manage coin packages' };
    }

    // Update the coin package
    const { data: updatedPackage, error } = await supabase
      .from('coin_packages')
      .update({
        name: data.name,
        coin_amount: data.coin_amount,
        price_usd: data.price_usd,
        price_ngn: data.price_ngn,
        bonus_coins: data.bonus_coins,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating coin package:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/coin-packages');
    return { success: true, data: updatedPackage };
  } catch (error) {
    console.error('Error in updateCoinPackage:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createCoinPackage(data: CoinPackageData) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is an agent
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'agent') {
      return { success: false, error: 'Access denied: Only agents can manage coin packages' };
    }

    // Create the coin package
    const { data: newPackage, error } = await supabase
      .from('coin_packages')
      .insert({
        name: data.name,
        coin_amount: data.coin_amount,
        price_usd: data.price_usd,
        price_ngn: data.price_ngn,
        bonus_coins: data.bonus_coins,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coin package:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/coin-packages');
    return { success: true, data: newPackage };
  } catch (error) {
    console.error('Error in createCoinPackage:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function togglePackageStatus(id: string, isActive: boolean) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is an agent
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'agent') {
      return { success: false, error: 'Access denied: Only agents can manage coin packages' };
    }

    // Update the package status
    const { error } = await supabase
      .from('coin_packages')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error updating package status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/coin-packages');
    return { success: true };
  } catch (error) {
    console.error('Error in togglePackageStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
