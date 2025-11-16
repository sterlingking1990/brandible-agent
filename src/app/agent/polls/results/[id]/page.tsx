"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type PollOptionResult = {
  id: string;
  option_text: string;
  votes: number;
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
      fetchPollDetails(); // Refresh details to show closed status
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
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Poll Results</h1>
          <Link href="/agent/polls" className="text-indigo-600 hover:text-indigo-500">
            &larr; Back to Poll List
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{pollDetails.question}</h2>
          {pollDetails.description && <p className="text-gray-700 mb-4">{pollDetails.description}</p>}
          <p className="text-sm text-gray-600 mb-2">
            Status: <span className={`font-medium ${isPollOpen ? 'text-green-600' : 'text-red-600'}`}>{pollDetails.status}</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Closes: {pollDetails.closes_at ? new Date(pollDetails.closes_at).toLocaleString() : 'N/A'}
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Votes Breakdown ({pollDetails.total_votes} total votes)</h3>
            {pollDetails.options && pollDetails.options.length > 0 ? (
              <div className="space-y-4">
                {pollDetails.options.map((option) => (
                  <div key={option.id} className="flex flex-col sm:flex-row sm:items-center">
                    <div className="w-full sm:w-1/3 text-gray-700 font-medium mb-1 sm:mb-0">{option.option_text}</div>
                    <div className="w-full sm:w-2/3 bg-gray-200 rounded-full h-8 flex items-center">
                      <div
                        className="bg-indigo-600 h-full rounded-full text-white text-right pr-2 flex items-center justify-end"
                        style={{ width: `${pollDetails.total_votes > 0 ? (option.votes / pollDetails.total_votes) * 100 : 0}%` }}
                      >
                        {pollDetails.total_votes > 0 ? ((option.votes / pollDetails.total_votes) * 100).toFixed(1) : 0}% ({option.votes} votes)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No options or votes recorded yet.</p>
            )}
          </div>

          {isPollOpen && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleClosePoll}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
