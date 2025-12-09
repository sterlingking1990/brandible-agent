'use client';

import { useState, useEffect } from 'react';
import { updateReferralRewards, updateReferralRewardSplit, updateCashoutLimit, updateFinancialSettings, updateAlgorithmWeights } from './actions';

export default function SettingsForm({ currentSettings }) {
  const [inviterReward, setInviterReward] = useState(currentSettings.referral_rewards.inviter_reward);
  const [inviteeBonus, setInviteeBonus] = useState(currentSettings.referral_rewards.invitee_bonus);
  const [referrerPercentage, setReferrerPercentage] = useState(currentSettings.referral_reward_split.referrer * 100);
  const [refereePercentage, setRefereePercentage] = useState(currentSettings.referral_reward_split.referee * 100);
  const [cashoutLimit, setCashoutLimit] = useState(currentSettings.cashout_limit.limit);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingReferralSplit, setLoadingReferralSplit] = useState(false);
  const [loadingCashout, setLoadingCashout] = useState(false);
  const [messageReferral, setMessageReferral] = useState('');
  const [messageReferralSplit, setMessageReferralSplit] = useState('');
  const [messageCashout, setMessageCashout] = useState('');
  const [errorReferralSplit, setErrorReferralSplit] = useState('');

  const [coinBaseValue, setCoinBaseValue] = useState(currentSettings.coin_base_value_usd.value);
  const [platformCommission, setPlatformCommission] = useState(currentSettings.platform_commission_percentage.value * 100);
  const [investorProfitShare, setInvestorProfitShare] = useState(currentSettings.investor_profit_share_percentage.value * 100);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [messageFinancial, setMessageFinancial] = useState('');

  // Algorithm Weights State
  const [rankWeightReward, setRankWeightReward] = useState(currentSettings.rank_weight_reward.value);
  const [rankWeightInterest, setRankWeightInterest] = useState(currentSettings.rank_weight_interest.value);
  const [rankWeightRecency, setRankWeightRecency] = useState(currentSettings.rank_weight_recency.value);
  const [rankDecayRate, setRankDecayRate] = useState(currentSettings.rank_decay_rate.value);
  const [loadingAlgorithmWeights, setLoadingAlgorithmWeights] = useState(false);
  const [messageAlgorithmWeights, setMessageAlgorithmWeights] = useState('');

  useEffect(() => {
    const total = Number(referrerPercentage) + Number(refereePercentage);
    if (total !== 100) {
      setErrorReferralSplit(`Percentages must add up to 100. Current total: ${total}%`);
    } else {
      setErrorReferralSplit('');
    }
  }, [referrerPercentage, refereePercentage]);

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

  const handleReferralSplitSubmit = async (e) => {
    e.preventDefault();
    if (errorReferralSplit) {
      setMessageReferralSplit('Cannot save. Please fix the errors first.');
      return;
    }
    setLoadingReferralSplit(true);
    setMessageReferralSplit('');

    const result = await updateReferralRewardSplit({
      referrer: Number(referrerPercentage) / 100,
      referee: Number(refereePercentage) / 100,
    });

    setLoadingReferralSplit(false);
    setMessageReferralSplit(result.message);
  };

  const handleCashoutSubmit = async (e) => {
    e.preventDefault();
    setLoadingCashout(true);
    setMessageCashout('');

    const result = await updateCashoutLimit(Number(cashoutLimit));

    setLoadingCashout(false);
    setMessageCashout(result.message);
  };

  const handleFinancialSubmit = async (e) => {
    e.preventDefault();
    setLoadingFinancial(true);
    setMessageFinancial('');

    const result = await updateFinancialSettings({
      coin_base_value_usd: Number(coinBaseValue),
      platform_commission_percentage: Number(platformCommission) / 100,
      investor_profit_share_percentage: Number(investorProfitShare) / 100,
    });

    setLoadingFinancial(false);
    setMessageFinancial(result.message);
  };

  const handleAlgorithmWeightsSubmit = async (e) => {
    e.preventDefault();
    setLoadingAlgorithmWeights(true);
    setMessageAlgorithmWeights('');

    const result = await updateAlgorithmWeights({
      rank_weight_reward: Number(rankWeightReward),
      rank_weight_interest: Number(rankWeightInterest),
      rank_weight_recency: Number(rankWeightRecency),
      rank_decay_rate: Number(rankDecayRate),
    });

    setLoadingAlgorithmWeights(false);
    setMessageAlgorithmWeights(result.message);
  };

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Financial Settings</h2>
        <form onSubmit={handleFinancialSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="coin_base_value" className="block text-sm font-medium text-gray-700">
                Coin Base Value (USD)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="coin_base_value"
                  id="coin_base_value"
                  step="0.001"
                  value={coinBaseValue}
                  onChange={(e) => setCoinBaseValue(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 0.01"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The core USD value of a single Brandible Coin.</p>
            </div>

            <div>
              <label htmlFor="platform_commission" className="block text-sm font-medium text-gray-700">
                Platform Commission (%)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="platform_commission"
                  id="platform_commission"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 20"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The percentage the platform takes during influencer cash-out.</p>
            </div>

            <div>
              <label htmlFor="investor_profit_share" className="block text-sm font-medium text-gray-700">
                Investor Profit Share (%)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="investor_profit_share"
                  id="investor_profit_share"
                  value={investorProfitShare}
                  onChange={(e) => setInvestorProfitShare(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 10"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The percentage of the platform's commission that is shared with investors.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loadingFinancial}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingFinancial ? 'Saving...' : 'Save Financial Settings'}
            </button>
            {messageFinancial && <p className="text-sm text-gray-600">{messageFinancial}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">User Referral Rewards</h2>
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
                  onChange={(e) => setInviterReward(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The amount of coins given to a user who successfully refers someone using their referral code.</p>
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
                  onChange={(e) => setInviteeBonus(Number(e.target.value))}
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
              {loadingReferral ? 'Saving...' : 'Save User Referral Settings'}
            </button>
            {messageReferral && <p className="text-sm text-gray-600">{messageReferral}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Media Share Reward Split</h2>
        <p className="mb-6 text-sm text-gray-500">
          Configure the percentage split for rewards when a user shares media and a new user signs up. The total must equal 100%.
        </p>
        <form onSubmit={handleReferralSplitSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="referrer_percentage" className="block text-sm font-medium text-gray-700">
                Referrer Percentage (%)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="referrer_percentage"
                  id="referrer_percentage"
                  value={referrerPercentage}
                  onChange={(e) => setReferrerPercentage(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 10"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The percentage of the media reward that goes to the user who shared the link.</p>
            </div>

            <div>
              <label htmlFor="referee_percentage" className="block text-sm font-medium text-gray-700">
                Referee Percentage (%)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="referee_percentage"
                  id="referee_percentage"
                  value={refereePercentage}
                  onChange={(e) => setRefereePercentage(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 90"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The percentage of the media reward that goes to the new user who signed up via the link.</p>
            </div>
          </div>

          {errorReferralSplit && <p className="mt-4 text-sm text-red-600">{errorReferralSplit}</p>}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loadingReferralSplit || !!errorReferralSplit}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingReferralSplit ? 'Saving...' : 'Save Media Share Split'}
            </button>
            {messageReferralSplit && <p className="text-sm text-gray-600">{messageReferralSplit}</p>}
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
                  onChange={(e) => setCashoutLimit(Number(e.target.value))}
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

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Campaign Ranking Algorithm Weights</h2>
        <form onSubmit={handleAlgorithmWeightsSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="rank_weight_reward" className="block text-sm font-medium text-gray-700">
                Reward Weight (A)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="rank_weight_reward"
                  id="rank_weight_reward"
                  step="0.1"
                  value={rankWeightReward}
                  onChange={(e) => setRankWeightReward(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 2.0"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Determines the influence of campaign reward on its ranking. Higher value prioritizes high-paying campaigns.
              </p>
            </div>

            <div>
              <label htmlFor="rank_weight_interest" className="block text-sm font-medium text-gray-700">
                Interest Match Weight (B)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="rank_weight_interest"
                  id="rank_weight_interest"
                  step="0.1"
                  value={rankWeightInterest}
                  onChange={(e) => setRankWeightInterest(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 10.0"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Determines the influence of an influencer's interest match with the campaign. Higher value prioritizes relevant campaigns.
              </p>
            </div>

            <div>
              <label htmlFor="rank_weight_recency" className="block text-sm font-medium text-gray-700">
                Recency Weight (C)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="rank_weight_recency"
                  id="rank_weight_recency"
                  step="0.1"
                  value={rankWeightRecency}
                  onChange={(e) => setRankWeightRecency(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 1.0"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Determines the influence of campaign recency. Higher value prioritizes newer campaigns.
              </p>
            </div>

            <div>
              <label htmlFor="rank_decay_rate" className="block text-sm font-medium text-gray-700">
                Recency Decay Rate
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="rank_decay_rate"
                  id="rank_decay_rate"
                  step="0.01"
                  value={rankDecayRate}
                  onChange={(e) => setRankDecayRate(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 0.05"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Controls how quickly the recency score decreases over time. Higher value means faster decay.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loadingAlgorithmWeights}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingAlgorithmWeights ? 'Saving...' : 'Save Algorithm Weights'}
            </button>
            {messageAlgorithmWeights && <p className="text-sm text-gray-600">{messageAlgorithmWeights}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}