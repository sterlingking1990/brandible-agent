'use client';

import { useState } from 'react';

const ProfitabilityForm = () => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactionFeeRate, setTransactionFeeRate] = useState(0.1);
    const [rewardForStatus, setRewardForStatus] = useState(0.5);
    const [rewardForSurvey, setRewardForSurvey] = useState(2.0);
    const [rewardForChallenge, setRewardForChallenge] = useState(5.0);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalysis = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch('/api/analytics/profitability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    transactionFeeRate,
                    rewardForStatus,
                    rewardForSurvey,
                    rewardForChallenge,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch data');
            }

            const data = await response.json();
            setResults(data[0]); // The RPC returns an array with one object
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Analysis Parameters</h2>
                <form onSubmit={handleAnalysis}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="feeRate" className="block text-sm font-medium text-gray-700">Transaction Fee Rate</label>
                            <input
                                type="number"
                                id="feeRate"
                                step="0.01"
                                value={transactionFeeRate}
                                onChange={(e) => setTransactionFeeRate(parseFloat(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">The fee rate (e.g., 0.10 for 10%) charged on transactions.</p>
                        </div>
                        <div>
                            <label htmlFor="statusReward" className="block text-sm font-medium text-gray-700">Status Post Reward</label>
                            <input
                                type="number"
                                id="statusReward"
                                step="0.01"
                                value={rewardForStatus}
                                onChange={(e) => setRewardForStatus(parseFloat(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <p className="mt-2 text-sm text-gray-500">Credits given to a brand for creating a status post.</p>
                        </div>
                        <div>
                            <label htmlFor="surveyReward" className="block text-sm font-medium text-gray-700">Survey Reward</label>
                            <input
                                type="number"
                                id="surveyReward"
                                step="0.01"
                                value={rewardForSurvey}
                                onChange={(e) => setRewardForSurvey(parseFloat(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <p className="mt-2 text-sm text-gray-500">Credits given to a brand for creating a survey.</p>
                        </div>
                        <div>
                            <label htmlFor="challengeReward" className="block text-sm font-medium text-gray-700">Challenge Reward</label>
                            <input
                                type="number"
                                id="challengeReward"
                                step="0.01"
                                value={rewardForChallenge}
                                onChange={(e) => setRewardForChallenge(parseFloat(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <p className="mt-2 text-sm text-gray-500">Credits given to a brand for creating a challenge.</p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center">
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Run Analysis'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {results && (
                <div className="mt-6 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Analysis Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">${results.total_revenue.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Cost (Rewards)</p>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">${results.total_cost.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Profit</p>
                            <p className={`mt-1 text-3xl font-semibold ${results.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${results.net_profit.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitabilityForm;
