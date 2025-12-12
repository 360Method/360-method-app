import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Calculator,
  DollarSign,
  Percent,
  FileText,
  FileSpreadsheet,
  File
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DisclaimerBox from "./DisclaimerBox";
import { format } from 'date-fns';

export default function WealthProjectionChart({ projections, equityData, properties }) {
  const [activeScenario, setActiveScenario] = useState('hold-all');
  const [showYearTable, setShowYearTable] = useState(false);
  const [localProjections, setLocalProjections] = useState(null);

  // Generate projection locally (no database required)
  const generateLocalProjection = (scenarioType) => {
    const currentYear = new Date().getFullYear();
    const totalCurrentValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
    const totalCurrentDebt = equityData.reduce((sum, e) => sum + (e.total_debt || e.mortgage_balance || 0), 0);
    const totalCurrentEquity = totalCurrentValue - totalCurrentDebt;

    // Different appreciation rates by scenario
    const appreciationRates = {
      'hold-all': 0.035,           // 3.5% conservative
      'ai-optimal': 0.045,         // 4.5% with optimizations
      'sell-underperformers': 0.04 // 4% moderate
    };

    const debtPaydownRates = {
      'hold-all': 0.08,            // 8% annual paydown
      'ai-optimal': 0.10,          // 10% accelerated
      'sell-underperformers': 0.09 // 9% moderate
    };

    const appreciationRate = appreciationRates[scenarioType] || 0.04;
    const debtPaydownRate = debtPaydownRates[scenarioType] || 0.08;

    const yearlyProjections = [];

    for (let year = 0; year <= 10; year++) {
      const appreciatedValue = totalCurrentValue * Math.pow(1 + appreciationRate, year);
      const remainingDebt = Math.max(0, totalCurrentDebt * Math.pow(1 - debtPaydownRate, year));

      yearlyProjections.push({
        year: currentYear + year,
        total_value: Math.round(appreciatedValue),
        total_debt: Math.round(remainingDebt),
        total_equity: Math.round(appreciatedValue - remainingDebt),
        annual_cashflow: 0
      });
    }

    const startingEquity = yearlyProjections[0].total_equity;
    const endingEquity = yearlyProjections[10].total_equity;
    const totalGain = endingEquity - startingEquity;
    const avgAnnualReturn = ((Math.pow(endingEquity / startingEquity, 1/10) - 1) * 100);

    return {
      scenario_name: scenarioType.toUpperCase().replace('-', '_'),
      scenario_description:
        scenarioType === 'hold-all' ? 'Conservative: Hold all properties with standard appreciation' :
        scenarioType === 'ai-optimal' ? 'Optimized: Strategic improvements and accelerated debt paydown' :
        'Moderate: Sell underperformers and reinvest in better returns',
      avg_appreciation_rate: appreciationRate * 100,
      yearly_projections: yearlyProjections,
      starting_equity: startingEquity,
      ending_equity: endingEquity,
      total_equity_gain: totalGain,
      avg_annual_return: avgAnnualReturn,
      is_ai_recommended: scenarioType === 'ai-optimal'
    };
  };

  // Generate all scenarios on first load or when requested
  const handleGenerateProjections = () => {
    const holdAll = generateLocalProjection('hold-all');
    const aiOptimal = generateLocalProjection('ai-optimal');
    const sellUnderperformers = generateLocalProjection('sell-underperformers');

    setLocalProjections({
      'hold-all': holdAll,
      'ai-optimal': aiOptimal,
      'sell-underperformers': sellUnderperformers
    });
  };

  // Find projection from props or local state
  const getActiveProjection = () => {
    // First check local projections
    if (localProjections && localProjections[activeScenario]) {
      return localProjections[activeScenario];
    }

    // Fall back to props
    const scenarioMap = {
      'ai-optimal': projections.find(p => p.scenario_name === 'AI_OPTIMAL' || p.is_ai_recommended),
      'hold-all': projections.find(p => p.scenario_name === 'HOLD_ALL'),
      'sell-underperformers': projections.find(p => p.scenario_name === 'SELL_UNDERPERFORMERS')
    };

    return scenarioMap[activeScenario];
  };

  const activeProjection = getActiveProjection();

  // Chart data
  const chartData = useMemo(() => {
    if (!activeProjection?.yearly_projections) return [];

    return activeProjection.yearly_projections.map(y => ({
      year: y.year,
      value: y.total_value,
      debt: y.total_debt,
      equity: y.total_equity
    }));
  }, [activeProjection]);

  // Export CSV
  const exportCSV = () => {
    if (!activeProjection?.yearly_projections) {
      alert('No projection data to export');
      return;
    }

    const headers = ['Year', 'Total Value', 'Total Debt', 'Net Equity'];
    const rows = activeProjection.yearly_projections.map(y => [
      y.year,
      y.total_value,
      y.total_debt,
      y.total_equity
    ]);

    const summaryRows = [
      ['', '', '', ''],
      ['SUMMARY', '', '', ''],
      ['Scenario', activeProjection.scenario_name, '', ''],
      ['Starting Equity', activeProjection.starting_equity, '', ''],
      ['Ending Equity', activeProjection.ending_equity, '', ''],
      ['Total Gain', activeProjection.total_equity_gain, '', ''],
      ['Avg Annual Return', `${activeProjection.avg_annual_return?.toFixed(1)}%`, '', ''],
      ['Appreciation Rate', `${activeProjection.avg_appreciation_rate?.toFixed(1)}%`, '', '']
    ];

    const csvContent = [
      `10-Year Wealth Projection - ${properties[0]?.address || 'Portfolio'}`,
      `Generated: ${format(new Date(), 'yyyy-MM-dd')}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      ...summaryRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealth-projection-${activeScenario}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF (printable HTML)
  const exportPDF = () => {
    if (!activeProjection) {
      alert('No projection data to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    const propertyList = properties.map(p => p.address || 'Property').join(', ');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>10-Year Wealth Projection - ${propertyList}</title>
  <style>
    @media print {
      @page { margin: 0.5in; size: letter; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
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
    .scenario-badge {
      display: inline-block;
      background: #7c3aed;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 10px;
    }
    .hero-section {
      background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
      border: 3px solid #10b981;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .hero-section .big-number { font-size: 48px; font-weight: bold; color: #15803d; margin: 10px 0; }
    .hero-section .label { font-size: 16px; color: #16a34a; font-weight: 600; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .metric-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .metric-card .number { font-size: 24px; font-weight: bold; margin: 8px 0; }
    .metric-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-card.starting { background: #f3f4f6; }
    .metric-card.starting .number { color: #4b5563; }
    .metric-card.ending { background: #dcfce7; }
    .metric-card.ending .number { color: #15803d; }
    .metric-card.gain { background: #d1fae5; }
    .metric-card.gain .number { color: #059669; }
    .metric-card.return { background: #ede9fe; }
    .metric-card.return .number { color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .text-green { color: #15803d; font-weight: 600; }
    .text-red { color: #dc2626; }
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
    <h1>10-Year Wealth Projection</h1>
    <div class="subtitle">${propertyList}</div>
    <div class="date">Generated on ${format(new Date(), 'MMMM d, yyyy')}</div>
    <div class="scenario-badge">${activeProjection.scenario_name?.replace(/_/g, ' ') || 'Projection'}</div>
  </div>

  <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">
    ${activeProjection.scenario_description}
  </p>

  <div class="hero-section">
    <div class="label">Projected 10-Year Equity Gain</div>
    <div class="big-number">+$${activeProjection.total_equity_gain?.toLocaleString()}</div>
    <div style="color: #059669; font-weight: 600;">
      ${activeProjection.avg_annual_return?.toFixed(1)}% Average Annual Return
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card starting">
      <div class="label">Starting Equity</div>
      <div class="number">$${activeProjection.starting_equity?.toLocaleString()}</div>
    </div>
    <div class="metric-card ending">
      <div class="label">Ending Equity</div>
      <div class="number">$${activeProjection.ending_equity?.toLocaleString()}</div>
    </div>
    <div class="metric-card gain">
      <div class="label">Total Gain</div>
      <div class="number">+$${activeProjection.total_equity_gain?.toLocaleString()}</div>
    </div>
    <div class="metric-card return">
      <div class="label">Annual Return</div>
      <div class="number">${activeProjection.avg_annual_return?.toFixed(1)}%</div>
    </div>
  </div>

  <h3 style="color: #1B365D; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
    Year-by-Year Projection
  </h3>
  <table>
    <thead>
      <tr>
        <th>Year</th>
        <th class="text-right">Total Value</th>
        <th class="text-right">Total Debt</th>
        <th class="text-right">Net Equity</th>
      </tr>
    </thead>
    <tbody>
      ${activeProjection.yearly_projections?.map((y, idx) => `
        <tr>
          <td>${y.year}</td>
          <td class="text-right">$${y.total_value?.toLocaleString()}</td>
          <td class="text-right text-red">$${y.total_debt?.toLocaleString()}</td>
          <td class="text-right text-green">$${y.total_equity?.toLocaleString()}</td>
        </tr>
      `).join('') || ''}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> These projections are for informational purposes only and are based on assumed appreciation rates
    (${activeProjection.avg_appreciation_rate?.toFixed(1)}% annually) and debt paydown schedules. Actual results may vary significantly
    based on market conditions, property maintenance, economic factors, and other variables. This is not financial advice.
    Consult with qualified financial advisors before making investment decisions.
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

  // Empty state
  if (equityData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Set Up Equity Data First</h3>
          <p className="text-gray-600">
            Add your property's financial position in the Equity Position tab to generate wealth projections.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeProjection) {
    // Calculate current totals for display
    const totalCurrentValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
    const totalCurrentDebt = equityData.reduce((sum, e) => sum + (e.total_debt || e.mortgage_balance || 0), 0);
    const totalCurrentEquity = totalCurrentValue - totalCurrentDebt;

    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              10-Year Wealth Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Position Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 text-center">
                <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Current Value</p>
                <p className="text-lg font-bold text-blue-700">${totalCurrentValue.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200 text-center">
                <Calculator className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Total Debt</p>
                <p className="text-lg font-bold text-red-700">${totalCurrentDebt.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 text-center">
                <Percent className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Net Equity</p>
                <p className="text-lg font-bold text-green-700">${totalCurrentEquity.toLocaleString()}</p>
              </div>
            </div>

            {/* What you'll see */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">See How Your Wealth Could Grow</h4>
              <p className="text-sm text-purple-800 mb-3">
                Generate projections based on historical appreciation rates and your current debt paydown schedule.
              </p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <strong>Hold All:</strong> Conservative 3.5% appreciation</li>
                <li>• <strong>Optimized:</strong> 4.5% with strategic improvements</li>
                <li>• <strong>Moderate:</strong> 4% balanced approach</li>
              </ul>
            </div>

            <Button
              onClick={handleGenerateProjections}
              className="w-full bg-purple-600 hover:bg-purple-700"
              style={{ minHeight: '48px' }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate 10-Year Projections
            </Button>
          </CardContent>
        </Card>
        <DisclaimerBox />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Scenario Selector */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Wealth Trajectory - 10-Year Projections
          </CardTitle>
          <p className="text-sm text-gray-600">
            Current Net Worth: <strong className="text-green-700">${activeProjection.starting_equity?.toLocaleString()}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="hold-all" style={{ minHeight: '48px' }}>
                Hold All
              </TabsTrigger>
              <TabsTrigger value="sell-underperformers" style={{ minHeight: '48px' }}>
                Optimize
              </TabsTrigger>
              <TabsTrigger value="ai-optimal" style={{ minHeight: '48px' }}>
                AI Optimal ⭐
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeProjection.scenario_description}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(year) => `Year ${year}`}
                />
                <Legend />
                <Area type="monotone" dataKey="value" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Total Value" />
                <Area type="monotone" dataKey="debt" stackId="2" stroke="#ef4444" fill="#fca5a5" name="Total Debt" />
                <Area type="monotone" dataKey="equity" stackId="3" stroke="#10b981" fill="#6ee7b7" name="Net Equity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 10-Year Outcomes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Starting Equity</p>
              <p className="text-xl font-bold text-gray-900">
                ${activeProjection.starting_equity?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Ending Equity</p>
              <p className="text-xl font-bold text-green-700">
                ${activeProjection.ending_equity?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Total Gain</p>
              <p className="text-xl font-bold text-green-700">
                +${activeProjection.total_equity_gain?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Annual Return</p>
              <p className="text-xl font-bold text-purple-700">
                {activeProjection.avg_annual_return?.toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>

          {/* Year-by-Year Table */}
          <div className="mt-6">
            <button
              onClick={() => setShowYearTable(!showYearTable)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              {showYearTable ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              View Year-by-Year Breakdown
            </button>

            {showYearTable && activeProjection.yearly_projections && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Value</th>
                      <th className="p-2 text-right">Debt</th>
                      <th className="p-2 text-right">Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjection.yearly_projections.map((year, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{year.year}</td>
                        <td className="p-2 text-right">${year.total_value?.toLocaleString()}</td>
                        <td className="p-2 text-right text-red-700">${year.total_debt?.toLocaleString()}</td>
                        <td className="p-2 text-right text-green-700 font-semibold">${year.total_equity?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" style={{ minHeight: '44px' }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
                  <File className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateProjections}
              style={{ minHeight: '44px' }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

        </CardContent>
      </Card>

      <DisclaimerBox />
    </div>
  );
}