'use client';

import { useState } from 'react';
import { approveHubApplication, rejectHubApplication } from './actions';
import RejectModal from '@/app/components/RejectModal';

type HubApplication = {
  id: string;
  community_name: string;
  platform: string;
  group_link: string | null;
  member_count: number | null;
  niche: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

type Props = {
  initialApplications: HubApplication[];
};

export default function HubApplicationsTable({ initialApplications }: Props) {
  const [applications, setApplications] = useState<HubApplication[]>(initialApplications);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this application?')) return;
    
    setLoading(id);
    const result = await approveHubApplication(id);
    setLoading(null);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setApplications(applications.filter(app => app.id !== id));
      alert('Application approved successfully!');
    }
  };

  const handleReject = async (adminNotes: string) => {
    if (!rejectingId) return;

    setLoading(rejectingId);
    const result = await rejectHubApplication(rejectingId, adminNotes);
    setLoading(null);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setApplications(applications.filter(app => app.id !== rejectingId));
      setRejectingId(null);
      alert('Application rejected.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Influencer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Community Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform / Niche
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
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
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No pending applications found.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.community_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.platform} / {app.niche || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.member_count?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                    {app.group_link ? (
                      <a href={app.group_link} target="_blank" rel="noopener noreferrer">
                        View Group
                      </a>
                    ) : (
                      'No Link'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={!!loading}
                      className="text-green-600 hover:text-green-900 mr-4 disabled:text-gray-400"
                    >
                      {loading === app.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectingId(app.id)}
                      disabled={!!loading}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RejectModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleReject}
        loading={loading === rejectingId}
        title="Reject Hub Application"
        description="Please provide a reason for rejecting this influencer application. This will be visible to the influencer as admin notes."
      />
    </div>
  );
}
