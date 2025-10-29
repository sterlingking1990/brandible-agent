'use client';

import { useState } from 'react';
import { updateCoinPackage, createCoinPackage, togglePackageStatus } from './actions';

type CoinPackage = {
  id: string;
  name: string;
  coin_amount: number;
  price_usd: number;
  price_ngn: number;
  bonus_coins: number;
  is_active: boolean;
  created_at: string;
};

type CoinPackagesTableProps = {
  initialPackages: CoinPackage[];
};

export default function CoinPackagesTable({ initialPackages }: CoinPackagesTableProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    coin_amount: '',
    price_usd: '',
    price_ngn: '',
    bonus_coins: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      coin_amount: '',
      price_usd: '',
      price_ngn: '',
      bonus_coins: '',
    });
  };

  const handleEdit = (pkg: CoinPackage) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      coin_amount: pkg.coin_amount.toString(),
      price_usd: pkg.price_usd.toString(),
      price_ngn: pkg.price_ngn.toString(),
      bonus_coins: pkg.bonus_coins.toString(),
    });
  };

  const handleSave = async (id: string) => {
    setLoading(id);
    try {
      const result = await updateCoinPackage(id, {
        name: formData.name,
        coin_amount: parseFloat(formData.coin_amount),
        price_usd: parseFloat(formData.price_usd),
        price_ngn: parseFloat(formData.price_ngn),
        bonus_coins: parseFloat(formData.bonus_coins),
      });

      if (result.success) {
        setPackages(packages.map(pkg => 
          pkg.id === id ? { ...pkg, ...result.data } : pkg
        ));
        setEditingId(null);
        resetForm();
      } else {
        alert('Error updating package: ' + result.error);
      }
    } catch (error) {
      alert('Error updating package');
    } finally {
      setLoading(null);
    }
  };

  const handleCreate = async () => {
    setLoading('create');
    try {
      const result = await createCoinPackage({
        name: formData.name,
        coin_amount: parseFloat(formData.coin_amount),
        price_usd: parseFloat(formData.price_usd),
        price_ngn: parseFloat(formData.price_ngn),
        bonus_coins: parseFloat(formData.bonus_coins),
      });

      if (result.success) {
        setPackages([...packages, result.data]);
        setShowCreateForm(false);
        resetForm();
      } else {
        alert('Error creating package: ' + result.error);
      }
    } catch (error) {
      alert('Error creating package');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    try {
      const result = await togglePackageStatus(id, !currentStatus);
      if (result.success) {
        setPackages(packages.map(pkg => 
          pkg.id === id ? { ...pkg, is_active: !currentStatus } : pkg
        ));
      } else {
        alert('Error updating status: ' + result.error);
      }
    } catch (error) {
      alert('Error updating status');
    } finally {
      setLoading(null);
    }
  };

  const renderFormRow = (isCreate = false, pkg?: CoinPackage) => (
    <tr className="bg-blue-50">
      <td className="px-6 py-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Package name"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="number"
          value={formData.coin_amount}
          onChange={(e) => setFormData({ ...formData, coin_amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Coins"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="number"
          step="0.01"
          value={formData.price_usd}
          onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="USD price"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="number"
          step="0.01"
          value={formData.price_ngn}
          onChange={(e) => setFormData({ ...formData, price_ngn: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="NGN price"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="number"
          value={formData.bonus_coins}
          onChange={(e) => setFormData({ ...formData, bonus_coins: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Bonus"
        />
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500">
          {isCreate ? 'Active' : (pkg?.is_active ? 'Active' : 'Inactive')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => isCreate ? handleCreate() : handleSave(pkg!.id)}
            disabled={loading === (isCreate ? 'create' : pkg?.id)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading === (isCreate ? 'create' : pkg?.id) ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              if (isCreate) {
                setShowCreateForm(false);
              } else {
                setEditingId(null);
              }
              resetForm();
            }}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Coin Packages</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Add New Package
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (USD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (NGN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bonus Coins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {showCreateForm && renderFormRow(true)}
            
            {packages.map((pkg) => (
              editingId === pkg.id ? renderFormRow(false, pkg) : (
                <tr key={pkg.id} className={pkg.is_active ? '' : 'bg-gray-50 opacity-75'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.coin_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${pkg.price_usd.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₦{pkg.price_ngn.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.bonus_coins > 0 ? `+${pkg.bonus_coins}` : '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pkg.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        disabled={loading === pkg.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(pkg.id, pkg.is_active)}
                        disabled={loading === pkg.id}
                        className={`${
                          pkg.is_active 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        } disabled:opacity-50`}
                      >
                        {loading === pkg.id ? 'Loading...' : (pkg.is_active ? 'Deactivate' : 'Activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
      
      {packages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No coin packages found.</p>
        </div>
      )}
    </div>
  );
}
