import ProfitabilityForm from './profitability-form';

export default function ProfitabilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profitability Analysis</h1>
        <p className="mt-2 text-gray-600">
          Analyze revenue, costs, and net profit based on transaction fees and reward parameters.
        </p>
      </div>
      <ProfitabilityForm />
    </div>
  );
}