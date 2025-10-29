import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EditAchievementForm from './edit-achievement-form';

export const revalidate = 0; // Force dynamic rendering

async function getAchievementDefinitions(supabase) {
  const { data, error } = await supabase
    .from('achievement_definitions')
    .select('*')
    .order('action_type').order('threshold');

  if (error) {
    console.error('Error fetching achievement definitions:', error);
    return [];
  }
  return data;
}

export default async function AchievementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const achievements = await getAchievementDefinitions(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Achievement Management</h1>
      <div className="space-y-8">
        {achievements.map((ach) => (
          <EditAchievementForm key={ach.id} achievement={ach} />
        ))}
      </div>
    </main>
  );
}
