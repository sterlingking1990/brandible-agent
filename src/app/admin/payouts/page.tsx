import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PayoutsTable from '@/app/components/PayoutsTable';

export const revalidate = 0; // Force dynamic rendering

// Define a type for our joined data structure for type safety
type PendingPayout = {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  status: string;
  profiles: {
    full_name: string;
  } | null;
};

async function getPendingPayouts(supabase: any) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      created_at,
      amount,
      description,
      status,
      profiles (full_name)
    `)
    .eq('status', 'pending')
    .eq('reference_type', 'cashout')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }
  return data as PendingPayout[];
}

export default async function PayoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const payouts = await getPendingPayouts(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin: Pending Payouts</h1>
      <PayoutsTable initialPayouts={payouts} />
    </main>
  );
}
