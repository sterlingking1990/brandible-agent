'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleHubState(id: string, currentState: string) {
  const supabase = await createClient();
  const newState = currentState === 'public' ? 'private' : 'public';

  const { error } = await supabase
    .from('hubs')
    .update({ state: newState })
    .eq('id', id);

  if (error) {
    console.error('Error toggling hub state:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/hub-management');
  return { success: true, newState };
}
