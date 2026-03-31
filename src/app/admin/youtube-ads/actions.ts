'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getYouTubeAds() {
  const supabase = await createClient();

  const { data: ads, error } = await supabase
    .from('youtube_ads')
    .select(`
      *,
      brands!brand_id (
        company_name,
        profiles!profile_id (
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching YouTube ads:', error);
    return [];
  }

  // Define status priority
  const statusPriority: Record<string, number> = {
    'active': 0,
    'pending': 1,
    'processing': 2,
    'paused': 3,
    'completed': 4,
    'error': 5
  };

  // Sort by priority, then by created_at (desc)
  return (ads || []).sort((a, b) => {
    const priorityA = statusPriority[a.status] ?? 10;
    const priorityB = statusPriority[b.status] ?? 10;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by created_at descending
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function updateYouTubeAdIds(
  id: string,
  campaign_id: string,
  ad_group_id: string,
  ad_id: string
) {
  try {
    const supabase = await createClient();

    // Check if user is agent
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    if (userType !== 'agent') return { success: false, message: 'Forbidden' };

    // Only update if status is pending
    const { data: ad, error: fetchError } = await supabase
      .from('youtube_ads')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !ad) {
      return { success: false, message: 'Ad not found' };
    }

    if (ad.status !== 'pending') {
      return { success: false, message: 'Only pending ads can be updated' };
    }

    const { error } = await supabase
      .from('youtube_ads')
      .update({
        campaign_id,
        ad_group_id,
        ad_id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/youtube-ads');
    return { success: true, message: 'YouTube ad IDs updated successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
