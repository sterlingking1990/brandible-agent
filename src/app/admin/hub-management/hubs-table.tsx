'use client';

import { useState } from 'react';
import { toggleHubState } from './actions';
import { Switch } from '@/components/ui/switch';

type Hub = {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  state: string;
  created_at: string;
  owner: {
    full_name: string;
  } | null;
  member_count: number;
};

type Props = {
  initialHubs: Hub[];
};

export default function HubsTable({ initialHubs }: Props) {
  const [hubs, setHubs] = useState<Hub[]>(initialHubs);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: string) => {
    setLoadingId(id);
    const result = await toggleHubState(id, currentState);
    setLoadingId(null);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else if (result.success && result.newState) {
      setHubs(hubs.map(hub => 
        hub.id === id ? { ...hub, state: result.newState! } : hub
      ));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hub Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                State (Public/Private)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hubs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hubs found.
                </td>
              </tr>
            ) : (
              hubs.map((hub) => (
                <tr key={hub.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{hub.name}</div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">{hub.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hub.owner?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hub.industry || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hub.member_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(hub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Switch
                        checked={hub.state === 'public'}
                        onCheckedChange={() => handleToggle(hub.id, hub.state)}
                        disabled={loadingId === hub.id}
                      />
                      <span className={`text-xs font-semibold ${hub.state === 'public' ? 'text-green-600' : 'text-gray-500'}`}>
                        {hub.state.toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
