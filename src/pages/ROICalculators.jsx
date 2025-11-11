import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Zap, 
  DollarSign,
  Home,
  Building2,
  Shield,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ROICalculators() {
  const calculators = [
    {
      category: "Upgrade ROI",
      icon: TrendingUp,
      color: "#28A745",
      tools: [
        {
          title: "Kitchen Remodel ROI Calculator",
          description: "Input your budget, get expected value return",
          time: "3 min"
        },
        {
          title: "Energy Efficiency Payback Calculator",
          description: "How long until savings exceed investment?",
          time: "5 min"
        },
        {
          title: "Rental Property Upgrade ROI",
          description: "Calculate rent increase vs. investment",
          time: "4 min"
        },
        {
          title: "Preventive Replacement Cost Avoidance",
          description: "Emergency cost vs. planned replacement",
          time: "3 min"
        }
      ]
    },
    {
      category: "Budget Planning",
      icon: Calculator,
      color: "#3B82F6",
      tools: [
        {
          title: "Annual Maintenance Budget Calculator",
          description: "How much should you budget? (1-3% of home value)",
          time: "2 min"
        },
        {
          title: "System Replacement Timeline",
          description: "When will major systems need replacement?",
          time: "5 min"
        },
        {
          title: "Emergency Fund Calculator",
          description: "How much should you keep in reserve?",
          time: "3 min"
        },
        {
          title: "Cascade Risk Cost Estimator",
          description: "What small fixes prevent big disasters?",
          time: "4 min"
        }
      ]
    },
    {
      category: "For Investors",
      icon: Building2,
      color: "#FF6B35",
      tools: [
        {
          title: "Cash-on-Cash Return Calculator",
          description: "Factor in maintenance costs for true ROI",
          time: "6 min"
        },
        {
          title: "Cap Rate Impact Calculator",
          description: "How upgrades affect property valuation",
          time: "5 min"
        },
        {
          title: "Turnover Cost Calculator",
          description: "True cost of vacancy and tenant turnover",
          time: "4 min"
        },
        {
          title: "Portfolio ROI Dashboard",
          description: "Track ROI across multiple properties",
          time: "8 min"
        }
      ]
    },
    {
      category: "Energy & Savings",
      icon: Zap,
      color: "#8B5CF6",
      tools: [
        {
          title: "HVAC Upgrade Savings Calculator",
          description: "Heat pump vs. old system annual savings",
          time: "4 min"
        },
        {
          title: "Insulation ROI Calculator",
          description: "Attic/wall insulation payback period",
          time: "3 min"
        },
        {
          title: "Window Replacement Savings",
          description: "Energy-efficient windows payback timeline",
          time: "4 min"
        },
        {
          title: "Solar Panel ROI Calculator",
          description: "Installation cost vs. long-term savings",
          time: "7 min"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <Link to={createPageUrl("Resources")}>
              ← Back to Resource Hub
            </Link>
          </Button>

          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            ROI Calculators & Tools
          </h1>
          <p className="text-gray-600">
            Make data-driven decisions with confidence
          </p>
          <p className="text-sm text-gray-500">
            Interactive calculators to help you prioritize and plan
          </p>
        </div>

        {/* Why It Matters */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '20px' }}>
              💡 Why ROI Matters
            </h3>
            <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Not all home improvements are created equal. A $25,000 kitchen remodel might return $21,250 in value 
              (85% ROI), while a $50,000 pool addition might only return $25,000 (50% ROI).
            </p>
            <p className="text-gray-800" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              These calculators help you make smart decisions by showing the true financial impact of every project - 
              from preventive maintenance to major upgrades.
            </p>
          </CardContent>
        </Card>

        {/* Calculator Categories */}
        {calculators.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <Icon className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '22px' }}>
                  {category.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.tools.map((tool, toolIdx) => (
                  <Card
                    key={toolIdx}
                    className="border-2 hover:shadow-lg transition-all cursor-pointer"
                    style={{ borderColor: category.color }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge style={{ backgroundColor: category.color }}>
                          {tool.time}
                        </Badge>
                        <Calculator className="w-5 h-5 text-gray-400" />
                      </div>

                      <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                        {tool.title}
                      </h3>

                      <p className="text-sm text-gray-700 mb-4">
                        {tool.description}
                      </p>

                      <Button
                        className="w-full font-semibold"
                        style={{ backgroundColor: category.color, minHeight: '48px' }}
                      >
                        Launch Calculator
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Coming Soon */}
        <Card className="border-2 border-gray-300">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
              More Calculators Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              We're constantly adding new tools based on member feedback
            </p>
            <Button
              asChild
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("Resources")}>
                Browse Other Resources
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}