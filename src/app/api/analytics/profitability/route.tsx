import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const {
      startDate,
      endDate,
      transactionFeeRate,
      rewardForStatus,
      rewardForSurvey,
      rewardForChallenge,
    } = body;

    // Convert dates to timestamp format (add time if not present)
    const startTimestamp = startDate.includes('T') ? startDate : `${startDate}T00:00:00Z`;
    const endTimestamp = endDate.includes('T') ? endDate : `${endDate}T23:59:59Z`;

    console.log('Calling RPC with params:', {
      start_date: startTimestamp,
      end_date: endTimestamp,
      transaction_fee_rate: transactionFeeRate,
      reward_for_status: rewardForStatus,
      reward_for_survey: rewardForSurvey,
      reward_for_challenge: rewardForChallenge,
    });

    // Use the correct function name
    const { data, error } = await supabase.rpc('analyze_gamification_profitability', {
      start_date: startTimestamp,
      end_date: endTimestamp,
      transaction_fee_rate: transactionFeeRate,
      reward_for_status: rewardForStatus,
      reward_for_survey: rewardForSurvey,
      reward_for_challenge: rewardForChallenge,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('RPC response:', data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Profitability API is running',
    timestamp: new Date().toISOString()
  });
}