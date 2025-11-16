import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.rpc('delete_poll', {
      p_poll_id: id,
    });

    if (error) {
      console.error(`Error deleting poll with ID ${id}:`, error);
      return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
    }

    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error(`Error in DELETE /api/agent/polls/${id}:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
