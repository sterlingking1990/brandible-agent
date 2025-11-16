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

    const { data: publishedPost, error } = await supabase.rpc('publish_blog_post', {
      p_post_id: id,
    });

    if (error) {
      console.error(`Error publishing blog post with ID ${id}:`, error);
      return NextResponse.json({ error: 'Failed to publish blog post' }, { status: 500 });
    }

    return NextResponse.json(publishedPost);
  } catch (error: any) {
    console.error(`Error in POST /api/agent/blog/${id}/publish:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
