
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import OnboardInvestorForm from './onboard-investor-form';

async function getInvestors(supabase) {
  // First, try to get investors from the investors table (properly onboarded)
  const { data: properInvestors, error: investorsError } = await supabase
    .from('investors')
    .select(`
      id,
      profiles!inner (
        id,
        full_name,
        email
      )
    `);

  // Then, get all profiles with user_type = 'investor' (including those not in investors table)
  const { data: allInvestorProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email
    `)
    .eq('user_type', 'investor');

  if (profilesError) {
    console.error('Error fetching investor profiles:', profilesError);
    return [];
  }

  // Get the IDs of investors that already exist in the investors table
  const existingInvestorProfileIds = properInvestors?.map(inv => inv.profiles.id) || [];

  // Combine both: properly onboarded investors and profile-only investors
  const combinedData = [
    // Properly onboarded investors (with investor table record)
    ...(properInvestors || []).map(inv => ({
      id: inv.id,
      profile_id: inv.profiles.id,
      profiles: {
        full_name: inv.profiles.full_name,
        email: inv.profiles.email
      },
      is_properly_onboarded: true
    })),
    // Profile-only investors (not in investors table)
    ...(allInvestorProfiles || [])
      .filter(profile => !existingInvestorProfileIds.includes(profile.id))
      .map(profile => ({
        id: profile.id, // Use profile ID as fallback
        profile_id: profile.id,
        profiles: {
          full_name: profile.full_name,
          email: profile.email
        },
        is_properly_onboarded: false
      }))
  ];

  return combinedData;
}

export default async function InvestorsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const investors = await getInvestors(supabase);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Investor Management</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Onboard New Investor</h2>
        <OnboardInvestorForm />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">All Investors</h2>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {investors.map((investor) => (
              <li key={investor.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <Link href={`/investors/${investor.is_properly_onboarded ? investor.id : investor.profile_id}`} className="hover:underline focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {investor.profiles.full_name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {investor.profiles.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {investor.is_properly_onboarded ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Onboarded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠ Needs Setup
                        </span>
                      )}
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