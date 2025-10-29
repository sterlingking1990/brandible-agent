'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyBrand(brandProfileId: string) {
  const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user?.id);
    const { data: claimCheck, error: claimError } = await supabase
    .rpc('get_my_claim', { claim: 'user_type' });
  console.log('Claim check:', claimCheck, 'Error:', claimError);

  console.log('🔍 Attempting to verify brandProfileId:', brandProfileId);

  const { data, error } = await supabase
    .from('brands')
    .update({ verification_status: 'verified' })
    .eq('profile_id', brandProfileId)
    .select();

  console.log('📊 Update response:');
  console.log('  Data:', data);
  console.log('  Error:', error);

  if (error) {
    console.error('❌ Error verifying brand:', error);
    return { success: false, message: error.message };
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No brand found or updated with profile_id:', brandProfileId);
    return { success: false, message: 'No brand found with that ID' };
  }

  console.log('✅ Brand verified:', data);
  revalidatePath('/brands');
  return { success: true, message: 'Brand verified successfully!' };
}

export async function unverifyBrand(brandProfileId: string) {
  const supabase = await createClient();

  console.log('🔍 Attempting to unverify brandProfileId:', brandProfileId);

  const { data, error } = await supabase
    .from('brands')
    .update({ verification_status: 'pending' })
    .eq('profile_id', brandProfileId)
    .select();

  console.log('📊 Update response:');
  console.log('  Data:', data);
  console.log('  Error:', error);

  if (error) {
    console.error('❌ Error un-verifying brand:', error);
    return { success: false, message: error.message };
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No brand found or updated with profile_id:', brandProfileId);
    return { success: false, message: 'No brand found with that ID' };
  }

  console.log('✅ Brand unverified:', data);
  revalidatePath('/brands');
  return { success: true, message: 'Brand verification revoked.' };
}