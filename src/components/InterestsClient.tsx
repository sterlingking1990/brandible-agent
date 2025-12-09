"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

// Define the type for an Interest item
interface Interest {
  id: string;
  interest_name: string;
  is_active: boolean;
  created_at: string;
}

interface InterestsClientProps {
  initialInterests: Interest[];
}

export function InterestsClient({ initialInterests }: InterestsClientProps) {
  const [interests, setInterests] = useState<Interest[]>(initialInterests);
  const [newInterestName, setNewInterestName] = useState('');
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function fetchInterests() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('interest_name', { ascending: true });

    if (error) {
      setError(error.message);
      console.error('Error fetching interests:', error.message);
    } else {
      setInterests(data || []);
    }
    setLoading(false);
  }

  const addInterests = async () => {
    if (!newInterestName.trim()) {
      setError('Interest name(s) cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);

    const interestNames = newInterestName.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (interestNames.length === 0) {
      setError('Interest name(s) cannot be empty.');
      setLoading(false);
      return;
    }

    const newInterests = interestNames.map(name => ({ interest_name: name }));

    const { data, error } = await supabase
      .from('interests')
      .insert(newInterests)
      .select();

    if (error) {
      setError(error.message);
      console.error('Error adding interests:', error.message);
    } else {
      setInterests([...interests, ...data]);
      setNewInterestName('');
    }
    setLoading(false);
  };

  const updateInterest = async () => {
    if (!editingInterest || !editingInterest.interest_name.trim()) {
      setError('Interest name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('interests')
      .update({ interest_name: editingInterest.interest_name.trim(), is_active: editingInterest.is_active })
      .eq('id', editingInterest.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      console.error('Error updating interest:', error.message);
    } else {
      setInterests(interests.map(int => (int.id === data.id ? data : int)));
      setEditingInterest(null);
    }
    setLoading(false);
  };

  const deleteInterest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interest? This cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('interests')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      console.error('Error deleting interest:', error.message);
    } else {
      setInterests(interests.filter(int => int.id !== id));
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.15a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Add New Interest Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Interest</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Art, Tech, Fashion"
            value={newInterestName}
            onChange={(e) => setNewInterestName(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={addInterests}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading || !newInterestName.trim()}
          >
            {loading ? 'Adding...' : 'Add Interest(s)'}
          </button>
        </div>
      </div>

      {/* Interests List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Interests</h3>
        {loading && <p className="text-gray-600">Loading...</p>}
        {!loading && interests.length === 0 && <p className="text-gray-600">No interests found. Add one above!</p>}
        
        {!loading && interests.length > 0 && (
          <ul className="space-y-4">
            {interests.map((interest) => (
              <li key={interest.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                {editingInterest?.id === interest.id ? (
                  <div className="flex-1 flex items-center space-x-3">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingInterest.interest_name}
                      onChange={(e) => setEditingInterest({ ...editingInterest, interest_name: e.target.value })}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingInterest.is_active}
                        onChange={(e) => setEditingInterest({ ...editingInterest, is_active: e.target.checked })}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <button
                      onClick={updateInterest}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
                      disabled={loading || !editingInterest.interest_name.trim()}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingInterest(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-400"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`text-lg font-medium ${interest.is_active ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      {interest.interest_name} {interest.is_active ? '' : '(Inactive)'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingInterest(interest)}
                        className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z"/></svg>
                      </button>
                      <button
                        onClick={() => deleteInterest(interest.id)}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5 0a1 1 0 110 2v6a1 1 0 110-2V8z" clipRule="evenodd"/></svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
