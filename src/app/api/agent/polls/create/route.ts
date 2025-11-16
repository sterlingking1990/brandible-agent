import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, description, closes_at, options } = await request.json();

    if (!question || !closes_at || !options || options.length < 2) {
      return NextResponse.json({ error: 'Question, closing date, and at least two options are required' }, { status: 400 });
    }

    const { data: newPoll, error } = await supabase.rpc('create_poll', {
      p_question: question,
      p_description: description,
      p_closes_at: closes_at,
      p_options: options,
    });

    if (error) {
      console.error('Error creating poll:', error);
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
    }

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/agent/polls/create:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
