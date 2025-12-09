"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Changed from server to client

// Define the type for an Industry item
interface Industry {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface IndustriesClientProps {
  initialIndustries: Industry[];
}

// Removed async - client components cannot be async
export function IndustriesClient({ initialIndustries }: IndustriesClientProps) {
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Changed to use client-side Supabase client
  const supabase = createClient();

  async function fetchIndustries() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
      console.error('Error fetching industries:', error.message);
    } else {
      setIndustries(data || []);
    }
    setLoading(false);
  }

  const addIndustry = async () => {
    if (!newIndustryName.trim()) {
      setError('Industry name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('industries')
      .insert({ name: newIndustryName.trim() })
      .select()
      .single();

    if (error) {
      setError(error.message);
      console.error('Error adding industry:', error.message);
    } else {
      setIndustries([...industries, data]);
      setNewIndustryName('');
    }
    setLoading(false);
  };

  const updateIndustry = async () => {
    if (!editingIndustry || !editingIndustry.name.trim()) {
      setError('Industry name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('industries')
      .update({ name: editingIndustry.name.trim(), is_active: editingIndustry.is_active })
      .eq('id', editingIndustry.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      console.error('Error updating industry:', error.message);
    } else {
      setIndustries(industries.map(ind => (ind.id === data.id ? data : ind)));
      setEditingIndustry(null);
    }
    setLoading(false);
  };

  const deleteIndustry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this industry? This cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('industries')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      console.error('Error deleting industry:', error.message);
    } else {
      setIndustries(industries.filter(ind => ind.id !== id));
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Industries</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.15a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Add New Industry Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Industry</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Sustainable Fashion"
            value={newIndustryName}
            onChange={(e) => setNewIndustryName(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={addIndustry}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading || !newIndustryName.trim()}
          >
            {loading ? 'Adding...' : 'Add Industry'}
          </button>
        </div>
      </div>

      {/* Industries List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Industries</h3>
        {loading && <p className="text-gray-600">Loading...</p>}
        {!loading && industries.length === 0 && <p className="text-gray-600">No industries found. Add one above!</p>}
        
        {!loading && industries.length > 0 && (
          <ul className="space-y-4">
            {industries.map((industry) => (
              <li key={industry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                {editingIndustry?.id === industry.id ? (
                  <div className="flex-1 flex items-center space-x-3">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingIndustry.name}
                      onChange={(e) => setEditingIndustry({ ...editingIndustry, name: e.target.value })}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingIndustry.is_active}
                        onChange={(e) => setEditingIndustry({ ...editingIndustry, is_active: e.target.checked })}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <button
                      onClick={updateIndustry}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
                      disabled={loading || !editingIndustry.name.trim()}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndustry(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-400"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`text-lg font-medium ${industry.is_active ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      {industry.name} {industry.is_active ? '' : '(Inactive)'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingIndustry(industry)}
                        className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z"/></svg>
                      </button>
                      <button
                        onClick={() => deleteIndustry(industry.id)}
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