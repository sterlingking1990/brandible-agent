import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PendingOrdersTable from '@/app/components/PendingOrdersTable';
import LogoutButton from '@/app/components/LogoutButton';

export const revalidate = 0; // Force dynamic rendering

// Define a type for our joined data structure for type safety
type PendingPurchase = {
  id: string;
  purchased_at: string;
  quantity: number;
  total_coins: number;
  status: string;
  products: {
    name: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};

async function getPendingPurchases(supabase: any) {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      purchased_at,
      quantity,
      total_coins,
      status,
      products (name),
      profiles!left!purchases_buyer_id_fkey (full_name)
    `)
    .eq('status', 'shipped')
    .order('purchased_at', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }
  return data as PendingPurchase[];
}

export default async function AgentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const purchases = await getPendingPurchases(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Agent Dashboard: Pending Orders</h1>
      <PendingOrdersTable initialPurchases={purchases} />
    </main>
  );
}