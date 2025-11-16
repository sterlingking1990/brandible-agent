'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Define the InvestorLevel type
type InvestorLevel = {
  id: string;
  role_name: string;
  interest_factor: number;
};

// Update the props type
type InvestorLevelsFormProps = {
  investorLevels: InvestorLevel[];
};

export default function InvestorLevelsForm({ investorLevels: initialInvestorLevels }: InvestorLevelsFormProps) {
  const [roleName, setRoleName] = useState('');
  const [interestFactor, setInterestFactor] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingLevel, setEditingLevel] = useState<InvestorLevel | null>(null); // Add type here
  const supabase = createClient();
  const router = useRouter();

  // Effect to reset form when editingLevel changes
  useEffect(() => {
    if (editingLevel) {
      setRoleName(editingLevel.role_name);
      setInterestFactor(editingLevel.interest_factor.toString());
    } else {
      setRoleName('');
      setInterestFactor('');
    }
  }, [editingLevel]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (editingLevel) {
        // Update existing level
        const { error } = await supabase.rpc('update_investor_level', {
          p_id: editingLevel.id,
          p_role_name: roleName,
          p_interest_factor: Number(interestFactor),
        });

        if (error) {
          throw error;
        }
        setMessage('Investor level updated successfully!');
        setEditingLevel(null); // Exit editing mode
      } else {
        // Create new level
        const { error } = await supabase.rpc('create_investor_level', {
          p_role_name: roleName,
          p_interest_factor: Number(interestFactor),
        });

        if (error) {
          throw error;
        }
        setMessage('Investor level created successfully!');
      }
      
      setRoleName('');
      setInterestFactor('');
      router.refresh(); // Revalidate data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (levelId: string) => {
    if (!confirm('Are you sure you want to delete this investor level?')) {
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabase.rpc('delete_investor_level', { p_id: levelId });

      if (error) {
        throw error;
      }
      setMessage('Investor level deleted successfully!');
      router.refresh(); // Revalidate data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">{editingLevel ? 'Edit Investor Level' : 'Create New Investor Level'}</h2>
        <form onSubmit={handleCreateOrUpdate}>
          <div className="mb-4">
            <label htmlFor="roleName" className="block text-gray-700 text-sm font-bold mb-2">
              Role Name
            </label>
            <input
              type="text"
              id="roleName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="interestFactor" className="block text-gray-700 text-sm font-bold mb-2">
              Interest Factor
            </label>
            <input
              type="number"
              id="interestFactor"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={interestFactor}
              onChange={(e) => setInterestFactor(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingLevel ? 'Update Level' : 'Create Level')}
            </button>
            {editingLevel && (
              <button
                type="button"
                onClick={() => setEditingLevel(null)}
                className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>
          {message && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Existing Investor Levels</h2>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {initialInvestorLevels.map((level) => (
              <li key={level.id} className="py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {level.role_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    Interest Factor: {level.interest_factor}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingLevel(level)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(level.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}