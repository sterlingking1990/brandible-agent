'use client';

import { useState } from 'react';
import { updateAchievement } from './actions';

export default function EditAchievementForm({ achievement }) {
  const [rewardCoins, setRewardCoins] = useState(achievement.reward_coins);
  const [threshold, setThreshold] = useState(achievement.threshold);
  const [description, setDescription] = useState(achievement.description);
  const [isActive, setIsActive] = useState(achievement.is_active);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateAchievement({
      id: achievement.id,
      reward_coins: Number(rewardCoins),
      threshold: Number(threshold),
      description: description,
      is_active: isActive,
    });

    setLoading(false);
    setMessage(result.message);

    // Hide message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{achievement.name}</h2>
      <p className="text-sm text-gray-500 mb-6">Key: <span className="font-mono bg-gray-100 p-1 rounded">{achievement.key}</span> | Action: <span className="font-mono bg-gray-100 p-1 rounded">{achievement.action_type}</span></p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor={`reward_coins_${achievement.id}`} className="block text-sm font-medium text-gray-700">
              Reward (Coins)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name={`reward_coins_${achievement.id}`}
                id={`reward_coins_${achievement.id}`}
                value={rewardCoins}
                onChange={(e) => setRewardCoins(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`threshold_${achievement.id}`} className="block text-sm font-medium text-gray-700">
              Threshold
            </label>
            <div className="mt-1">
              <input
                type="number"
                name={`threshold_${achievement.id}`}
                id={`threshold_${achievement.id}`}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor={`description_${achievement.id}`} className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <input
                type="text"
                name={`description_${achievement.id}`}
                id={`description_${achievement.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id={`is_active_${achievement.id}`}
                name={`is_active_${achievement.id}`}
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`is_active_${achievement.id}`} className="font-medium text-gray-700">Active</label>
              <p className="text-gray-500">If unchecked, this achievement will not be awarded.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </form>
    </div>
  );
}
