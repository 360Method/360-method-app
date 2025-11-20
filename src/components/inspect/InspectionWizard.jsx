import React, { useState } from 'react';
import { X, CheckCircle, ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react';

export default function InspectionWizard({ onComplete, onCancel, properties }) {
  const [step, setStep] = useState(1);
  const [inspectionData, setInspectionData] = useState({
    property_id: properties?.[0]?.id || null,
    type: 'Quarterly',
    inspector: 'Self',
    date: new Date().toISOString().split('T')[0],
    findings: []
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Details</h3>
        <p className="text-gray-600 text-sm">Set up your inspection parameters</p>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Property
        </label>
        <select
          value={inspectionData.property_id}
          onChange={(e) => setInspectionData({...inspectionData, property_id: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {properties?.map(p => (
            <option key={p.id} value={p.id}>
              {p.nickname || p.address}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Inspection Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['Quarterly', 'Move-In', 'Move-Out', 'Seasonal', 'Special'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setInspectionData({...inspectionData, type})}
              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                inspectionData.type === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Performed By
        </label>
        <select
          value={inspectionData.inspector}
          onChange={(e) => setInspectionData({...inspectionData, inspector: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="Self">Self (DIY)</option>
          <option value="Professional">Professional Inspector</option>
          <option value="Property Manager">Property Manager</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Inspection Date
        </label>
        <input
          type="date"
          value={inspectionData.date}
          onChange={(e) => setInspectionData({...inspectionData, date: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Checklist</h3>
        <p className="text-gray-600 text-sm">Walk through key areas - check off as you inspect</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {[
          'Roof & Gutters',
          'Exterior Walls & Siding',
          'Foundation & Crawlspace',
          'HVAC System',
          'Plumbing (all fixtures)',
          'Electrical (outlets, panels)',
          'Windows & Doors',
          'Interior Walls & Ceilings',
          'Flooring',
          'Appliances',
          'Safety Devices (smoke/CO detectors)'
        ].map((area, idx) => (
          <label key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">{area}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Document Findings</h3>
        <p className="text-gray-600 text-sm">Note any issues discovered during inspection</p>
      </div>

      <button 
        type="button"
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <ClipboardList className="w-5 h-5" />
        Add Finding
      </button>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <ClipboardList className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 font-medium">No findings added yet</p>
        <p className="text-sm text-gray-400 mt-1">Use the button above to document any issues</p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Complete</h3>
        <p className="text-gray-600 text-sm">Confirm your inspection details</p>
      </div>
      
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-green-900 mb-2">Inspection Complete!</h4>
            <p className="text-green-800 text-sm">
              Your {inspectionData.type} inspection has been documented. 
              All findings will be converted to action items automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Property:</span>
          <span className="font-semibold text-gray-900">
            {properties?.find(p => p.id === inspectionData.property_id)?.nickname || 
             properties?.find(p => p.id === inspectionData.property_id)?.address}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="font-semibold text-gray-900">{inspectionData.type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Inspector:</span>
          <span className="font-semibold text-gray-900">{inspectionData.inspector}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-semibold text-gray-900">{inspectionData.date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Findings:</span>
          <span className="font-semibold text-gray-900">{inspectionData.findings.length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Inspection</h2>
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
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
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
              onClick={() => onComplete(inspectionData)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Inspection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}