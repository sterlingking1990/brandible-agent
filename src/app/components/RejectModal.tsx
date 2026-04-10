'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  title?: string;
  description?: string;
}

export default function RejectModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  title = 'Reject Item',
  description = 'Please provide a reason for rejecting this.'
}: Props) {
  const [reason, setReason] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-4">{description}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder="e.g., Application not clear"
        />
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !reason}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
