'use client';

import { useState } from 'react';
import { updateGameSettings } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type GameSettings = {
  stake_amount: string;
  reward_amount: string;
  max_level: string;
  campaign_trigger_probability: string;
  grid_columns: string;
  grid_rows: string;
  stages_per_level: string;
  flash_duration_ms: string;
  flash_gap_ms: string;
  grace_time_ms: string;
  min_word_length: string;
  max_word_length: string;
  enable_campaign_interactions: boolean;
  enable_bet_mode: boolean;
  enable_free_mode: boolean;
  show_campaign_history: boolean;
  influencer_reward_percentage: string;
  level_reset_penalty_percentage: string;
};

export default function GameControllerForm({ initialSettings }: { initialSettings: Partial<GameSettings> }) {
  const [settings, setSettings] = useState<GameSettings>({
    stake_amount: initialSettings.stake_amount || '5',
    reward_amount: initialSettings.reward_amount || '10',
    max_level: initialSettings.max_level || '10',
    campaign_trigger_probability: initialSettings.campaign_trigger_probability || '0.3',
    grid_columns: initialSettings.grid_columns || '4',
    grid_rows: initialSettings.grid_rows || '4',
    stages_per_level: initialSettings.stages_per_level || '5',
    flash_duration_ms: initialSettings.flash_duration_ms || '800',
    flash_gap_ms: initialSettings.flash_gap_ms || '300',
    grace_time_ms: initialSettings.grace_time_ms || '3000',
    min_word_length: initialSettings.min_word_length || '3',
    max_word_length: initialSettings.max_word_length || '7',
    enable_campaign_interactions: initialSettings.enable_campaign_interactions ?? true,
    enable_bet_mode: initialSettings.enable_bet_mode ?? true,
    enable_free_mode: initialSettings.enable_free_mode ?? true,
    show_campaign_history: initialSettings.show_campaign_history ?? true,
    influencer_reward_percentage: initialSettings.influencer_reward_percentage || '50',
    level_reset_penalty_percentage: initialSettings.level_reset_penalty_percentage || '50',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (key: keyof GameSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateGameSettings(settings);

    setLoading(false);
    setMessage(result.message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Basic Game Mechanics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="stake_amount">Stake Amount (Coins)</Label>
            <Input
              id="stake_amount"
              type="number"
              value={settings.stake_amount}
              onChange={(e) => handleChange('stake_amount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward_amount">Reward Amount (Coins)</Label>
            <Input
              id="reward_amount"
              type="number"
              value={settings.reward_amount}
              onChange={(e) => handleChange('reward_amount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_level">Max Level</Label>
            <Input
              id="max_level"
              type="number"
              value={settings.max_level}
              onChange={(e) => handleChange('max_level', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stages_per_level">Stages per Level</Label>
            <Input
              id="stages_per_level"
              type="number"
              value={settings.stages_per_level}
              onChange={(e) => handleChange('stages_per_level', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level_reset_penalty_percentage">Level Reset Penalty (%)</Label>
            <Input
              id="level_reset_penalty_percentage"
              type="number"
              value={settings.level_reset_penalty_percentage}
              onChange={(e) => handleChange('level_reset_penalty_percentage', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Grid & Word Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="grid_columns">Grid Columns</Label>
            <Input
              id="grid_columns"
              type="number"
              value={settings.grid_columns}
              onChange={(e) => handleChange('grid_columns', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grid_rows">Grid Rows</Label>
            <Input
              id="grid_rows"
              type="number"
              value={settings.grid_rows}
              onChange={(e) => handleChange('grid_rows', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_word_length">Min Word Length</Label>
            <Input
              id="min_word_length"
              type="number"
              value={settings.min_word_length}
              onChange={(e) => handleChange('min_word_length', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_word_length">Max Word Length</Label>
            <Input
              id="max_word_length"
              type="number"
              value={settings.max_word_length}
              onChange={(e) => handleChange('max_word_length', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Timings & Probabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="flash_duration_ms">Flash Duration (ms)</Label>
            <Input
              id="flash_duration_ms"
              type="number"
              value={settings.flash_duration_ms}
              onChange={(e) => handleChange('flash_duration_ms', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flash_gap_ms">Flash Gap (ms)</Label>
            <Input
              id="flash_gap_ms"
              type="number"
              value={settings.flash_gap_ms}
              onChange={(e) => handleChange('flash_gap_ms', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grace_time_ms">Grace Time (ms)</Label>
            <Input
              id="grace_time_ms"
              type="number"
              value={settings.grace_time_ms}
              onChange={(e) => handleChange('grace_time_ms', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign_trigger_probability">Campaign Trigger Probability (0.0 to 1.0)</Label>
            <Input
              id="campaign_trigger_probability"
              type="number"
              step="0.1"
              value={settings.campaign_trigger_probability}
              onChange={(e) => handleChange('campaign_trigger_probability', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Game Modes & UI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="enable_campaign_interactions">Enable Campaign Interactions</Label>
              <p className="text-sm text-gray-500">Toggle if users see brand campaigns during play.</p>
            </div>
            <Switch
              id="enable_campaign_interactions"
              checked={settings.enable_campaign_interactions}
              onCheckedChange={(checked) => handleChange('enable_campaign_interactions', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="enable_bet_mode">Enable Bet Mode</Label>
              <p className="text-sm text-gray-500">Allow users to play with coins.</p>
            </div>
            <Switch
              id="enable_bet_mode"
              checked={settings.enable_bet_mode}
              onCheckedChange={(checked) => handleChange('enable_bet_mode', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="enable_free_mode">Enable Free Mode</Label>
              <p className="text-sm text-gray-500">Allow users to play for free without rewards.</p>
            </div>
            <Switch
              id="enable_free_mode"
              checked={settings.enable_free_mode}
              onCheckedChange={(checked) => handleChange('enable_free_mode', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="show_campaign_history">Show Campaign History</Label>
              <p className="text-sm text-gray-500">Display previous campaign interactions in-app.</p>
            </div>
            <Switch
              id="show_campaign_history"
              checked={settings.show_campaign_history}
              onCheckedChange={(checked) => handleChange('show_campaign_history', checked)}
            />
          </div>
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="influencer_reward_percentage">Influencer Reward Percentage (%)</Label>
            <Input
              id="influencer_reward_percentage"
              type="number"
              value={settings.influencer_reward_percentage}
              onChange={(e) => handleChange('influencer_reward_percentage', e.target.value)}
            />
            <p className="text-sm text-gray-500">The percentage of the reward given to the influencer.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-indigo-100">
        <Button type="submit" disabled={loading} className="w-full md:w-auto px-12 py-6 text-lg font-semibold">
          {loading ? 'Updating...' : 'Save All Game Settings'}
        </Button>
        {message && (
          <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
