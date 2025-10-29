import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReportsTable from '@/app/components/ReportsTable';

export const revalidate = 0; // Force dynamic rendering

type Report = {
  id: string;
  created_at: string;
  content_id: string;
  content_type: string;
  reason: string;
  reporter: {
    full_name: string;
  } | null;
};

async function getPendingReports(supabase: any) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      created_at,
      content_id,
      content_type,
      reason,
      reporter:reporter_id (full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  return data as Report[];
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const reports = await getPendingReports(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin: Pending Reports</h1>
      <ReportsTable initialReports={reports} />
    </main>
  );
}
