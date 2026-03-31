'use client';

import React, { useState, useMemo } from 'react';
import { updateYouTubeAdIds } from './actions';
import EditAdModal from './edit-ad-modal';
import { Button } from '@/components/ui/button';

export default function YouTubeAdsList({ ads: initialAds }) {
  const [ads, setAds] = useState(initialAds);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setIsEditModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedAdId(expandedAdId === id ? null : id);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const formatNaira = (amount: number | null) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const formatUSD = (amount: number | null) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Pagination calculations
  const totalPages = Math.ceil(ads.length / pageSize);
  const paginatedAds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ads.slice(start, start + pageSize);
  }, [ads, currentPage, pageSize]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Google IDs</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAds.map((ad) => (
              <React.Fragment key={ad.id}>
                <tr className={expandedAdId === ad.id ? 'bg-indigo-50/30' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getBrandName(ad)}</div>
                    <div className="text-xs text-gray-500">Cust ID: {ad.customer_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{ad.campaign_name || '—'}</div>
                    <div className="text-xs text-gray-500">{ad.ad_group_name || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.ad_format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      ad.status === 'active' ? 'bg-green-100 text-green-800' : 
                      ad.status === 'paused' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {ad.campaign_id ? (
                      <div className="space-y-0.5">
                        <div>C: {ad.campaign_id}</div>
                        <div>G: {ad.ad_group_id}</div>
                        <div>A: {ad.ad_id}</div>
                      </div>
                    ) : (
                      'Not set'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleExpand(ad.id)}
                      className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 text-xs font-semibold inline-flex items-center"
                    >
                      {expandedAdId === ad.id ? '▲' : '▼'} Details
                    </button>
                    <Button
                      onClick={() => handleEdit(ad)}
                      disabled={ad.status !== 'pending'}
                      className="text-xs px-3"
                    >
                      Set IDs
                    </Button>
                  </td>
                </tr>
                {expandedAdId === ad.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Video Info</h4>
                            <div className="space-y-2">
                              {ad.youtube_video_id && (
                                <a 
                                  href={`https://www.youtube.com/watch?v=${ad.youtube_video_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-indigo-600 hover:underline text-sm font-medium"
                                >
                                  Watch Video ↗
                                </a>
                              )}
                              <p className="text-sm"><span className="font-semibold">Title:</span> {ad.video_title || '—'}</p>
                              <p className="text-sm text-gray-600 italic">{ad.video_description || 'No description'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Budget</h4>
                              <p className="text-sm"><span className="font-semibold">Daily:</span> {formatNaira(ad.budget_daily)}</p>
                              <p className="text-sm"><span className="font-semibold">Total:</span> {formatNaira(ad.budget_total)}</p>
                              {ad.initial_daily_budget && (
                                <p className="text-sm"><span className="font-semibold">Initial Daily:</span> {formatNaira(ad.initial_daily_budget)}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bidding</h4>
                              <p className="text-sm font-semibold">{ad.bid_strategy || 'TARGET_CPM'}</p>
                              {ad.target_cpm && <p className="text-sm">Target CPM: {formatUSD(Number(ad.target_cpm) / 1000000)}</p>}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Schedule</h4>
                            <div className="flex gap-4">
                              <p className="text-sm"><span className="font-semibold">Start:</span> {formatDate(ad.start_date)}</p>
                              <p className="text-sm"><span className="font-semibold">End:</span> {formatDate(ad.end_date)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Targeting Parameters</h4>
                          <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                              {ad.targeting_params ? JSON.stringify(ad.targeting_params, null, 2) : 'No targeting parameters provided.'}
                            </pre>
                          </div>
                          {ad.pause_reason && (
                            <div className="mt-4 p-2 bg-red-50 rounded border border-red-100">
                              <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">Pause Reason</p>
                              <p className="text-sm text-red-700">{ad.pause_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {ads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No YouTube ads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {ads.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
          <div className="flex items-center text-sm text-gray-700">
            <span className="mr-2">Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded-md text-sm p-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="ml-4">
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * pageSize, ads.length)}</span> of{' '}
              <span className="font-semibold">{ads.length}</span> results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show a limited number of page buttons
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  (pageNum < currentPage - 1 || pageNum > currentPage + 1)
                ) {
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
