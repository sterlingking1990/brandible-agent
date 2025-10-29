'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAchievement(formData) {
  const supabase = await createClient();

  const { id, ...updateData } = formData;

  const { error } = await supabase
    .from('achievement_definitions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating achievement:', error);
    return {
      message: `Error: ${error.message}`,
    };
  }

  // Revalidate the path to show the updated data
  revalidatePath('/admin/achievements');

  return {
    message: 'Successfully saved!',
  };
}
