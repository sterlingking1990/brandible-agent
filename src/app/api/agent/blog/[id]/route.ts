import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: post, error } = await supabase.rpc('get_blog_post_for_agent', {
      p_post_id: id,
    });

    if (error) {
      console.error(`Error fetching blog post with ID ${id} for agent:`, error);
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(`Error in GET /api/agent/blog/${id}:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
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

    const { data: updatedPost, error } = await supabase.rpc('update_blog_post', {
      p_post_id: id,
      p_title: title,
      p_content: content,
      p_cover_image_url: cover_image_url,
    });

    if (error) {
      console.error(`Error updating blog post with ID ${id}:`, error);
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error(`Error in PUT /api/agent/blog/${id}:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Unauthorized attempt to delete blog post:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    }

    const { error } = await supabase.rpc('delete_blog_post', {
      p_post_id: id,
    });

    if (error) {
      console.error(`Error deleting blog post with ID ${id}:`, error);
      if (error.message.includes('Only agents can delete blog posts.')) {
        return NextResponse.json({ error: 'Forbidden: Only agents can delete blog posts' }, { status: 403 });
      }
      if (error.message.includes('Blog post not found or not authorized to delete.')) {
        return NextResponse.json({ error: 'Not Found: Blog post not found or not authorized' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
    }

    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error(`Error in DELETE /api/agent/blog/${id}:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
