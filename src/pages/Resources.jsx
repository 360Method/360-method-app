import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  Calculator, 
  Download, 
  HelpCircle, 
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  Eye,
  Zap,
  Home,
  Building2,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Resources() {
  const popularResources = [
    {
      icon: GraduationCap,
      title: "Getting Started",
      description: "New to the 360° Method? Start here",
      url: createPageUrl("ResourceGuides") + "?category=Getting Started",
      color: "#3B82F6"
    },
    {
      icon: BookOpen,
      title: "How-To Library",
      description: "Step-by-step guides for every task",
      url: createPageUrl("ResourceGuides"),
      color: "#28A745",
      badge: "64+ guides"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch and learn",
      url: createPageUrl("VideoTutorials"),
      color: "#FF6B35",
      badge: "42 videos"
    },
    {
      icon: Calculator,
      title: "ROI Calculators",
      description: "Calculate the value of upgrades",
      url: createPageUrl("ROICalculators"),
      color: "#8B5CF6"
    }
  ];

  const topics = [
    {
      phase: "AWARE Phase",
      icon: Eye,
      color: "#3B82F6",
      guides: [
        "What is Baseline?",
        "How to conduct seasonal diagnostics",
        "Tracking systems effectively",
        "Understanding system lifespans"
      ]
    },
    {
      phase: "ACT Phase",
      icon: Zap,
      color: "#FF6B35",
      guides: [
        "Prioritizing repairs by ROI",
        "Scheduling seasonal maintenance",
        "DIY vs. hiring professionals",
        "Vetting contractors"
      ]
    },
    {
      phase: "ADVANCE Phase",
      icon: TrendingUp,
      color: "#28A745",
      guides: [
        "Preserving system lifespans",
        "Strategic upgrade planning",
        "Scaling to multiple properties",
        "Portfolio optimization"
      ]
    }
  ];

  const propertyTypes = [
    {
      title: "For Homeowners",
      icon: Home,
      topics: ["Primary residence guides", "HomeCare membership tips", "Seasonal checklists", "Emergency preparedness"]
    },
    {
      title: "For Investors",
      icon: Building2,
      topics: ["Rental property management", "Portfolio optimization", "PropertyCare strategies", "Tenant coordination"]
    },
    {
      title: "For DIYers",
      icon: Wrench,
      topics: ["Tool recommendations", "Safety guidelines", "When to call a pro", "Cost-saving techniques"]
    }
  ];

  const systems = [
    "HVAC", "Plumbing", "Electrical", "Roofing", 
    "Foundation", "Exterior", "Interior", "Appliances"
  ];

  const featuredContent = [
    {
      type: "Blog Post",
      title: "The $50 Fix That Prevents $5,000 Disasters",
      time: "8 min read"
    },
    {
      type: "Case Study",
      title: "How Sarah Saved $27,000 Over 10 Years",
      time: "12 min read"
    },
    {
      type: "Video",
      title: "Seasonal Diagnostic Walkthrough",
      time: "23 min"
    },
    {
      type: "Guide",
      title: "Complete HVAC Maintenance Guide",
      time: "30 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#3B82F6' }}>
            KNOWLEDGE HUB
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Resource Hub
          </h1>
          <p className="text-gray-700 text-lg mb-2">
            Your Complete Guide to Proactive Home Maintenance
          </p>
          <p className="text-gray-600">
            Whether you're just getting started or managing a portfolio of properties, find everything you need here.
          </p>
        </div>

        {/* Popular Resources - FIXED: Proper clickable cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {popularResources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <Link key={idx} to={resource.url} className="block">
                <Card
                  className="border-2 hover:shadow-lg transition-all cursor-pointer h-full"
                  style={{ borderColor: resource.color }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: resource.color + '20' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: resource.color }} />
                      </div>
                      {resource.badge && (
                        <Badge style={{ backgroundColor: resource.color, color: 'white' }}>
                          {resource.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {resource.description}
                    </p>
                    <div className="flex items-center text-sm font-semibold" style={{ color: resource.color }}>
                      Explore →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Browse by Topic - 360° Method Framework */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>
              📚 Browse by Topic: The 360° Method Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {topics.map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5" style={{ color: topic.color }} />
                      <h3 className="font-bold" style={{ color: topic.color }}>
                        {topic.phase}
                      </h3>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {topic.guides.map((guide, gIdx) => (
                        <li key={gIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: topic.color }} />
                          <span className="text-sm text-gray-700">{guide}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                      style={{ borderColor: topic.color, color: topic.color, minHeight: '40px' }}
                    >
                      <Link to={createPageUrl("ResourceGuides") + `?category=${encodeURIComponent(topic.phase)}`}>
                        View {topic.phase} Guides
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* By Property Type */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>
              🏠 By Property Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {propertyTypes.map((type, idx) => {
                const Icon = type.icon;
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-gray-700" />
                      <h3 className="font-bold" style={{ color: '#1B365D' }}>
                        {type.title}
                      </h3>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {type.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="text-sm text-gray-700">
                          • {topic}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                      style={{ minHeight: '40px' }}
                    >
                      <Link to={createPageUrl("ResourceGuides") + `?category=${encodeURIComponent(type.title)}`}>
                        View Guides
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* By System */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>
              🔧 By System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {systems.map((system, idx) => (
                <Button
                  key={idx}
                  asChild
                  variant="outline"
                  className="h-auto py-3"
                  style={{ minHeight: '44px' }}
                >
                  <Link to={createPageUrl("ResourceGuides") + `?system=${encodeURIComponent(system)}`}>
                    {system}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Downloads & Tools */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
              <Download className="w-5 h-5" />
              Downloads & Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Printable Seasonal Checklists</p>
                  <p className="text-xs text-gray-600">Spring, Summer, Fall, Winter</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Budget Planning Worksheets</p>
                  <p className="text-xs text-gray-600">Annual maintenance budgeting</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Contractor Evaluation Forms</p>
                  <p className="text-xs text-gray-600">Vet and hire with confidence</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Maintenance Log Templates</p>
                  <p className="text-xs text-gray-600">Track all property work</p>
                </div>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full mt-4"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("Downloads")}>
                View All Downloads
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Featured Content */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Featured Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featuredContent.map((content, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  style={{ minHeight: '80px' }}
                >
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {content.type}
                    </Badge>
                    <p className="font-semibold" style={{ color: '#1B365D' }}>
                      {content.title}
                    </p>
                    <p className="text-sm text-gray-600">{content.time}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full mt-4"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("ResourceGuides")}>
                View All Articles
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  Need Help?
                </h3>
                <p className="text-gray-700 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    asChild
                    style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("HelpCenter")}>
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Visit Help Center
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("Community")}>
                      <Users className="w-5 h-5 mr-2" />
                      Join Community Forum
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}