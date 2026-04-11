import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HubsTable from './hubs-table';

export const revalidate = 0;

async function getHubs(supabase: any) {
  // Fetch hubs with owner name and member count
  const { data, error } = await supabase
    .from('hubs')
    .select(`
      id,
      name,
      description,
      industry,
      state,
      created_at,
      owner:profiles!owner_id (full_name),
      hub_members (count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching hubs:', error);
    return [];
  }

  return data.map((hub: any) => ({
    ...hub,
    member_count: hub.hub_members?.[0]?.count || 0
  }));
}

export default async function HubManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const hubs = await getHubs(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hub Management</h1>
        <p className="text-gray-600 mt-2">Toggle hub visibility between public and private.</p>
      </div>
      
      <HubsTable initialHubs={hubs} />
    </main>
  );
}
