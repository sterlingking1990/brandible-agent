
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getInvestorDetails(supabase, investorId) {
  // First try to get by investor table ID (properly onboarded investors)
  let { data, error } = await supabase
    .from('investors')
    .select(`
      id,
      profile_id,
      profiles (
        full_name,
        email
      )
    `)
    .eq('id', investorId)
    .single();

  if (data) {
    return { ...data, is_properly_onboarded: true };
  }

  // If not found, try to get by profile ID (investors that need setup)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email
    `)
    .eq('id', investorId)
    .eq('user_type', 'investor')
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  if (profileData) {
    return {
      id: null, // No investor record
      profile_id: profileData.id,
      profiles: {
        full_name: profileData.full_name,
        email: profileData.email
      },
      is_properly_onboarded: false
    };
  }

  return null;
}

async function getInvestorInvestments(supabase, investorId, isProperlyOnboarded) {
  // Only fetch investments if the investor is properly onboarded (has investor table record)
  if (!isProperlyOnboarded) {
    return [];
  }

  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('investor_id', investorId)
    .order('investment_date', { ascending: false });

  if (error) {
    console.error('Error fetching investor investments:', error);
    return [];
  }
  return data;
}

export default async function InvestorDetailsPage({ params }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const { id: investorId } = resolvedParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const investor = await getInvestorDetails(supabase, investorId);
  const investments = await getInvestorInvestments(supabase, investor?.id, investor?.is_properly_onboarded);

  if (!investor) {
    return (
      <main className="bg-gray-50 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Investor Not Found</h1>
      </main>
    );
  }

  // Calculate total investment amount
  const totalInvestment = investments.reduce((sum, investment) => sum + Number(investment.amount), 0);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{investor.profiles.full_name}</h1>
        <p className="text-lg text-gray-600 mb-2">{investor.profiles.email}</p>
        
        {investor.is_properly_onboarded && (
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-600 font-medium">Total Investment</p>
              <p className="text-xl font-bold text-blue-800">
                ${totalInvestment.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <p className="text-sm text-green-600 font-medium">Number of Investments</p>
              <p className="text-xl font-bold text-green-800">
                {investments.length}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        {investor.is_properly_onboarded ? (
          <Link href={`/investors/${investor.id}/investments/new`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Add New Investment
          </Link>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Investor Setup Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This investor needs to be properly onboarded before investments can be created. Please use the "Onboard New Investor" form to complete their setup.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Investments</h2>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {investments.map((investment) => (
              <li key={investment.id} className="py-5">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Investment of ${Number(investment.amount).toLocaleString()}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          Date: {new Date(investment.investment_date).toLocaleDateString()}
                        </p>
                        {investment.notes && (
                          <p className="text-sm text-gray-500 italic">
                            Note: {investment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${Number(investment.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
