import { createClient } from '@/utils/supabase/server';
import { InterestsClient } from '@/components/InterestsClient';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profile?.user_type !== 'agent') {
    return redirect('/dashboard');
  }

  const { data: interests } = await supabase
    .from('interests')
    .select('*')
    .order('interest_name', { ascending: true });

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold`}>Manage Interests</h1>
      </div>
      <InterestsClient initialInterests={interests || []} />
    </div>
  );
}
