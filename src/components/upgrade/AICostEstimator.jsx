import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, FileText, Image as ImageIcon, Sparkles, 
  Loader2, AlertCircle, CheckCircle2, DollarSign, X
} from 'lucide-react';

export default function AICostEstimator({ 
  onEstimateGenerated,
  propertyAddress,
  projectTitle 
}) {
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    setError('');

    try {
      // Upload files to Base44
      const uploadPromises = files.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url
        };
      });

      const uploaded = await Promise.all(uploadPromises);
      
      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFileUrls(prev => [...prev, ...uploaded.map(f => f.url)]);
      
      console.log('✅ Files uploaded:', uploaded);
    } catch (err) {
      console.error('❌ File upload error:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileUrls(prev => prev.filter((_, i) => i !== index));
  };

  const generateEstimate = async () => {
    if (!description && uploadedFiles.length === 0) {
      setError('Please provide a description or upload files');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🤖 Calling AI cost estimator...');
      console.log('Description:', description);
      console.log('Files:', fileUrls);

      const prompt = `You are a professional home renovation cost estimator with expertise in residential construction and market pricing.

${propertyAddress ? `Property Location: ${propertyAddress}` : ''}
${projectTitle ? `Project Type: ${projectTitle}` : ''}

${description ? `Project Description:\n${description}` : ''}

${uploadedFiles.length > 0 ? `The user has uploaded ${uploadedFiles.length} file(s) for analysis (documents, quotes, or photos).` : ''}

Analyze the provided information and generate a comprehensive cost estimate. Consider:
- Local market rates for labor and materials
- Scope of work described
- Quality level implied (standard, mid-grade, or high-end)
- Typical permitting and fees
- Contingency for unknowns

Provide your response as a structured estimate including:
1. Cost range (realistic minimum and maximum)
2. Expected property value increase
3. Cost breakdown by category
4. ROI calculation
5. 3-5 key insights or recommendations
6. Confidence level based on information provided`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            cost_min: { type: "number" },
            cost_max: { type: "number" },
            cost_average: { type: "number" },
            value_impact: { type: "number" },
            roi_percent: { type: "number" },
            breakdown: {
              type: "object",
              properties: {
                materials: { type: "number" },
                labor: { type: "number" },
                permits: { type: "number" },
                other: { type: "number" }
              }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            },
            confidence: { type: "string" }
          }
        }
      });

      console.log('✅ AI estimate generated:', result);
      
      setEstimate(result);
      
      // Pass estimate back to parent component
      onEstimateGenerated?.(result);

    } catch (err) {
      console.error('❌ AI estimation error:', err);
      setError('Failed to generate estimate. Please try again or enter values manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">AI Cost Estimator</h3>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Upload contractor quotes, inspiration photos, or describe your project. 
        AI will analyze and estimate costs based on your local market.
      </p>

      {/* File Upload Section */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Upload Documents</p>
              <p className="text-xs text-gray-500">Quotes, plans, specs</p>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Upload Photos</p>
              <p className="text-xs text-gray-500">Current space, inspiration</p>
            </div>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Uploaded Files ({uploadedFiles.length})
            </p>
            <div className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                  <span className="text-gray-700 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-600 hover:text-red-800 ml-2 p-1"
                    style={{ minHeight: '24px', minWidth: '24px' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Description */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Or describe your project:
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: I want to remodel my kitchen with new quartz countertops, white shaker cabinets, subway tile backsplash, and stainless steel appliances. Kitchen is approximately 150 sq ft."
          rows={4}
          className="resize-none"
          style={{ minHeight: '120px' }}
          disabled={loading}
        />
      </div>

      {/* Generate Button */}
      <Button
        type="button"
        onClick={generateEstimate}
        disabled={loading || (!description && uploadedFiles.length === 0)}
        className="w-full bg-blue-600 hover:bg-blue-700"
        style={{ minHeight: '48px' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Estimate with AI
          </>
        )}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Estimate Result */}
      {estimate && (
        <div className="mt-4 bg-white border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-green-900">AI-Generated Estimate</h4>
          </div>

          <div className="space-y-3">
            {/* Cost Range */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Estimated Cost Range</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estimate.cost_min?.toLocaleString()} - ${estimate.cost_max?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Average: ${estimate.cost_average?.toLocaleString()}
              </p>
            </div>

            {/* Value Impact */}
            {estimate.value_impact > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Expected Value Increase</p>
                <p className="text-xl font-bold text-green-700">
                  +${estimate.value_impact?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ROI: {estimate.roi_percent}%
                </p>
              </div>
            )}

            {/* Breakdown */}
            {estimate.breakdown && (
              <div className="pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">Cost Breakdown</p>
                <div className="space-y-1">
                  {Object.entries(estimate.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-semibold">${value?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {estimate.insights && estimate.insights.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">💡 AI Insights</p>
                <ul className="space-y-1">
                  {estimate.insights.map((insight, i) => (
                    <li key={i} className="text-xs text-gray-700">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence & Disclaimer */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Confidence Level:</span>
                <span className={`text-xs font-semibold ${
                  estimate.confidence === 'High' ? 'text-green-600' :
                  estimate.confidence === 'Medium' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {estimate.confidence || 'Medium'}
                </span>
              </div>
              <p className="text-xs text-gray-500 italic">
                This is an AI-generated estimate based on market data. 
                Always get multiple professional quotes before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}