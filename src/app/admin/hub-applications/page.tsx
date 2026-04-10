import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HubApplicationsTable from './hub-applications-table';

export const revalidate = 0;

async function getPendingHubApplications(supabase: any) {
  const { data, error } = await supabase
    .from('hub_applications')
    .select(`
      id,
      community_name,
      platform,
      group_link,
      member_count,
      niche,
      status,
      created_at,
      profiles (full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching hub applications:', error);
    return [];
  }
  return data;
}

export default async function HubApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const applications = await getPendingHubApplications(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hub Applications</h1>
        <p className="text-gray-600 mt-2">Manage influencer applications for hub communities.</p>
      </div>
      
      <HubApplicationsTable initialApplications={applications} />
    </main>
  );
}
