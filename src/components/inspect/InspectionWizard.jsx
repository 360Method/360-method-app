import React, { useState } from 'react';
import { X, CheckCircle, ClipboardList, ArrowRight, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function InspectionWizard({ onComplete, onCancel, properties, selectedProperty }) {
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Determine season based on current month
  const determineSeason = () => {
    if (currentMonth >= 2 && currentMonth <= 4) return 'Spring';
    if (currentMonth >= 5 && currentMonth <= 7) return 'Summer';
    if (currentMonth >= 8 && currentMonth <= 10) return 'Fall';
    return 'Winter';
  };
  
  const [inspectionData, setInspectionData] = useState({
    property_id: selectedProperty?.id || properties?.[0]?.id || null,
    season: determineSeason(),
    year: currentYear,
    inspection_date: currentDate.toISOString().split('T')[0],
    method: 'wizard', // wizard, traditional, or physical
    status: 'In Progress',
    completion_percentage: 0,
    checklist_items: [],
    issues_found: 0
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Inspection.create(data);
    },
    onSuccess: (newInspection) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onComplete(newInspection);
    }
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleFinish = () => {
    createInspectionMutation.mutate(inspectionData);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Setup</h3>
        <p className="text-gray-600 text-sm">Configure your seasonal inspection</p>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Property
        </label>
        <select
          value={inspectionData.property_id}
          onChange={(e) => setInspectionData({...inspectionData, property_id: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {properties?.map(p => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Season & Year
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={inspectionData.season}
            onChange={(e) => setInspectionData({...inspectionData, season: e.target.value})}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
          <input
            type="number"
            value={inspectionData.year}
            onChange={(e) => setInspectionData({...inspectionData, year: parseInt(e.target.value)})}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            min="2020"
            max="2030"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Inspection Date
        </label>
        <input
          type="date"
          value={inspectionData.inspection_date}
          onChange={(e) => setInspectionData({...inspectionData, inspection_date: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Seasonal inspections help catch issues early. We recommend inspecting 4 times per year - once per season.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Inspection Method</h3>
        <p className="text-gray-600 text-sm">Pick the approach that works best for you</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setInspectionData({...inspectionData, method: 'traditional'})}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            inspectionData.method === 'traditional'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              inspectionData.method === 'traditional' ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">📋 Traditional Inspection</h4>
              <p className="text-sm text-gray-600">Checklist-based, organized by area (Kitchen, Basement, etc.)</p>
              <p className="text-xs text-gray-500 mt-1">⏱️ 20-30 minutes • Best for selective checks</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setInspectionData({...inspectionData, method: 'physical'})}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            inspectionData.method === 'physical'
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-teal-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              inspectionData.method === 'physical' ? 'bg-teal-600' : 'bg-gray-300'
            }`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">🏠 Physical Walkthrough</h4>
              <p className="text-sm text-gray-600">Room-by-room route optimized to minimize backtracking</p>
              <p className="text-xs text-gray-500 mt-1">⏱️ 30-40 minutes • Best for complete property coverage</p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>✨ New to inspections?</strong> We recommend starting with the Traditional method - it's easier to follow and you can select specific areas.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Begin!</h3>
        <p className="text-gray-600 text-sm">Review your setup and start inspecting</p>
      </div>
      
      <div className="bg-white border-2 border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Property:</span>
          <span className="font-semibold text-gray-900">
            {properties?.find(p => p.id === inspectionData.property_id)?.address || 'Not selected'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Season:</span>
          <span className="font-semibold text-gray-900">{inspectionData.season} {inspectionData.year}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-semibold text-gray-900">
            {new Date(inspectionData.inspection_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Method:</span>
          <span className="font-semibold text-gray-900">
            {inspectionData.method === 'traditional' ? '📋 Traditional' : '🏠 Physical Walkthrough'}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">What Happens Next?</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Work through the inspection checklist</li>
              <li>• Document any issues you find</li>
              <li>• Take photos of problems</li>
              <li>• Issues automatically become action items in Prioritize</li>
              <li>• Your progress saves automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Start Wizard</h2>
            <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
            disabled={createInspectionMutation.isPending}
          >
            {step > 1 && <ArrowLeft className="w-4 h-4" />}
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={createInspectionMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {createInspectionMutation.isPending ? 'Creating...' : 'Start Inspection'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}