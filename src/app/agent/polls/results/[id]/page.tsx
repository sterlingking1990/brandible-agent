"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type PollOptionResult = {
  id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
};

type PollDetails = {
  id: string;
  question: string;
  description?: string;
  created_at: string;
  closes_at?: string;
  status: string;
  author_id: string;
  author_full_name: string;
  options: PollOptionResult[];
  total_votes: number;
};

export default function PollResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pollDetails, setPollDetails] = useState<PollDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPollDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agent/polls/${id}/results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PollDetails = await response.json();
      setPollDetails(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollDetails();
  }, [id]);

  const handleClosePoll = async () => {
    if (!confirm('Are you sure you want to close this poll? This will prevent further voting.')) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/agent/polls/${id}/close`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchPollDetails();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p>Loading poll results...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p className="text-red-500">Error loading poll results: {error}</p>
        <Link href="/agent/polls" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Poll List
        </Link>
      </main>
    );
  }

  if (!pollDetails) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50">
        <p className="text-gray-700">Poll not found.</p>
        <Link href="/agent/polls" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Poll List
        </Link>
      </main>
    );
  }

  const isPollOpen = pollDetails.status === 'open' && (!pollDetails.closes_at || new Date(pollDetails.closes_at) > new Date());

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Poll Results</h1>
          <Link href="/agent/polls" className="text-indigo-600 hover:text-indigo-500 font-medium">
            &larr; Back to Poll List
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{pollDetails.question}</h2>
          {pollDetails.description && <p className="text-gray-600 mb-6">{pollDetails.description}</p>}
          
          <div className="flex gap-6 mb-6 text-sm">
            <p className="text-gray-600">
              Status: <span className={`font-semibold ${isPollOpen ? 'text-green-600' : 'text-red-600'}`}>{pollDetails.status}</span>
            </p>
            <p className="text-gray-600">
              Closes: <span className="font-medium text-gray-800">{pollDetails.closes_at ? new Date(pollDetails.closes_at).toLocaleString() : 'N/A'}</span>
            </p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-baseline mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Votes Breakdown</h3>
              <span className="text-sm font-medium text-gray-600">{pollDetails.total_votes} total {pollDetails.total_votes === 1 ? 'vote' : 'votes'}</span>
            </div>
            
            {pollDetails.options && pollDetails.options.length > 0 ? (
              <div className="space-y-5">
                {pollDetails.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-800 font-medium">{option.option_text}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-10 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${option.percentage}%` }}
                      />
                      <div className="absolute top-0 left-0 w-full h-full flex items-center px-3">
                        <span className="text-sm font-medium text-gray-700">
                          {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No options or votes recorded yet.</p>
            )}
          </div>

          {isPollOpen && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleClosePoll}
                disabled={submitting}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Closing Poll...' : 'Close Poll Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}