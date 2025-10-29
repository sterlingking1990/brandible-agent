import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CoinPackagesTable from './coin-packages-table';

export const revalidate = 0; // Force dynamic rendering

type CoinPackage = {
  id: string;
  name: string;
  coin_amount: number;
  price_usd: number;
  price_ngn: number;
  bonus_coins: number;
  is_active: boolean;
  created_at: string;
};

async function getCoinPackages(supabase: any) {
  const { data, error } = await supabase
    .from('coin_packages')
    .select('*')
    .order('price_usd', { ascending: true });

  if (error) {
    console.error('Error fetching coin packages:', error);
    return [];
  }
  return data as CoinPackage[];
}

export default async function CoinPackagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const packages = await getCoinPackages(supabase);

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Coin Package Management</h1>
        <p className="text-gray-600 mb-6">
          Manage coin packages that brands can purchase. Changes will be reflected immediately in the mobile app.
        </p>
        <CoinPackagesTable initialPackages={packages} />
      </div>
    </div>
  );
}
