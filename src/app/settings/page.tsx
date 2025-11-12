import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SettingsForm from './settings-form';

export const revalidate = 0; // Force dynamic rendering

async function getSettings(supabase) {
  const { data, error } = await supabase.from('app_settings').select('key, value');
  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  const settings = data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});

  return {
    referral_rewards: settings.referral_rewards || { inviter_reward: 500, invitee_bonus: 250 },
    referral_reward_split: settings.referral_reward_split || { referrer: 0.10, referee: 0.90 },
    cashout_limit: settings.cashout_limit || { limit: 10000 },
    coin_base_value_usd: settings.coin_base_value_usd || { value: 0.01 },
    platform_commission_percentage: settings.platform_commission_percentage || { value: 0.20 },
  };
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const settings = await getSettings(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Application Settings</h1>
      <SettingsForm currentSettings={settings} />
    </main>
  );
}