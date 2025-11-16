import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, cover_image_url } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data: newPost, error } = await supabase.rpc('create_blog_post', {
      p_title: title,
      p_content: content,
      p_cover_image_url: cover_image_url,
    });

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/agent/blog/create:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
