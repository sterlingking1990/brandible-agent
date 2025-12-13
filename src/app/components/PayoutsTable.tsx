'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Payout = {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  status: string;
  profiles: {
    full_name: string;
  } | null;
};

type PayoutsTableProps = {
  initialPayouts: Payout[];
};

export default function PayoutsTable({ initialPayouts }: PayoutsTableProps) {
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const supabase = createClient();

  const handleApprove = async (payoutId: string) => {
    const { error } = await supabase.rpc('approve_cashout', { transaction_id_to_approve: payoutId });

    if (error) {
      alert(`Error approving payout: ${error.message}`);
    } else {
      setPayouts(payouts.filter((payout) => payout.id !== payoutId));
      alert('Payout approved successfully!');
    }
  };

  const handleReject = async (payoutId: string) => {
    const { error } = await supabase.rpc('reject_cashout', { transaction_id_to_reject: payoutId });

    if (error) {
      alert(`Error rejecting payout: ${error.message}`);
    } else {
      setPayouts(payouts.filter((payout) => payout.id !== payoutId));
      alert('Payout rejected successfully!');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payout.profiles?.full_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payout.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payout.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payout.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleApprove(payout.id)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(payout.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}