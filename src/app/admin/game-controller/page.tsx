import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import GameControllerForm from './game-controller-form';
import GameWordsManager from './game-words-manager';

export const revalidate = 0; // Force dynamic rendering

async function getGameSettings(supabase: any) {
  const keys = [
    'stake_amount',
    'reward_amount',
    'max_level',
    'campaign_trigger_probability',
    'grid_columns',
    'grid_rows',
    'stages_per_level',
    'flash_duration_ms',
    'flash_gap_ms',
    'grace_time_ms',
    'min_word_length',
    'max_word_length',
    'enable_campaign_interactions',
    'enable_bet_mode',
    'enable_free_mode',
    'show_campaign_history',
    'influencer_reward_percentage'
  ];

  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', keys);

  if (error) {
    console.error('Error fetching game settings:', error);
    return {};
  }

  return data.reduce((acc: any, { key, value }: { key: string, value: any }) => {
    // If value is a string that looks like a boolean, convert it
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    acc[key] = value;
    return acc;
  }, {});
}

async function getGameWords(supabase: any) {
  const { data, error } = await supabase
    .from('game_words')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching game words:', error);
    return [];
  }

  return data;
}

export default async function GameControllerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Check if user is agent
  const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
  if (userType !== 'agent') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>Only agents can access this page.</p>
      </div>
    );
  }

  const [initialSettings, initialWords] = await Promise.all([
    getGameSettings(supabase),
    getGameWords(supabase),
  ]);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Game Controller</h1>
          <p className="mt-2 text-lg text-gray-600">
            Configure dynamic values for the Brandible Game mechanics, timings, and rewards.
          </p>
        </header>

        <section className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Global Settings
            </h2>
            <GameControllerForm initialSettings={initialSettings} />
          </div>

          <div className="pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Word Management
            </h2>
            <GameWordsManager initialWords={initialWords} />
          </div>
        </section>
      </div>
    </main>
  );
}
