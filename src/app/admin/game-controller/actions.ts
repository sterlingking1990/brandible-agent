'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateGameSettings(settings: Record<string, any>) {
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
        message: 'Only agents can update game settings' 
      };
    }

    // Update the app_settings table for each key
    for (let [key, value] of Object.entries(settings)) {
      // Convert numeric strings to numbers for proper JSON storage
      if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
        value = Number(value);
      }

      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { 
          success: false, 
          message: `Failed to update setting ${key}: ${error.message}` 
        };
      }
    }

    // Revalidate the page
    revalidatePath('/admin/game-controller');

    return { 
      success: true, 
      message: 'Game settings updated successfully!' 
    };
  } catch (err) {
    console.error('Unexpected error in updateGameSettings:', err);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
}

export async function addGameWord(formData: {
  word: string;
  category: string;
  difficulty_level: number;
}) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    if (userType !== 'agent') return { success: false, message: 'Forbidden' };

    const word = formData.word.toUpperCase().trim();
    const { error } = await supabase.from('game_words').insert({
      word,
      word_length: word.length,
      category: formData.category.toLowerCase().trim(),
      difficulty_level: formData.difficulty_level,
      is_active: true
    });

    if (error) throw error;

    revalidatePath('/admin/game-controller');
    return { success: true, message: 'Word added successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function toggleWordStatus(id: number, currentStatus: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('game_words')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/game-controller');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteGameWord(id: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('game_words')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/game-controller');
    return { success: true, message: 'Word deleted successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

