import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: pollDetails, error } = await supabase.rpc('get_poll_details_for_agent', {
      p_poll_id: id,
    });

    if (error) {
      console.error(`Error fetching poll details for ID ${id}:`, error);
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch poll details' }, { status: 500 });
    }

    return NextResponse.json(pollDetails);
  } catch (error: any) {
    console.error(`Error in GET /api/agent/polls/${id}/results:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
