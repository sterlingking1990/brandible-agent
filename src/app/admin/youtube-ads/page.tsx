import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import YouTubeAdsList from './youtube-ads-list';
import { getYouTubeAds } from './actions';

export const revalidate = 0;

export default async function YouTubeAdsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Check if user is agent
  const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
  if (userType !== 'agent') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>Only agents can access this page.</p>
      </div>
    );
  }

  const ads = await getYouTubeAds();

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">YouTube Ad Control</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage Google Ads IDs for YouTube campaigns. Only pending ads can be updated.
          </p>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">YouTube Ads</h2>
          </div>
          <div className="p-0">
            <YouTubeAdsList ads={ads} />
          </div>
        </section>
      </div>
    </main>
  );
}
