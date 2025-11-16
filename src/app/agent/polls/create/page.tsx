"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePollPage() {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']); // Start with two empty options
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    setLoading(true);
    setError(null);

    const filteredOptions = options.filter(opt => opt.trim() !== '');

    if (!question.trim() || !closesAt.trim() || filteredOptions.length < 2) {
      setError('Question, closing date, and at least two options are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/agent/polls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          description: description || null,
          closes_at: new Date(closesAt).toISOString(),
          options: filteredOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      router.push('/agent/polls');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Create New Poll</h1>
          <Link href="/agent/polls" className="text-indigo-600 hover:text-indigo-500">
            &larr; Back to Poll List
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}

          <div className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Poll Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="closesAt" className="block text-sm font-medium text-gray-700">
                Closes At
              </label>
              {/* TODO: Replace with a proper date/time picker */}
              <input
                type="datetime-local"
                id="closesAt"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poll Options</label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={`Option ${index + 1}`}
                    required={index < 2} // Require at least two options
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                Add Option
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCreatePoll}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating Poll...' : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
