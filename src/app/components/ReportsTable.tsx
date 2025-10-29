'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Report = {
  id: string;
  created_at: string;
  content_id: string;
  content_type: string;
  reason: string;
  reporter: {
    full_name: string;
  } | null;
};

type ReportsTableProps = {
  initialReports: Report[];
};

export default function ReportsTable({ initialReports }: ReportsTableProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const supabase = createClient();

  const handleResolve = async (reportId: string) => {
    const { error } = await supabase.rpc('resolve_report', { report_id_to_resolve: reportId });

    if (error) {
      alert(`Error resolving report: ${error.message}`);
    } else {
      setReports(reports.filter((report) => report.id !== reportId));
      alert('Report resolved successfully!');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reporter
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content Type
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
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {report.reporter?.full_name || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report.content_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report.content_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(report.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleResolve(report.id)}
                  className="text-green-600 hover:text-green-900"
                >
                  Mark as Resolved
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
