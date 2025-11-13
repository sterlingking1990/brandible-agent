
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InvestorLevelsForm from './investor-levels-form';

async function getInvestorLevels(supabase) {
  const { data, error } = await supabase
    .from('investor_levels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching investor levels:', error);
    return [];
  }
  return data;
}

export default async function InvestorLevelsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const investorLevels = await getInvestorLevels(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Investor Levels</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Create New Level</h2>
        <InvestorLevelsForm investorLevels={investorLevels} />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">All Investor Levels</h2>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {investorLevels.map((level) => (
              <li key={level.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {level.role_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    Interest Factor: {level.interest_factor}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
