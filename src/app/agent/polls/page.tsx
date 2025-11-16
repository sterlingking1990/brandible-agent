"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Poll = {
  id: string;
  question: string;
  status: string;
  closes_at: string | null;
  created_at: string;
};

export default function PollManagementPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/agent/polls');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Poll[] = await response.json();
      setPolls(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleClosePoll = async (id: string) => {
    if (!confirm('Are you sure you want to close this poll?')) return;
    try {
      const response = await fetch(`/api/agent/polls/${id}/close`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchPolls(); // Refresh list
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/agent/polls/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchPolls(); // Refresh list
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Poll Management</h1>
          <Link href="/agent/polls/create" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Create New Poll
          </Link>
        </div>

        {loading && <p>Loading polls...</p>}
        {error && <p className="text-red-500">Error loading polls: {error}</p>}

        {!loading && !error && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closes At
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {polls.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No polls found.
                    </td>
                  </tr>
                ) : (
                  polls.map((poll) => (
                    <tr key={poll.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{poll.question}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          poll.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {poll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {poll.closes_at ? new Date(poll.closes_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/agent/polls/results/${poll.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          View Results
                        </Link>
                        {poll.status === 'open' && (
                          <button
                            onClick={() => handleClosePoll(poll.id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                          >
                            Close Poll
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
