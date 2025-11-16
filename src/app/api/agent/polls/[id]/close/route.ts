import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: closedPoll, error } = await supabase.rpc('close_poll', {
      p_poll_id: id,
    });

    if (error) {
      console.error(`Error closing poll with ID ${id}:`, error);
      return NextResponse.json({ error: 'Failed to close poll' }, { status: 500 });
    }

    return NextResponse.json(closedPoll);
  } catch (error: any) {
    console.error(`Error in POST /api/agent/polls/${id}/close:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
