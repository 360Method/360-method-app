import React, { useState } from 'react';
import { X, CheckCircle, DollarSign, Home, TrendingUp, Receipt, ArrowRight, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PropertyProfileWizard({ property, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    // Purchase Info
    purchase_price: property.purchase_price || '',
    purchase_date: property.purchase_date || '',
    closing_costs: property.closing_costs || '',
    down_payment_percent: property.down_payment_percent || 20,
    
    // Current Valuation
    current_value: property.current_value || '',
    
    // Financing
    mortgage_balance: property.mortgage_balance || '',
    monthly_mortgage_payment: property.monthly_mortgage_payment || '',
    interest_rate: property.interest_rate || '',
    loan_term_years: property.loan_term_years || 30,
    
    // Income (if rental)
    is_rental: property.property_use_type?.includes('rental') || false,
    monthly_rent: property.monthly_rent || '',
    
    // Expenses
    monthly_insurance: property.monthly_insurance || '',
    monthly_taxes: property.monthly_taxes || '',
    monthly_hoa: property.monthly_hoa || 0,
    estimated_maintenance: property.estimated_maintenance || ''
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🟢 WIZARD: Saving property profile');
      console.log('🟢 WIZARD: Property ID:', property.id);
      console.log('🟢 WIZARD: Data to save:', JSON.stringify(data, null, 2));
      
      // Step 1: Update property with financial data
      const propertyResult = await base44.entities.Property.update(property.id, data);
      console.log('🟢 WIZARD: Property save result:', JSON.stringify(propertyResult, null, 2));
      
      // Step 2: Create or update PortfolioEquity record
      console.log('🟢 WIZARD: Checking for existing PortfolioEquity...');
      const existingEquity = await base44.entities.PortfolioEquity.filter({ property_id: property.id });
      console.log('🟢 WIZARD: Existing equity records:', existingEquity);
      
      const equityData = {
        property_id: property.id,
        current_market_value: data.current_value,
        valuation_date: new Date().toISOString().split('T')[0],
        valuation_source: 'User Estimate',
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        mortgage_balance: data.mortgage_balance,
        mortgage_interest_rate: data.interest_rate,
        mortgage_payment_monthly: data.monthly_mortgage_payment,
        total_debt: data.mortgage_balance,
        equity_dollars: data.current_value - data.mortgage_balance,
        equity_percentage: ((data.current_value - data.mortgage_balance) / data.current_value) * 100,
        is_rental: data.is_rental,
        monthly_rent_income: data.monthly_rent || 0,
        monthly_operating_expenses: (parseFloat(data.monthly_insurance) || 0) + (parseFloat(data.monthly_taxes) || 0) + (parseFloat(data.monthly_hoa) || 0) + (parseFloat(data.estimated_maintenance) || 0),
        monthly_noi: (data.monthly_rent || 0) - ((parseFloat(data.monthly_insurance) || 0) + (parseFloat(data.monthly_taxes) || 0) + (parseFloat(data.monthly_hoa) || 0) + (parseFloat(data.estimated_maintenance) || 0)),
        last_updated: new Date().toISOString().split('T')[0]
      };
      
      let equityResult;
      if (existingEquity && existingEquity.length > 0) {
        console.log('🟢 WIZARD: Updating existing PortfolioEquity:', existingEquity[0].id);
        equityResult = await base44.entities.PortfolioEquity.update(existingEquity[0].id, equityData);
      } else {
        console.log('🟢 WIZARD: Creating new PortfolioEquity');
        equityResult = await base44.entities.PortfolioEquity.create(equityData);
      }
      console.log('🟢 WIZARD: PortfolioEquity result:', JSON.stringify(equityResult, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return propertyResult;
    },
    onSuccess: async (data) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🟢 WIZARD: onSuccess called');
      console.log('🟢 WIZARD: Invalidating all queries...');
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['portfolio-equity'] });
      console.log('🟢 WIZARD: Queries invalidated');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      setTimeout(() => {
        onComplete(data);
      }, 300);
    },
    onError: (error) => {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ WIZARD: Failed to save property profile');
      console.error('❌ WIZARD: Error:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  });

  const totalSteps = 5;

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Auto-calculations
  const calculateMortgagePayment = () => {
    const principal = formData.purchase_price * (1 - formData.down_payment_percent / 100);
    const monthlyRate = (formData.interest_rate / 100) / 12;
    const numPayments = formData.loan_term_years * 12;
    
    if (principal && monthlyRate && numPayments) {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                      (Math.pow(1 + monthlyRate, numPayments) - 1);
      return Math.round(payment);
    }
    return 0;
  };

  const calculateMortgageBalance = () => {
    if (!formData.purchase_date) return 0;
    
    const purchaseDate = new Date(formData.purchase_date);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                          (now.getMonth() - purchaseDate.getMonth());
    
    const principal = formData.purchase_price * (1 - formData.down_payment_percent / 100);
    const monthlyRate = (formData.interest_rate / 100) / 12;
    const numPayments = formData.loan_term_years * 12;
    
    if (principal && monthlyRate && numPayments && monthsElapsed > 0) {
      const monthlyPayment = calculateMortgagePayment();
      const balance = principal * Math.pow(1 + monthlyRate, monthsElapsed) - 
                      monthlyPayment * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate);
      return Math.max(0, Math.round(balance));
    }
    return principal || 0;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Home className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Purchase Details</h3>
          <p className="text-sm text-gray-600">When and how much did you buy this property for?</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Purchase Price *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.purchase_price}
              onChange={(e) => updateField('purchase_price', e.target.value)}
              placeholder="285000"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Purchase Date *
          </label>
          <input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => updateField('purchase_date', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Closing Costs
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.closing_costs}
              onChange={(e) => updateField('closing_costs', e.target.value)}
              placeholder="8500"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Typically 2-5% of purchase price</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Down Payment %
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.down_payment_percent}
              onChange={(e) => updateField('down_payment_percent', e.target.value)}
              placeholder="20"
              min="0"
              max="100"
              className="w-full pr-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          {formData.purchase_price && formData.down_payment_percent && (
            <p className="text-xs text-gray-500 mt-1">
              Down payment: ${((formData.purchase_price * formData.down_payment_percent) / 100).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Current Value</h3>
          <p className="text-sm text-gray-600">What's the property worth today?</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Current Market Value *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={formData.current_value}
            onChange={(e) => updateField('current_value', e.target.value)}
            placeholder="340000"
            className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Based on recent comps, Zillow, or appraisal
        </p>
      </div>

      {formData.purchase_price && formData.current_value && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-900">Appreciation</span>
            <span className="text-lg font-bold text-green-600">
              +${(formData.current_value - formData.purchase_price).toLocaleString()}
              <span className="text-sm ml-2">
                ({(((formData.current_value - formData.purchase_price) / formData.purchase_price) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const estimatedPayment = calculateMortgagePayment();
    const estimatedBalance = calculateMortgageBalance();

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Financing Details</h3>
            <p className="text-sm text-gray-600">Mortgage and loan information</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interest Rate *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => updateField('interest_rate', e.target.value)}
                placeholder="6.5"
                className="w-full pr-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Term (years)
            </label>
            <select
              value={formData.loan_term_years}
              onChange={(e) => updateField('loan_term_years', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>

        {estimatedPayment > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">💡 Estimated Monthly Payment (P&I only):</p>
            <p className="text-2xl font-bold text-blue-600">${estimatedPayment.toLocaleString()}/mo</p>
            <button
              type="button"
              onClick={() => updateField('monthly_mortgage_payment', estimatedPayment)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Use this estimate →
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Monthly Mortgage Payment (PITI) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.monthly_mortgage_payment}
              onChange={(e) => updateField('monthly_mortgage_payment', e.target.value)}
              placeholder="1450"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Principal, Interest, Taxes, Insurance (PITI)
          </p>
        </div>

        {estimatedBalance > 0 && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900 mb-2">💡 Estimated Current Balance:</p>
            <p className="text-2xl font-bold text-purple-600">${estimatedBalance.toLocaleString()}</p>
            <button
              type="button"
              onClick={() => updateField('mortgage_balance', estimatedBalance)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Use this estimate →
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Mortgage Balance *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.mortgage_balance}
              onChange={(e) => updateField('mortgage_balance', e.target.value)}
              placeholder="245000"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Check your latest mortgage statement
          </p>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Receipt className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Income & Expenses</h3>
          <p className="text-sm text-gray-600">Monthly cash flow details</p>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={formData.is_rental}
            onChange={(e) => updateField('is_rental', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="text-sm font-semibold text-gray-700">This is a rental property</span>
        </label>
      </div>

      {formData.is_rental && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Monthly Rent Income *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.monthly_rent}
              onChange={(e) => updateField('monthly_rent', e.target.value)}
              placeholder="2200"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Monthly Expenses</h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Insurance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.monthly_insurance}
                onChange={(e) => updateField('monthly_insurance', e.target.value)}
                placeholder="145"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Taxes
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.monthly_taxes}
                onChange={(e) => updateField('monthly_taxes', e.target.value)}
                placeholder="280"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              HOA Fees
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.monthly_hoa}
                onChange={(e) => updateField('monthly_hoa', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Est. Maintenance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.estimated_maintenance}
                onChange={(e) => updateField('estimated_maintenance', e.target.value)}
                placeholder="200"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rule of thumb: 1% of home value annually
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const equity = formData.current_value - formData.mortgage_balance;
    const ltv = formData.current_value ? (formData.mortgage_balance / formData.current_value) * 100 : 0;
    const totalExpenses = parseFloat(formData.monthly_mortgage_payment || 0) + 
                          parseFloat(formData.monthly_insurance || 0) + 
                          parseFloat(formData.monthly_taxes || 0) + 
                          parseFloat(formData.monthly_hoa || 0) + 
                          parseFloat(formData.estimated_maintenance || 0);
    const netCashFlow = parseFloat(formData.monthly_rent || 0) - totalExpenses;
    const downPayment = formData.purchase_price * (formData.down_payment_percent / 100);
    const cashOnCashReturn = formData.is_rental && downPayment
      ? ((netCashFlow * 12) / downPayment) * 100 
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Review & Calculate</h3>
            <p className="text-sm text-gray-600">Your property's financial snapshot</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-800 mb-1">Equity</div>
            <div className="text-3xl font-bold text-blue-900">
              ${equity.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700 mt-2">
              {formData.current_value ? ((equity / formData.current_value) * 100).toFixed(1) : 0}% of property value
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
            <div className="text-sm text-purple-800 mb-1">Loan-to-Value</div>
            <div className="text-3xl font-bold text-purple-900">
              {ltv.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-700 mt-2">
              {ltv < 80 ? '✅ Good LTV ratio' : '⚠️ High LTV ratio'}
            </div>
          </div>

          {formData.is_rental && (
            <>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                <div className="text-sm text-green-800 mb-1">Monthly Cash Flow</div>
                <div className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}
                </div>
                <div className="text-xs text-green-700 mt-2">
                  ${formData.monthly_rent || 0} rent - ${totalExpenses.toLocaleString()} expenses
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                <div className="text-sm text-orange-800 mb-1">Cash-on-Cash Return</div>
                <div className="text-3xl font-bold text-orange-900">
                  {cashOnCashReturn.toFixed(1)}%
                </div>
                <div className="text-xs text-orange-700 mt-2">
                  Annual return on ${downPayment.toLocaleString()} down payment
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Property Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Price:</span>
              <span className="font-semibold">${parseFloat(formData.purchase_price || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-semibold">${parseFloat(formData.current_value || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mortgage Balance:</span>
              <span className="font-semibold">${parseFloat(formData.mortgage_balance || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900 font-semibold">Equity:</span>
              <span className="font-bold text-blue-600">${equity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-green-900 mb-2">Profile Complete!</h4>
              <p className="text-green-800 text-sm">
                Your property profile is now complete. We can now calculate accurate equity, 
                ROI, cash flow, and wealth projections for your portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    switch(step) {
      case 1:
        return formData.purchase_price && formData.purchase_date;
      case 2:
        return formData.current_value;
      case 3:
        return formData.interest_rate && formData.monthly_mortgage_payment && formData.mortgage_balance;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    const equity = formData.current_value - formData.mortgage_balance;
    const ltv = formData.current_value ? (formData.mortgage_balance / formData.current_value) * 100 : 0;
    const totalExpenses = parseFloat(formData.monthly_mortgage_payment || 0) + 
                          parseFloat(formData.monthly_insurance || 0) + 
                          parseFloat(formData.monthly_taxes || 0) + 
                          parseFloat(formData.monthly_hoa || 0) + 
                          parseFloat(formData.estimated_maintenance || 0);
    const netCashFlow = parseFloat(formData.monthly_rent || 0) - totalExpenses;

    const completeData = {
      purchase_price: parseFloat(formData.purchase_price) || 0,
      purchase_date: formData.purchase_date,
      closing_costs: parseFloat(formData.closing_costs) || 0,
      down_payment_percent: parseFloat(formData.down_payment_percent) || 20,
      loan_term_years: parseInt(formData.loan_term_years) || 30,
      current_value: parseFloat(formData.current_value) || 0,
      mortgage_balance: parseFloat(formData.mortgage_balance) || 0,
      monthly_mortgage_payment: parseFloat(formData.monthly_mortgage_payment) || 0,
      interest_rate: parseFloat(formData.interest_rate) || 0,
      monthly_rent: parseFloat(formData.monthly_rent) || 0,
      monthly_insurance: parseFloat(formData.monthly_insurance) || 0,
      monthly_taxes: parseFloat(formData.monthly_taxes) || 0,
      monthly_hoa: parseFloat(formData.monthly_hoa) || 0,
      estimated_maintenance: parseFloat(formData.estimated_maintenance) || 0,
      financial_profile_complete: true
    };

    updatePropertyMutation.mutate(completeData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Property Profile</h2>
            <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            disabled={updatePropertyMutation.isPending}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {step > 1 && <ArrowLeft className="w-4 h-4" />}
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={updatePropertyMutation.isPending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {updatePropertyMutation.isPending ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}