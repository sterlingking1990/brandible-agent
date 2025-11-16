import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: polls, error } = await supabase.rpc('get_all_polls');

    if (error) {
      console.error('Error fetching all polls:', error);
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }

    return NextResponse.json(polls);
  } catch (error: any) {
    console.error('Error in GET /api/agent/polls:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
