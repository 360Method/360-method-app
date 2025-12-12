import React, { useState } from "react";
import { StrategicRecommendation, PreservationRecommendation, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Download,
  Sparkles,
  DollarSign,
  Home,
  Percent,
  Calculator,
  Shield,
  Lightbulb,
  FileSpreadsheet,
  File
} from "lucide-react";
import DisclaimerBox from "./DisclaimerBox";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

export default function StrategicAnalysisCard({ recommendations, equityData, properties, selectedProperty }) {
  const [expandedRec, setExpandedRec] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const queryClient = useQueryClient();

  const isPortfolioView = selectedProperty === 'all';

  // For single property view
  const singleEquity = !isPortfolioView && equityData.length > 0 ? equityData[0] : null;
  const singleProperty = !isPortfolioView ? properties.find(p => p.id === selectedProperty) : null;
  const singleRecommendation = !isPortfolioView && recommendations.length > 0 ? recommendations[0] : null;

  // Fetch PRESERVE recommendations for context
  const { data: preserveRecs = [] } = useQuery({
    queryKey: ['preserve-recs-for-analysis', selectedProperty],
    queryFn: () => selectedProperty && selectedProperty !== 'all'
      ? PreservationRecommendation.filter({ 
          property_id: selectedProperty,
          status: 'PENDING'
        })
      : Promise.resolve([]),
    enabled: !!selectedProperty && selectedProperty !== 'all'
  });

  // Generate AI recommendation
  const generateRecommendation = useMutation({
    mutationFn: async (propertyId) => {
      const equity = equityData.find(e => e.property_id === propertyId);
      const property = properties.find(p => p.id === propertyId);
      const preserveData = await PreservationRecommendation.filter({ 
        property_id: propertyId,
        status: 'PENDING'
      });

      const upcomingCapex = preserveData.reduce((sum, r) => sum + (r.estimated_cost_min || 0), 0);
      const criticalSystems = preserveData.filter(r => r.priority === 'URGENT').length;

      // Build AI prompt
      const prompt = `You are a portfolio CFO analyzing a real estate investment. Provide strategic recommendation.

PROPERTY DETAILS:
- Address: ${property.address}
- Type: ${equity.is_rental ? 'Rental Property' : 'Primary Residence'}
- Climate Zone: ${property.climate_zone || 'Zone 4: Pacific NW'}

FINANCIAL POSITION:
- Current Market Value: $${equity.current_market_value?.toLocaleString()}
- Mortgage Balance: $${equity.mortgage_balance?.toLocaleString()}
- Interest Rate: ${equity.mortgage_interest_rate}%
- Net Equity: $${equity.equity_dollars?.toLocaleString()} (${equity.equity_percentage?.toFixed(1)}%)
${equity.mortgage_payoff_date ? `- Payoff Date: ${new Date(equity.mortgage_payoff_date).toLocaleDateString()}` : ''}

${equity.is_rental ? `
RENTAL PERFORMANCE:
- Monthly Rent: $${equity.monthly_rent_income || 0}
- Monthly Expenses: $${equity.monthly_operating_expenses || 0}
- Monthly NOI: $${equity.monthly_noi || 0}
- Cap Rate: ${equity.cap_rate?.toFixed(1)}%
- Cash-on-Cash Return: ${equity.cash_on_cash_return?.toFixed(1)}%
` : ''}

PRESERVE STATUS:
- Upcoming System Replacements: $${upcomingCapex.toLocaleString()}
- Critical Systems: ${criticalSystems}
${preserveData.length > 0 ? `- Systems at Risk: ${preserveData.map(r => r.title).join(', ')}` : ''}

MARKET CONTEXT:
- Current 30-Year Rates: ~7.0% (estimate)
- Rate Differential: ${equity.mortgage_interest_rate ? (7.0 - equity.mortgage_interest_rate).toFixed(2) : 'N/A'}% higher than your rate

Provide strategic recommendation. Output JSON with:
1. recommendation: "HOLD" | "SELL" | "REFINANCE" | "HOLD_AND_PRESERVE" | "HOLD_AND_UPGRADE"
2. confidence_score: 1-10
3. reasoning_summary: Brief 2-3 sentence summary
4. pros: Array of 3-5 positive factors
5. cons: Array of 2-4 concerns
6. key_factors: Array of 5-7 decision factors
7. action_items: Object with immediate[], short_term[], long_term[] arrays
8. timeline: "Within X months/years"
9. risk_factors: Array of risks
10. tax_implications: Paragraph about tax considerations
11. market_conditions: Paragraph about current market

Be direct, data-driven, and actionable.`;

      const analysis = await integrations.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            confidence_score: { type: "number" },
            reasoning_summary: { type: "string" },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } },
            key_factors: { type: "array", items: { type: "string" } },
            action_items: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } }
              }
            },
            timeline: { type: "string" },
            risk_factors: { type: "array", items: { type: "string" } },
            tax_implications: { type: "string" },
            market_conditions: { type: "string" }
          }
        }
      });

      // Calculate sell proceeds
      const closingCostPct = 0.06;
      const grossProceeds = equity.current_market_value;
      const payoffMortgage = equity.total_debt;
      const closingCosts = grossProceeds * closingCostPct;
      const netProceeds = grossProceeds - payoffMortgage - closingCosts;
      const capitalGainsTax = equity.is_rental ? (grossProceeds - (equity.purchase_price || grossProceeds)) * 0.15 : 0;

      // Create recommendation record
      const recommendation = await StrategicRecommendation.create({
        property_id: propertyId,
        portfolio_equity_id: equity.id,
        recommendation: analysis.recommendation,
        confidence_score: analysis.confidence_score,
        reasoning_summary: analysis.reasoning_summary,
        pros: analysis.pros,
        cons: analysis.cons,
        key_factors: analysis.key_factors,
        sell_net_proceeds: netProceeds,
        sell_capital_gains_tax: capitalGainsTax,
        action_items: analysis.action_items,
        timeline: analysis.timeline,
        risk_factors: analysis.risk_factors,
        tax_implications: analysis.tax_implications,
        market_conditions: analysis.market_conditions,
        preserve_impact: upcomingCapex > 0 ? `${criticalSystems} critical systems need attention, $${upcomingCapex.toLocaleString()} investment required` : 'No urgent preservation needs',
        generated_date: new Date().toISOString(),
        ai_model_version: 'claude-sonnet-4',
        status: 'PENDING_REVIEW'
      });

      return recommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-recommendations']);
      setGenerating(false);
      setGenerationError(null);
    },
    onError: (error) => {
      console.error('AI analysis failed:', error);
      setGenerating(false);
      setGenerationError(error.message || 'Failed to generate AI analysis. Showing manual analysis instead.');
    }
  });

  // Generate static analysis based on property data (no AI needed)
  const generateStaticAnalysis = (equity, property, preserveData = []) => {
    if (!equity || !property) return null;

    const analysis = {
      equityPosition: equity.equity_percentage || 0,
      interestRate: equity.mortgage_interest_rate || 0,
      isRental: equity.is_rental || false,
      capRate: equity.cap_rate || 0,
      currentValue: equity.current_market_value || 0,
      mortgageBalance: equity.mortgage_balance || equity.total_debt || 0,
      netEquity: equity.equity_dollars || 0,
      preserveNeeds: preserveData.length,
      urgentSystems: preserveData.filter(r => r.priority === 'URGENT').length,
      preserveCost: preserveData.reduce((sum, r) => sum + (r.estimated_cost_min || 0), 0)
    };

    // Determine recommendation based on data
    let recommendation = 'HOLD';
    let confidence = 7;
    let reasoning = '';
    const pros = [];
    const cons = [];
    const actions = [];

    // Interest rate analysis
    if (analysis.interestRate > 0 && analysis.interestRate < 4.5) {
      pros.push(`Excellent interest rate (${analysis.interestRate}%) - significantly below current market rates (~7%)`);
      cons.push('Refinancing would increase your monthly payment');
    } else if (analysis.interestRate >= 7) {
      cons.push(`High interest rate (${analysis.interestRate}%) - consider refinancing when rates drop`);
    }

    // Equity position analysis
    if (analysis.equityPosition >= 50) {
      pros.push(`Strong equity position (${analysis.equityPosition.toFixed(1)}%) - low risk of being underwater`);
    } else if (analysis.equityPosition >= 20) {
      pros.push(`Healthy equity (${analysis.equityPosition.toFixed(1)}%) - good cushion against market fluctuations`);
    } else if (analysis.equityPosition < 15) {
      cons.push(`Low equity (${analysis.equityPosition.toFixed(1)}%) - vulnerable to market downturns`);
      confidence -= 1;
    }

    // Rental analysis
    if (analysis.isRental) {
      if (analysis.capRate >= 6) {
        pros.push(`Strong cap rate (${analysis.capRate.toFixed(1)}%) - above market average`);
      } else if (analysis.capRate >= 4) {
        pros.push(`Decent cap rate (${analysis.capRate.toFixed(1)}%) - acceptable returns`);
      } else if (analysis.capRate > 0 && analysis.capRate < 4) {
        cons.push(`Low cap rate (${analysis.capRate.toFixed(1)}%) - consider rent increase or expense reduction`);
      }
    }

    // Preservation needs
    if (analysis.urgentSystems > 0) {
      cons.push(`${analysis.urgentSystems} system(s) need urgent attention - $${analysis.preserveCost.toLocaleString()} estimated`);
      recommendation = 'HOLD_AND_PRESERVE';
      actions.push(`Address ${analysis.urgentSystems} urgent system(s) in PRESERVE step`);
    } else if (analysis.preserveNeeds > 0) {
      actions.push(`Plan for ${analysis.preserveNeeds} upcoming maintenance items`);
    }

    // Build reasoning
    if (analysis.interestRate > 0 && analysis.interestRate < 4.5) {
      reasoning = `With a ${analysis.interestRate}% interest rate locked in, holding this property is strongly recommended. Current market rates (~7%) make refinancing unattractive.`;
    } else if (analysis.equityPosition >= 40) {
      reasoning = `Strong equity position of ${analysis.equityPosition.toFixed(1)}% provides excellent flexibility. Continue building wealth through appreciation and debt paydown.`;
    } else {
      reasoning = `Property shows solid fundamentals. Continue monitoring market conditions and maintain regular maintenance.`;
    }

    // Add general actions
    actions.push('Review property insurance coverage annually');
    actions.push('Track local market trends and comparable sales');
    if (!analysis.isRental) {
      actions.push('Consider house-hacking or rental options to boost returns');
    }

    return {
      recommendation,
      confidence,
      reasoning,
      pros,
      cons,
      actions,
      metrics: analysis
    };
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'HOLD': return <Badge className="bg-green-600 text-white">HOLD</Badge>;
      case 'SELL': return <Badge className="bg-red-600 text-white">SELL</Badge>;
      case 'REFINANCE': return <Badge className="bg-blue-600 text-white">REFINANCE</Badge>;
      case 'HOLD_AND_PRESERVE': return <Badge className="bg-purple-600 text-white">HOLD & PRESERVE</Badge>;
      case 'HOLD_AND_UPGRADE': return <Badge className="bg-orange-600 text-white">HOLD & UPGRADE</Badge>;
      default: return null;
    }
  };

  // Export CSV for strategic analysis
  const exportCSV = (recommendation, property, equity) => {
    if (!recommendation && !equity) {
      alert('No analysis data to export');
      return;
    }

    const rows = [
      ['Strategic Property Analysis Report'],
      [`Property: ${property?.address || 'Property'}`],
      [`Generated: ${format(new Date(), 'yyyy-MM-dd')}`],
      [''],
      ['RECOMMENDATION'],
      ['Decision', recommendation?.recommendation || 'HOLD'],
      ['Confidence Score', recommendation?.confidence_score ? `${recommendation.confidence_score}/10` : 'N/A'],
      ['Summary', recommendation?.reasoning_summary || 'Data-driven analysis based on property metrics'],
      [''],
      ['FINANCIAL POSITION'],
      ['Current Market Value', `$${equity?.current_market_value?.toLocaleString() || 0}`],
      ['Mortgage Balance', `$${equity?.mortgage_balance?.toLocaleString() || 0}`],
      ['Net Equity', `$${equity?.equity_dollars?.toLocaleString() || 0}`],
      ['Equity Percentage', `${equity?.equity_percentage?.toFixed(1) || 0}%`],
      ['Interest Rate', `${equity?.mortgage_interest_rate || 'N/A'}%`],
      [''],
    ];

    if (recommendation?.pros?.length > 0) {
      rows.push(['STRENGTHS']);
      recommendation.pros.forEach(pro => rows.push([pro]));
      rows.push(['']);
    }

    if (recommendation?.cons?.length > 0) {
      rows.push(['CONSIDERATIONS']);
      recommendation.cons.forEach(con => rows.push([con]));
      rows.push(['']);
    }

    if (recommendation?.action_items) {
      rows.push(['ACTION ITEMS']);
      if (recommendation.action_items.immediate?.length > 0) {
        rows.push(['Immediate (0-3 months):']);
        recommendation.action_items.immediate.forEach(item => rows.push([`  - ${item}`]));
      }
      if (recommendation.action_items.short_term?.length > 0) {
        rows.push(['Short-term (1-2 years):']);
        recommendation.action_items.short_term.forEach(item => rows.push([`  - ${item}`]));
      }
      if (recommendation.action_items.long_term?.length > 0) {
        rows.push(['Long-term (2-5 years):']);
        recommendation.action_items.long_term.forEach(item => rows.push([`  - ${item}`]));
      }
    }

    const csvContent = rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strategic-analysis-${property?.address?.replace(/[^a-z0-9]/gi, '-') || 'property'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF for strategic analysis
  const exportPDF = (recommendation, property, equity) => {
    if (!recommendation && !equity) {
      alert('No analysis data to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    const recBadgeColor = {
      'HOLD': '#16a34a',
      'SELL': '#dc2626',
      'REFINANCE': '#2563eb',
      'HOLD_AND_PRESERVE': '#7c3aed',
      'HOLD_AND_UPGRADE': '#ea580c'
    };
    const badgeColor = recBadgeColor[recommendation?.recommendation] || '#16a34a';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Strategic Analysis - ${property?.address || 'Property'}</title>
  <style>
    @media print {
      @page { margin: 0.5in; size: letter; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }
    .header h1 { color: #1B365D; font-size: 28px; margin: 0 0 10px 0; }
    .header .subtitle { font-size: 18px; color: #6b7280; margin: 5px 0; }
    .header .date { font-size: 14px; color: #9ca3af; }
    .recommendation-box {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border: 3px solid ${badgeColor};
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .recommendation-badge {
      display: inline-block;
      background: ${badgeColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 24px;
      margin-bottom: 15px;
    }
    .confidence { font-size: 18px; color: #6b7280; }
    .confidence strong { color: #1f2937; font-size: 24px; }
    .reasoning { margin-top: 15px; font-size: 16px; color: #4b5563; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .metric-card {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }
    .metric-card.value { background: #eff6ff; border-color: #bfdbfe; }
    .metric-card.debt { background: #fef2f2; border-color: #fecaca; }
    .metric-card.equity { background: #dcfce7; border-color: #86efac; }
    .metric-card.rate { background: #faf5ff; border-color: #e9d5ff; }
    .metric-card .number { font-size: 24px; font-weight: bold; margin: 8px 0; }
    .metric-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .section { margin: 30px 0; }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1B365D;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pros-list, .cons-list { margin: 0; padding: 0; list-style: none; }
    .pros-list li { padding: 10px 12px; margin-bottom: 8px; background: #dcfce7; border-left: 4px solid #10b981; border-radius: 4px; font-size: 14px; }
    .cons-list li { padding: 10px 12px; margin-bottom: 8px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 14px; }
    .action-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .action-timeline { margin-bottom: 15px; }
    .action-timeline h4 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .action-timeline.immediate h4 { color: #dc2626; }
    .action-timeline.short h4 { color: #ea580c; }
    .action-timeline.long h4 { color: #2563eb; }
    .action-timeline ul { margin: 0; padding-left: 20px; }
    .action-timeline li { font-size: 13px; margin-bottom: 5px; }
    .sell-scenario {
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .sell-scenario h4 { color: #1e40af; margin-bottom: 15px; }
    .sell-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dbeafe; font-size: 14px; }
    .sell-row.total { border-top: 2px solid #3b82f6; font-weight: bold; font-size: 16px; }
    .disclaimer {
      margin-top: 30px;
      padding: 15px;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      font-size: 11px;
      color: #92400e;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <h1>Strategic Property Analysis</h1>
    <div class="subtitle">${property?.address || 'Property'}</div>
    <div class="date">Generated on ${format(new Date(), 'MMMM d, yyyy')}</div>
  </div>

  <div class="recommendation-box">
    <div class="recommendation-badge">${recommendation?.recommendation?.replace(/_/g, ' ') || 'HOLD'}</div>
    <div class="confidence">Confidence: <strong>${recommendation?.confidence_score || 7}/10</strong></div>
    <div class="reasoning">${recommendation?.reasoning_summary || 'Based on current financial position and market conditions.'}</div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card value">
      <div class="label">Market Value</div>
      <div class="number" style="color: #2563eb;">$${equity?.current_market_value?.toLocaleString() || 0}</div>
    </div>
    <div class="metric-card debt">
      <div class="label">Mortgage Balance</div>
      <div class="number" style="color: #dc2626;">$${equity?.mortgage_balance?.toLocaleString() || 0}</div>
    </div>
    <div class="metric-card equity">
      <div class="label">Net Equity</div>
      <div class="number" style="color: #16a34a;">$${equity?.equity_dollars?.toLocaleString() || 0}</div>
    </div>
    <div class="metric-card rate">
      <div class="label">Interest Rate</div>
      <div class="number" style="color: #7c3aed;">${equity?.mortgage_interest_rate || 'N/A'}%</div>
    </div>
  </div>

  ${(recommendation?.pros?.length > 0 || recommendation?.cons?.length > 0) ? `
  <div class="section">
    <h3 class="section-title">Analysis Summary</h3>
    <div class="pros-cons">
      ${recommendation?.pros?.length > 0 ? `
      <div>
        <h4 style="color: #16a34a; margin-bottom: 10px;">Strengths</h4>
        <ul class="pros-list">
          ${recommendation.pros.map(pro => `<li>${pro}</li>`).join('')}
        </ul>
      </div>
      ` : '<div></div>'}
      ${recommendation?.cons?.length > 0 ? `
      <div>
        <h4 style="color: #ea580c; margin-bottom: 10px;">Considerations</h4>
        <ul class="cons-list">
          ${recommendation.cons.map(con => `<li>${con}</li>`).join('')}
        </ul>
      </div>
      ` : '<div></div>'}
    </div>
  </div>
  ` : ''}

  ${recommendation?.action_items ? `
  <div class="section page-break">
    <h3 class="section-title">Action Plan</h3>
    <div class="action-section">
      ${recommendation.action_items.immediate?.length > 0 ? `
      <div class="action-timeline immediate">
        <h4>Immediate (0-3 months)</h4>
        <ul>
          ${recommendation.action_items.immediate.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      ${recommendation.action_items.short_term?.length > 0 ? `
      <div class="action-timeline short">
        <h4>Short-Term (1-2 years)</h4>
        <ul>
          ${recommendation.action_items.short_term.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      ${recommendation.action_items.long_term?.length > 0 ? `
      <div class="action-timeline long">
        <h4>Long-Term (2-5 years)</h4>
        <ul>
          ${recommendation.action_items.long_term.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${recommendation?.sell_net_proceeds ? `
  <div class="sell-scenario">
    <h4>Sell Scenario Analysis</h4>
    <div class="sell-row">
      <span>Gross Proceeds</span>
      <span>$${equity?.current_market_value?.toLocaleString()}</span>
    </div>
    <div class="sell-row">
      <span>Mortgage Payoff</span>
      <span>-$${equity?.mortgage_balance?.toLocaleString()}</span>
    </div>
    <div class="sell-row">
      <span>Closing Costs (6%)</span>
      <span>-$${(equity?.current_market_value * 0.06)?.toLocaleString()}</span>
    </div>
    ${recommendation.sell_capital_gains_tax > 0 ? `
    <div class="sell-row">
      <span>Capital Gains Tax</span>
      <span>-$${recommendation.sell_capital_gains_tax?.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="sell-row total">
      <span>Net Proceeds</span>
      <span>$${recommendation.sell_net_proceeds?.toLocaleString()}</span>
    </div>
  </div>
  ` : ''}

  ${recommendation?.tax_implications ? `
  <div class="section">
    <h3 class="section-title">Tax Implications</h3>
    <p style="font-size: 14px; color: #4b5563;">${recommendation.tax_implications}</p>
  </div>
  ` : ''}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> This strategic analysis is for informational purposes only and should not be considered
    financial, tax, or legal advice. The recommendations are based on available data and general market conditions.
    Individual circumstances vary significantly. Please consult with qualified financial advisors, tax professionals,
    and real estate attorneys before making investment decisions.
  </div>

  <div class="footer">
    <p>Generated by 360° Method Property Management Platform</p>
    <p>Report Date: ${format(new Date(), 'MMMM d, yyyy • h:mm a')}</p>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  // Single property view
  if (!isPortfolioView && singleProperty) {

    // No AI recommendation yet - show static analysis
    if (!singleRecommendation && !generating) {
      const staticAnalysis = generateStaticAnalysis(singleEquity, singleProperty, preserveRecs);

      return (
        <div className="space-y-6">
          {/* Error banner if AI failed */}
          {generationError && (
            <Card className="border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 text-sm">AI Analysis Unavailable</p>
                    <p className="text-sm text-yellow-800">Showing data-driven analysis instead. AI features will be available soon.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Static Analysis Card */}
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Strategic Analysis
              </CardTitle>
              <p className="text-sm text-gray-600">{singleProperty.address}</p>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">Net Equity</span>
                  </div>
                  <p className="text-xl font-bold text-green-700">
                    ${(staticAnalysis?.metrics?.netEquity || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Equity %</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700">
                    {(staticAnalysis?.metrics?.equityPosition || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-600">Interest Rate</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700">
                    {staticAnalysis?.metrics?.interestRate || 'N/A'}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600">Market Value</span>
                  </div>
                  <p className="text-xl font-bold text-orange-700">
                    ${(staticAnalysis?.metrics?.currentValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Recommendation Badge */}
              {staticAnalysis && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">DATA-DRIVEN RECOMMENDATION</p>
                      {getRecommendationBadge(staticAnalysis.recommendation)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Confidence</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {staticAnalysis.confidence}/10
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-3">{staticAnalysis.reasoning}</p>
                </div>
              )}

              {/* Pros & Cons */}
              {staticAnalysis && (
                <div className="grid md:grid-cols-2 gap-4">
                  {staticAnalysis.pros.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {staticAnalysis.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-green-800">✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {staticAnalysis.cons.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Considerations
                      </h4>
                      <ul className="space-y-1">
                        {staticAnalysis.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-orange-800">⚠️ {con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {staticAnalysis && staticAnalysis.actions.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-1">
                    {staticAnalysis.actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-blue-800">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link to PRESERVE if needed */}
              {preserveRecs.length > 0 && (
                <div className="pt-4 border-t">
                  <Link to={createPageUrl('Preserve') + `?property=${selectedProperty}`}>
                    <Button variant="outline" className="w-full" style={{ minHeight: '48px' }}>
                      <Shield className="w-4 h-4 mr-2" />
                      View {preserveRecs.length} PRESERVE Recommendation{preserveRecs.length !== 1 ? 's' : ''} →
                    </Button>
                  </Link>
                </div>
              )}

              {/* AI Analysis Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setGenerating(true);
                    setGenerationError(null);
                    generateRecommendation.mutate(selectedProperty);
                  }}
                  disabled={!singleEquity || generateRecommendation.isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  style={{ minHeight: '48px' }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Detailed AI Analysis
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  AI analysis includes tax implications, market conditions, and detailed action plans
                </p>
              </div>

            </CardContent>
          </Card>
          <DisclaimerBox />
        </div>
      );
    }

    // Generating
    if (generating || generateRecommendation.isLoading) {
      return (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Property...</h3>
            <p className="text-gray-600">
              AI is analyzing market data, equity position, preservation needs, and strategic factors...
            </p>
          </CardContent>
        </Card>
      );
    }

    // Show recommendation
    if (singleRecommendation) {
      const isExpanded = expandedRec === singleRecommendation.id;

      return (
        <div className="space-y-6">
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    AI Strategic Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">{singleProperty.address}</p>
                </div>
                <button
                  onClick={() => setExpandedRec(isExpanded ? null : singleRecommendation.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Recommendation */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">RECOMMENDATION</p>
                    {getRecommendationBadge(singleRecommendation.recommendation)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {singleRecommendation.confidence_score}/10
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3">{singleRecommendation.reasoning_summary}</p>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4">
                {singleRecommendation.pros && singleRecommendation.pros.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {singleRecommendation.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-green-800">✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {singleRecommendation.cons && singleRecommendation.cons.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {singleRecommendation.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-orange-800">⚠️ {con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t">
                  
                  {/* Action Plan */}
                  {singleRecommendation.action_items && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📋 ACTION PLAN</h4>
                      
                      {singleRecommendation.action_items.immediate?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-red-700 mb-2">IMMEDIATE (0-3 months):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.immediate.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {singleRecommendation.action_items.short_term?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-orange-700 mb-2">SHORT-TERM (1-2 years):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.short_term.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {singleRecommendation.action_items.long_term?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">LONG-TERM (2-5 years):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.long_term.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {preserveRecs.length > 0 && (
                        <div className="mt-4">
                          <Link to={createPageUrl('Preserve') + `?property=${selectedProperty}`}>
                            <Button variant="outline" size="sm">
                              View {preserveRecs.length} PRESERVE Recommendation{preserveRecs.length !== 1 ? 's' : ''} →
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sell Scenario */}
                  {singleRecommendation.sell_net_proceeds && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-blue-900 mb-2">🚩 SELL SCENARIO</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-800">
                          Gross proceeds: <strong>${singleEquity.current_market_value?.toLocaleString()}</strong>
                        </p>
                        <p className="text-blue-800">
                          Payoff mortgage: <strong>-${singleEquity.total_debt?.toLocaleString()}</strong>
                        </p>
                        <p className="text-blue-800">
                          Closing costs (6%): <strong>-${(singleEquity.current_market_value * 0.06).toLocaleString()}</strong>
                        </p>
                        {singleRecommendation.sell_capital_gains_tax > 0 && (
                          <p className="text-blue-800">
                            Capital gains tax: <strong>-${singleRecommendation.sell_capital_gains_tax.toLocaleString()}</strong>
                          </p>
                        )}
                        <p className="text-blue-900 font-bold pt-2 border-t border-blue-200">
                          Net proceeds: ${singleRecommendation.sell_net_proceeds.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tax Implications */}
                  {singleRecommendation.tax_implications && (
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
                      <h4 className="font-semibold text-yellow-900 mb-2">💼 Tax Implications</h4>
                      <p className="text-sm text-yellow-800">{singleRecommendation.tax_implications}</p>
                    </div>
                  )}

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setExpandedRec(isExpanded ? null : singleRecommendation.id)}
                  style={{ minHeight: '44px' }}
                >
                  {isExpanded ? 'Hide Details' : 'Show Full Analysis'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" style={{ minHeight: '44px' }}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() => exportCSV(singleRecommendation, singleProperty, singleEquity)}
                      className="gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => exportPDF(singleRecommendation, singleProperty, singleEquity)}
                      className="gap-2 cursor-pointer"
                    >
                      <File className="w-4 h-4" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => generateRecommendation.mutate(selectedProperty)}
                  disabled={generateRecommendation.isLoading}
                  style={{ minHeight: '44px' }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>

            </CardContent>
          </Card>

          <DisclaimerBox />
        </div>
      );
    }
  }

  // Portfolio view (multiple properties)
  if (isPortfolioView && recommendations.length > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 text-sm mb-1">Portfolio-Level Strategy</p>
                <p className="text-sm text-purple-800">
                  Review each property's strategic recommendation below. AI analyzes each property independently based on its unique financial position and market conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {recommendations.map((rec) => {
          const property = properties.find(p => p.id === rec.property_id);
          const equity = equityData.find(e => e.property_id === rec.property_id);
          const isExpanded = expandedRec === rec.id;

          return (
            <Card key={rec.id} className="border-2 border-gray-200">
              <CardHeader>
                <button
                  onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                  className="w-full flex items-start justify-between gap-3 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getRecommendationBadge(rec.recommendation)}
                      <Badge variant="outline">
                        Confidence: {rec.confidence_score}/10
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{property?.address || 'Unknown Property'}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{rec.reasoning_summary}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {/* Expanded details same as single view */}
                  <div className="space-y-4">
                    {rec.pros?.length > 0 && (
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-600">
                        <p className="font-semibold text-green-900 text-sm mb-2">✓ Strengths:</p>
                        <ul className="space-y-1">
                          {rec.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-green-800">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rec.cons?.length > 0 && (
                      <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-600">
                        <p className="font-semibold text-orange-900 text-sm mb-2">⚠️ Considerations:</p>
                        <ul className="space-y-1">
                          {rec.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-orange-800">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        <DisclaimerBox />
      </div>
    );
  }

  // Empty state - show helpful guidance
  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Strategic Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What you need */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              To Generate Strategic Analysis, Add:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Property financial data:</strong> Purchase price, current value estimate, mortgage balance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Mortgage details:</strong> Interest rate, monthly payment, loan term</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>For rentals:</strong> Monthly rent income, operating expenses</span>
              </li>
            </ul>
          </div>

          {/* What you'll get */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h5 className="font-semibold text-green-900 text-sm">Hold/Sell Analysis</h5>
              <p className="text-xs text-green-700 mt-1">Data-driven recommendation</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h5 className="font-semibold text-purple-900 text-sm">Equity Insights</h5>
              <p className="text-xs text-purple-700 mt-1">Position and projections</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h5 className="font-semibold text-blue-900 text-sm">Action Items</h5>
              <p className="text-xs text-blue-700 mt-1">Specific next steps</p>
            </div>
          </div>

          {/* CTA */}
          {selectedProperty && selectedProperty !== 'all' && (
            <div className="pt-4 border-t">
              <Link to={createPageUrl('Properties') + `?complete=${selectedProperty}`}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" style={{ minHeight: '48px' }}>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Add Financial Data to Property
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <DisclaimerBox />
    </div>
  );
}