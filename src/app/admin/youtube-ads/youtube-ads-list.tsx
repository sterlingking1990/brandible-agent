'use client';

import { useState } from 'react';
import { updateYouTubeAdIds } from './actions';
import EditAdModal from './edit-ad-modal';
import { Button } from '@/components/ui/button';

export default function YouTubeAdsList({ ads: initialAds }) {
  const [ads, setAds] = useState(initialAds);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, campaignId: string, adGroupId: string, adId: string) => {
    setSavingEdit(true);
    setError(null);
    try {
      const result = await updateYouTubeAdIds(id, campaignId, adGroupId, adId);

      if (!result.success) {
        setError(result.message || 'Failed to update YouTube ad details');
      } else {
        // Update local state
        setAds(ads.map(ad =>
          ad.id === id
            ? { ...ad, campaign_id: campaignId, ad_group_id: adGroupId, ad_id: adId, status: 'active', updated_at: new Date().toISOString() }
            : ad
        ));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setSavingEdit(false);
      setEditingAd(null);
    }
  };

  const getBrandName = (ad: any) => {
    return ad.brands?.company_name || ad.brands?.profiles?.full_name || 'N/A';
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Group ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.map((ad) => (
              <tr key={ad.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{getBrandName(ad)}</div>
                  <div className="text-xs text-gray-500">{ad.customer_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ad.ad_format}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    ad.status === 'active' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ad.campaign_id || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ad.ad_group_id || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ad.ad_id || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => handleEdit(ad)}
                    disabled={ad.status !== 'pending'}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {ads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No YouTube ads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingAd && (
        <EditAdModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAd(null);
          }}
          ad={editingAd}
          onSave={handleSaveEdit}
          loading={savingEdit}
        />
      )}
    </div>
  );
}
