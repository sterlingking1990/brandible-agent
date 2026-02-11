// app/brands/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BrandsList from './brands-list';

export const revalidate = 0;

export default async function BrandsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Fetch all brand profiles and their brand-specific info
  const { data: brands, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      created_at,
      brands ( 
        profile_id,
        company_name, 
        verification_status,
        isAgency,
        agency_status,
        sales_handler,
        business_phone_number
      )
    `)
    .eq('user_type', 'brand')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brands:', error);
  }

  // Transform the data to handle the array structure
  const transformedBrands = (brands || []).map(brand => {
    // brands is an array, so we need to take the first element
    const brandInfo = brand.brands && brand.brands[0] ? brand.brands[0] : null;
    
    return {
      id: brand.id,
      full_name: brand.full_name,
      email: brand.email,
      created_at: brand.created_at,
      brands: brandInfo ? {
        company_name: brandInfo.company_name,
        verification_status: brandInfo.verification_status,
        profile_id: brandInfo.profile_id,
        isAgency: brandInfo.isAgency,
        agency_status: brandInfo.agency_status,
        sales_handler: brandInfo.sales_handler,
        business_phone_number: brandInfo.business_phone_number,
      } : null
    };
  });

  console.log('Transformed brands data:', transformedBrands);

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Brand Management</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">All Brands</h2>
        <BrandsList brands={transformedBrands} />
      </div>
    </main>
  );
}