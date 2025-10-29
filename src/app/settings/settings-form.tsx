'use client';

import { useState } from 'react';
import { updateReferralRewards, updateCashoutLimit } from './actions';

export default function SettingsForm({ currentSettings }) {
  const [inviterReward, setInviterReward] = useState(currentSettings.referral_rewards.inviter_reward);
  const [inviteeBonus, setInviteeBonus] = useState(currentSettings.referral_rewards.invitee_bonus);
  const [cashoutLimit, setCashoutLimit] = useState(currentSettings.cashout_limit.limit);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingCashout, setLoadingCashout] = useState(false);
  const [messageReferral, setMessageReferral] = useState('');
  const [messageCashout, setMessageCashout] = useState('');

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setLoadingReferral(true);
    setMessageReferral('');

    const result = await updateReferralRewards({
      inviter_reward: Number(inviterReward),
      invitee_bonus: Number(inviteeBonus),
    });

    setLoadingReferral(false);
    setMessageReferral(result.message);
  };

  const handleCashoutSubmit = async (e) => {
    e.preventDefault();
    setLoadingCashout(true);
    setMessageCashout('');

    const result = await updateCashoutLimit(Number(cashoutLimit));

    setLoadingCashout(false);
    setMessageCashout(result.message);
  };

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Referral Rewards</h2>
        <form onSubmit={handleReferralSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="inviter_reward" className="block text-sm font-medium text-gray-700">
                Inviter Reward (Coins)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="inviter_reward"
                  id="inviter_reward"
                  value={inviterReward}
                  onChange={(e) => setInviterReward(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The amount of coins given to a user who successfully refers someone.</p>
            </div>

            <div>
              <label htmlFor="invitee_bonus" className="block text-sm font-medium text-gray-700">
                Invitee Bonus (Coins)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="invitee_bonus"
                  id="invitee_bonus"
                  value={inviteeBonus}
                  onChange={(e) => setInviteeBonus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 250"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The welcome bonus for a new user who signs up with a referral code.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loadingReferral}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingReferral ? 'Saving...' : 'Save Referral Settings'}
            </button>
            {messageReferral && <p className="text-sm text-gray-600">{messageReferral}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Cashout Settings</h2>
        <form onSubmit={handleCashoutSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="cashout_limit" className="block text-sm font-medium text-gray-700">
                Minimum Cashout Amount (Coins)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="cashout_limit"
                  id="cashout_limit"
                  value={cashoutLimit}
                  onChange={(e) => setCashoutLimit(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 1000"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The minimum number of coins a user must have to be able to cash out.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loadingCashout}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingCashout ? 'Saving...' : 'Save Cashout Limit'}
            </button>
            {messageCashout && <p className="text-sm text-gray-600">{messageCashout}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
