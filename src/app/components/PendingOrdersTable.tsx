'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
import RejectModal from './RejectModal';

// Define a type for our joined data structure for type safety
type PendingPurchase = {
  id: string;
  purchased_at: string;
  quantity: number;
  total_coins: number;
  status: string;
  products: {
    name: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};

interface Props {
  initialPurchases: PendingPurchase[];
}

// A client-side only component to format dates to avoid hydration errors.
function ClientSideDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleString());
  }, [dateString]);

  return <>{formattedDate}</>;
}

export default function PendingOrdersTable({ initialPurchases }: Props) {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (purchaseId: string) => {
    setLoadingId(purchaseId);
    try {
      const { data, error } = await supabase.rpc('finalize_purchase', {
        p_purchase_id: purchaseId,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      alert(`Success: ${data.message}`);
      router.refresh();

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectClick = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setRejectModalOpen(true);
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!selectedPurchaseId) return;

    setLoadingId(selectedPurchaseId);
    try {
      const { data, error } = await supabase.rpc('reject_purchase', {
  p_purchase_id: selectedPurchaseId,
  p_rejection_reason: reason,
});

if (error) {
  throw new Error(error.message);
}

if (!data?.success) {
  throw new Error(data?.message || 'Failed to reject purchase.');
}

alert(`Success: ${data.message}`);

      setRejectModalOpen(false);
      router.refresh();

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
      setSelectedPurchaseId(null);
    }
  };

  return (
    <>
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmRejection}
        loading={!!loadingId}
      />
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Order Date</th>
                <th scope="col" className="px-6 py-3">Influencer</th>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Total Coins</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No pending orders found.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <ClientSideDate dateString={purchase.purchased_at} />
                    </td>
                    <td className="px-6 py-4">
                      {purchase.profiles?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {purchase.products?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      {purchase.total_coins}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button 
                        onClick={() => handleApprove(purchase.id)}
                        disabled={!!loadingId}
                        className={`font-medium text-white rounded-md px-4 py-2 transition-all duration-150 ease-in-out 
                          ${loadingId === purchase.id 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'}`}>
                        {loadingId === purchase.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleRejectClick(purchase.id)}
                        disabled={!!loadingId}
                        className={`font-medium text-white rounded-md px-4 py-2 transition-all duration-150 ease-in-out 
                          ${loadingId === purchase.id 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'}`}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
