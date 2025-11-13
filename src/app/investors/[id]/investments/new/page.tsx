
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewInvestmentPage({ params }) {
  const [amount, setAmount] = useState('');
  const [investorLevelId, setInvestorLevelId] = useState('');
  const [investmentDate, setInvestmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [investorLevels, setInvestorLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [investorId, setInvestorId] = useState('');
  const supabase = createClient();
  const router = useRouter();

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setInvestorId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Fetch investor levels on component mount
  useEffect(() => {
    if (!investorId) return; // Wait for investorId to be resolved
    
    const fetchInvestorLevels = async () => {
      try {
        const { data, error } = await supabase
          .from('investor_levels')
          .select('id, role_name, interest_factor')
          .order('role_name');

        if (error) {
          console.error('Error fetching investor levels:', error);
          setError('Failed to load investor levels. Please contact support.');
        } else {
          setInvestorLevels(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load investor levels. Please contact support.');
      } finally {
        setLoadingLevels(false);
      }
    };

    fetchInvestorLevels();
  }, [investorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validation
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid investment amount.');
      setLoading(false);
      return;
    }

    if (investorLevels.length > 0 && !investorLevelId) {
      setError('Please select an investor level.');
      setLoading(false);
      return;
    }

    try {
      // For now, use the basic create_investment function until enhanced version is deployed
      const { data, error } = await supabase.rpc('create_investment_enhanced', {
        p_investor_id: investorId,
        p_amount: Number(amount),
      });

      if (error) {
        throw error;
      }

      // If investor level was selected, update it separately
      if (investorLevelId) {
        const { error: levelError } = await supabase
          .from('investors')
          .update({ level_id: investorLevelId })
          .eq('id', investorId);
        
        if (levelError) {
          console.warn('Failed to update investor level:', levelError);
        }
      }

      setMessage('Investment created successfully!');
      setAmount('');
      setInvestorLevelId('');
      setNotes('');
      setInvestmentDate(new Date().toISOString().split('T')[0]);
      
      // Add a small delay before redirect to ensure data is saved
      setTimeout(() => {
        router.push(`/investors/${investorId}`);
        router.refresh(); // Force a refresh of the page
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!investorId || loadingLevels) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Add New Investment</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">
            {!investorId ? 'Loading...' : 'Loading investor levels...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Investment</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investment Amount */}
          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Investment Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              placeholder="Enter investment amount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Investor Level */}
          {investorLevels.length > 0 && (
            <div>
              <label htmlFor="investorLevel" className="block text-gray-700 text-sm font-bold mb-2">
                Investor Level <span className="text-red-500">*</span>
              </label>
              <select
                id="investorLevel"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                value={investorLevelId}
                onChange={(e) => setInvestorLevelId(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select investor level...</option>
                {investorLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.role_name} (Interest Factor: {(level.interest_factor * 100).toFixed(2)}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Investment Date */}
          <div>
            <label htmlFor="investmentDate" className="block text-gray-700 text-sm font-bold mb-2">
              Investment Date
            </label>
            <input
              type="date"
              id="investmentDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              value={investmentDate}
              onChange={(e) => setInvestmentDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any notes about this investment..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating Investment...' : 'Create Investment'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/investors/${investorId}`)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* No Investor Levels Warning */}
        {investorLevels.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> No investor levels found. You may need to create investor levels first in the system settings.
            </p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
