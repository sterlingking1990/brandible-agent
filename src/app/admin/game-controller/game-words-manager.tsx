'use client';

import { useState } from 'react';
import { addGameWord, toggleWordStatus, deleteGameWord } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type GameWord = {
  id: number;
  word: string;
  word_length: number;
  category: string;
  difficulty_level: number;
  is_active: boolean;
};

export default function GameWordsManager({ initialWords }: { initialWords: GameWord[] }) {
  const [newWord, setNewWord] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !category) return;
    setLoading(true);
    setMessage('');

    const result = await addGameWord({
      word: newWord,
      category,
      difficulty_level: parseInt(difficulty),
    });

    if (result.success) {
      setNewWord('');
      setCategory('');
      setDifficulty('1');
    }
    setLoading(false);
    setMessage(result.message || '');
  };

  const handleToggle = async (word: GameWord) => {
    await toggleWordStatus(word.id, word.is_active);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this word?')) return;
    await deleteGameWord(id);
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Add New Word</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="e.g. APPLE"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty (1-5)</Label>
            <Input
              id="difficulty"
              type="number"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !newWord || !category}>
            {loading ? 'Adding...' : 'Add Word'}
          </Button>
        </form>
        {message && <p className="mt-2 text-sm text-indigo-600">{message}</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-indigo-700">Word Library ({initialWords.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600 uppercase text-xs">
                <th className="py-3 px-4">Word</th>
                <th className="py-3 px-4">Length</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Diff</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {initialWords.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold">{w.word}</td>
                  <td className="py-3 px-4 text-gray-500">{w.word_length}</td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                      {w.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">{w.difficulty_level}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <Switch
                        checked={w.is_active}
                        onCheckedChange={() => handleToggle(w)}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="text-red-500 hover:text-red-700 text-xs font-semibold px-3 py-1 rounded hover:bg-red-50"
                      onClick={() => handleDelete(w.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
