'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function InvestorManagementPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');
  setError('');

  try {
    console.log('=== Onboarding Request ===');
    console.log('Submitting:', { full_name: fullName, email });

    // Call the Edge Function
    const { data, error: edgeFunctionError } = await supabase.functions.invoke('onboard-investor', {
      body: {
        full_name: fullName,
        email: email,
      },
    });

    console.log('=== Response ===');
    console.log('Data:', data);
    console.log('Error:', edgeFunctionError);

    if (edgeFunctionError) {
      // Try to extract the actual error message from the response
      let errorDetails = 'Unknown error';
      
      // Check if there's context with response body
      if (edgeFunctionError.context && edgeFunctionError.context.body) {
        try {
          // If it's a ReadableStream, we need to read it
          if (edgeFunctionError.context.body instanceof ReadableStream) {
            const reader = edgeFunctionError.context.body.getReader();
            const { value } = await reader.read();
            const decoder = new TextDecoder();
            const responseText = decoder.decode(value);
            const errorData = JSON.parse(responseText);
            errorDetails = errorData.error || responseText;
          } else {
            // If it's already text, parse it directly
            const errorData = JSON.parse(edgeFunctionError.context.body);
            errorDetails = errorData.error || edgeFunctionError.context.body;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorDetails = edgeFunctionError.message;
        }
      } else {
        errorDetails = edgeFunctionError.message;
      }
      
      throw new Error(errorDetails);
    }

    // Check for errors in the response data
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(data.error);
    }

    console.log('=== Success ===');
    setMessage(data?.message || 'Investor invited successfully!');
    setFullName('');
    setEmail('');

  } catch (err: any) {
    console.error('=== Catch Block Error ===');
    console.error('Error:', err);
    
    let errorMessage = 'Failed to onboard investor. Please try again.';
    
    if (err.message) {
      errorMessage = err.message;
    }
    
    // Handle specific error cases
    if (err.message?.includes('Database error creating new user')) {
      errorMessage = 'System configuration issue. Please contact support.';
    } else if (err.message?.includes('already registered')) {
      errorMessage = 'An investor with this email already exists.';
    } else if (err.message?.includes('Invalid email')) {
      errorMessage = 'Please enter a valid email address.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Investor Management</h1>
      <p className="mb-6 text-gray-600">Onboard new investors by sending them an invitation to set up their account.</p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Inviting...' : 'Onboard Investor'}
          </button>
        </div>
        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700 text-sm font-semibold mb-1">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">
              💡 Check the browser console (F12) for detailed logs
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="text-yellow-900 text-sm font-semibold mb-2">🔍 Debugging Checklist:</p>
        <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
          <li>Check browser console for detailed error logs (press F12)</li>
          <li>Go to Supabase Dashboard → Edge Functions → Select function → View Logs</li>
          <li>Verify SUPABASE_SERVICE_ROLE_KEY is set in Edge Function environment variables</li>
          <li>Ensure the edge function code is deployed correctly</li>
        </ul>
      </div>
    </div>
  );
}