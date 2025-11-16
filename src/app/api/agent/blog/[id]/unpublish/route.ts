import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: unpublishedPost, error } = await supabase.rpc('unpublish_blog_post', {
      p_post_id: id,
    });

    if (error) {
      console.error(`Error unpublishing blog post with ID ${id}:`, error);
      return NextResponse.json({ error: 'Failed to unpublish blog post' }, { status: 500 });
    }

    return NextResponse.json(unpublishedPost);
  } catch (error: any) {
    console.error(`Error in POST /api/agent/blog/${id}/unpublish:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
