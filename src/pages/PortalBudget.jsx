import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BudgetTracking from '../components/portal/BudgetTracking';

export default function PortalBudget() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date')
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProperty?.id],
    queryFn: () => base44.entities.MaintenanceTask.filter({
      property_id: selectedProperty?.id,
      status: 'Completed'
    }),
    enabled: !!selectedProperty?.id
  });

  const { data: systems = [] } = useQuery({
    queryKey: ['systems', selectedProperty?.id],
    queryFn: () => base44.entities.SystemBaseline.filter({
      property_id: selectedProperty?.id
    }),
    enabled: !!selectedProperty?.id
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);

  // Transform tasks into spending data
  const spending = tasks
    .filter(t => t.actual_cost)
    .map(t => ({
      date: t.completion_date || t.created_date,
      amount: t.actual_cost,
      category: t.execution_type === 'DIY' ? 'preventive' : 'repairs',
      description: t.title
    }));

  // Generate CapEx planning from systems
  const capexPlanning = systems
    .filter(s => s.replacement_cost_estimate && s.installation_year && s.estimated_lifespan_years)
    .map(s => {
      const currentYear = new Date().getFullYear();
      const age = currentYear - s.installation_year;
      const yearsRemaining = s.estimated_lifespan_years - age;
      return {
        system: s.system_type,
        expected_date: new Date(currentYear + yearsRemaining, 0, 1).toISOString(),
        estimated_cost: s.replacement_cost_estimate,
        years_away: Math.max(0, yearsRemaining)
      };
    })
    .filter(item => item.years_away <= 10)
    .sort((a, b) => a.years_away - b.years_away);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget & Spending</h1>
            <p className="text-gray-600 mt-1">Track your property maintenance costs</p>
          </div>
          {properties.length > 1 && (
            <select
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                const property = properties.find(p => p.id === e.target.value);
                setSelectedProperty(property);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          )}
        </div>

        <BudgetTracking
          propertyValue={selectedProperty?.current_value || 300000}
          spending={spending}
          capexPlanning={capexPlanning}
        />
      </div>
    </div>
  );
}