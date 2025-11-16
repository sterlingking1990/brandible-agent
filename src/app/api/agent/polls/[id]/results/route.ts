import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, context: { params: Promise<{ id: string }> | Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (pollError) {
      console.error(`Error fetching poll:`, pollError);
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Get poll options
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', id)
      .order('created_at', { ascending: true });

    if (optionsError) {
      console.error(`Error fetching options:`, optionsError);
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    }

    // Get all votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('poll_option_id')
      .eq('poll_id', id);

    if (votesError) {
      console.error(`Error fetching votes:`, votesError);
    }

    // Count votes per option
    const voteCounts: Record<string, number> = {};
    (votes || []).forEach(vote => {
      voteCounts[vote.poll_option_id] = (voteCounts[vote.poll_option_id] || 0) + 1;
    });

    const totalVotes = votes?.length || 0;

    // Build options with vote counts and percentages
    const optionsWithVotes = (options || []).map(option => {
      const voteCount = voteCounts[option.id] || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      
      return {
        id: option.id,
        option_text: option.option_text,
        vote_count: voteCount,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    // ✅ Return FLAT structure that matches the old frontend
    const result = {
      id: poll.id,
      question: poll.question,
      description: poll.description,
      created_at: poll.created_at,
      closes_at: poll.closes_at,
      status: poll.status,
      author_id: poll.author_id,
      options: optionsWithVotes,
      total_votes: totalVotes,
    };

    console.log('API Response:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in GET /api/agent/polls/${id}/results:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}