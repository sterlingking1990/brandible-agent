'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function sendPushNotification(profileId: string, title: string, body: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', profileId)
    .single();

  if (profile?.push_token) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profile.push_token,
          title,
          body,
          sound: 'default',
        }),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

export async function approveHubApplication(id: string) {
  const supabase = await createClient();

  const { data: application, error: fetchError } = await supabase
    .from('hub_applications')
    .select('profile_id, community_name')
    .eq('id', id)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const { error } = await supabase
    .from('hub_applications')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error approving hub application:', error);
    return { error: error.message };
  }

  await sendPushNotification(
    application.profile_id,
    'Hub Application Approved! 🎉',
    `Your application for "${application.community_name}" has been approved. You can now start managing your hub.`
  );

  revalidatePath('/admin/hub-applications');
  return { success: true };
}

export async function rejectHubApplication(id: string, admin_notes: string) {
  const supabase = await createClient();

  const { data: application, error: fetchError } = await supabase
    .from('hub_applications')
    .select('profile_id, community_name')
    .eq('id', id)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const { error } = await supabase
    .from('hub_applications')
    .update({ 
      status: 'rejected', 
      admin_notes, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    console.error('Error rejecting hub application:', error);
    return { error: error.message };
  }

  await sendPushNotification(
    application.profile_id,
    'Hub Application Update',
    `Your application for "${application.community_name}" was not approved at this time. Note: ${admin_notes}`
  );

  revalidatePath('/admin/hub-applications');
  return { success: true };
}
