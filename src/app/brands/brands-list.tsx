'use client';

import { useState, useEffect } from 'react';
import { verifyBrand, unverifyBrand, updateBrandAgencyDetails } from './actions';
import EditBrandModal from './edit-brand-modal';

export default function BrandsList({ brands: initialBrands }) {
  const [brands, setBrands] = useState(initialBrands);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false); // New state for saving loading

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedBrandData: any) => {
    setSavingEdit(true); // Set saving state
    setError(null);
    try {
      const result = await updateBrandAgencyDetails(
        updatedBrandData.profile_id,
        updatedBrandData.isAgency,
        updatedBrandData.agency_status,
        updatedBrandData.sales_handler,
        updatedBrandData.business_phone_number // Pass the business_phone_number
      );

      if (!result.success) {
        setError(result.message || 'Failed to update brand details');
      } else {
        // Update local state with the new data
        setBrands(brands.map(brand =>
          brand.id === updatedBrandData.profile_id
            ? {
                ...brand,
                brands: {
                  ...brand.brands,
                  isAgency: updatedBrandData.isAgency,
                  agency_status: updatedBrandData.agency_status,
                  sales_handler: updatedBrandData.sales_handler,
                  business_phone_number: updatedBrandData.business_phone_number, // Update this as well
                }
              }
            : brand
        ));
        setIsEditModalOpen(false); // Close modal on success
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setSavingEdit(false); // Reset saving state
      setEditingBrand(null); // Clear editing brand
    }
  };

  const handleVerify = async (brandProfileId: string) => {
    try {
      setLoadingId(brandProfileId);
      setError(null);
      
      const result = await verifyBrand(brandProfileId);
      
      if (!result.success) {
        setError(result.message || 'Failed to verify brand');
      } else {
        // Update the brand status in local state
        setBrands(brands.map(brand => 
          brand.id === brandProfileId 
            ? { ...brand, brands: { ...brand.brands, verification_status: 'verified' } }
            : brand
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnverify = async (brandProfileId: string) => {
    try {
      setLoadingId(brandProfileId);
      setError(null);
      
      const result = await unverifyBrand(brandProfileId);
      
      if (!result.success) {
        setError(result.message || 'Failed to revoke verification');
      } else {
        // Update the brand status in local state
        setBrands(brands.map(brand => 
          brand.id === brandProfileId 
            ? { ...brand, brands: { ...brand.brands, verification_status: 'pending' } }
            : brand
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  // Update local 'brands' state when 'initialBrands' prop changes (e.g., on page refresh)
  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agency Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales Handler
              </th>
              <th scope="col" className="relative px-6 py-3 text-right">
                <span className="sr-only">Actions</span>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {brand.brands?.company_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{brand.full_name}</div>
                  <div className="text-sm text-gray-500">{brand.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      brand.brands?.verification_status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {brand.brands?.verification_status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      brand.brands?.isAgency
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {brand.brands?.isAgency ? 'Agency' : 'Not Agency'}
                  </span>
                  {brand.brands?.isAgency && (
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {brand.brands?.agency_status || 'N/A'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {brand.brands?.sales_handler || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(brand)} // New edit button
                    className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Edit
                  </button>
                  {brand.brands?.verification_status === 'verified' ? (
                    <button
                      onClick={() => handleUnverify(brand.id)}
                      disabled={loadingId === brand.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingId === brand.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(brand.id)}
                      disabled={loadingId === brand.id}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingId === brand.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Brand Modal */}
      {editingBrand && (
        <EditBrandModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBrand(null);
            setError(null); // Clear error when closing modal
          }}
          brand={editingBrand}
          onSave={handleSaveEdit}
          loading={savingEdit}
        />
      )}
    </div>
  );
}