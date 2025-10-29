'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();

// SVG Icons
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

interface ActivityLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_type: string;
  action_type: string;
  entity_id: string | null;
  entity_type: string | null;
  details: any | null;
  ip_address: string | null;
  user_agent: string | null;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    email: string;
    location: string | null;
  };
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const [filterUserType, setFilterUserType] = useState<string>('all');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    const checkAuthAndFetchLogs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError('You must be logged in to view activity logs.');
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError('Failed to load user profile.');
          setLoading(false);
          return;
        }

        setUserType(profile?.user_type || null);

        // Fetch activity logs
        const { data: logsData, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (logsError) {
          throw logsError;
        }

        // Get unique user IDs from logs
        const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean))];

        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, email, location')
          .in('id', userIds);

        // Create a map of user profiles
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });

        // Merge logs with profiles
        const data = logsData?.map(log => ({
          ...log,
          profile: profilesMap.get(log.user_id) || null
        }));

        setLogs(data || []);
        
        if ((!data || data.length === 0) && profile?.user_type !== 'agent') {
          setError('No activity logs available. Only agents can view all logs.');
        }
        
      } catch (err: any) {
        console.error('Error fetching activity logs:', err.message);
        setError(`Failed to load activity logs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchLogs();
  }, []);

  const getActionColor = (actionType: string) => {
    const colors: { [key: string]: string } = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
      view: 'bg-yellow-100 text-yellow-800',
    };
    return colors[actionType.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getUserTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      agent: 'bg-indigo-100 text-indigo-800',
      brand: 'bg-pink-100 text-pink-800',
      influencer: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getUserDisplayName = (log: ActivityLog) => {
    if (log.profile) {
      return log.profile.full_name || log.profile.username || log.profile.email.split('@')[0];
    }
    return `User ${log.user_id.substring(0, 8)}`;
  };

  const filteredLogs = logs.filter(log => {
    const actionMatch = filterActionType === 'all' || log.action_type === filterActionType;
    const userTypeMatch = filterUserType === 'all' || log.user_type === filterUserType;
    return actionMatch && userTypeMatch;
  });

  const uniqueActionTypes = Array.from(new Set(logs.map(log => log.action_type)));
  const uniqueUserTypes = Array.from(new Set(logs.map(log => log.user_type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <div className="flex justify-center mb-3"><ActivityIcon /></div>
            <p className="text-lg font-semibold">{error}</p>
          </div>
          {!isAuthenticated && (
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-600"><ActivityIcon /></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                <p className="text-gray-500 text-sm mt-1">{filteredLogs.length} total activities</p>
              </div>
            </div>
            {userType && (
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUserTypeColor(userType)}`}>
                {userType.toUpperCase()}
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FilterIcon /> Action Type
              </label>
              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                {uniqueActionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon /> User Type
              </label>
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                {uniqueUserTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4"><ActivityIcon /></div>
            <p className="text-gray-500 text-lg">No activity logs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {log.profile?.avatar_url ? (
                        <img 
                          src={log.profile.avatar_url} 
                          alt={getUserDisplayName(log)}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {getUserDisplayName(log).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 text-lg">
                          {getUserDisplayName(log)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(log.user_type)}`}>
                          {log.user_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action_type)}`}>
                          {log.action_type}
                        </span>
                      </div>

                      {/* Action Description */}
                      <p className="text-gray-700 mb-3">
                        {log.entity_type && log.entity_id ? (
                          <>
                            Performed <span className="font-medium">{log.action_type}</span> on{' '}
                            <span className="font-medium">{log.entity_type}</span>
                            <span className="text-gray-500 text-sm ml-1">
                              (ID: {log.entity_id.substring(0, 8)}...)
                            </span>
                          </>
                        ) : (
                          <>Performed <span className="font-medium">{log.action_type}</span></>
                        )}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ClockIcon />
                          {formatDate(log.timestamp)}
                        </div>
                        {log.profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon />
                            {log.profile.location}
                          </div>
                        )}
                        {log.ip_address && (
                          <div className="text-xs">
                            IP: <span className="font-mono">{log.ip_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Details Section */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                            View Details
                          </summary>
                          <div className="mt-2 bg-gray-50 rounded-lg p-4">
                            <pre className="text-xs text-gray-700 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}