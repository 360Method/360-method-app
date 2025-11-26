import React, { useState } from 'react';
import { 
  Book, Video, FileText, Download, Lock, Lightbulb, 
  MapPin, CheckCircle, Calendar, Users, BookOpen,
  ExternalLink, Star, Calculator
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../components/shared/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DemoCTA from '../components/demo/DemoCTA';

export default function Resources() {
  const navigate = useNavigate();
  const { demoMode } = useDemo();
  const [selectedGuide, setSelectedGuide] = useState(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Resource Center 📚
          </h1>
          <p className="text-gray-600 text-lg">
            Educational content, guides, and tools to master the 360° Method
          </p>
        </div>

        {/* Demo Banner */}
        {demoMode && (
          <Card className="border-2 border-blue-300 bg-blue-50 shadow-lg mb-6 md:mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    Preview Mode: Limited Access
                  </h3>
                  <p className="text-blue-800 mb-4 text-sm md:text-base">
                    You're viewing a preview of the Resource Center. Full members get access to:
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>100+ how-to guides with photos & videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Seasonal maintenance checklists (climate-specific)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Cost estimator tools & contractor interview guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Video library of common repairs & diagnostics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Downloadable templates (maintenance logs, inspection forms)</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
                    style={{ minHeight: '48px' }}
                  >
                    Start Free to Unlock All Resources
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SECTION 1: AVAILABLE - Core Education (CLICKABLE) */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3" style={{ color: '#1B365D' }}>
            <BookOpen className="w-7 h-7 text-green-600" />
            Available Now
          </h2>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* 360° Method Guide - CLICKABLE */}
            <ClickableResourceCard
              title="The 360° Method: Origins & Philosophy"
              description="Learn why traditional property maintenance fails and how the 360° Method prevents cascade failures"
              icon={<Book className="w-6 h-6 text-green-600" />}
              color="green"
              readTime="8 min read"
              onClick={() => setSelectedGuide('methodology')}
            />

            {/* Demo Navigation Guide - CLICKABLE */}
            <ClickableResourceCard
              title="Demo Navigation Guide"
              description="Step-by-step walkthrough of exploring this demo effectively"
              icon={<MapPin className="w-6 h-6 text-blue-600" />}
              color="blue"
              readTime="5 min read"
              onClick={() => setSelectedGuide('demo-nav')}
            />
          </div>
        </div>

        {/* SECTION 2: COMING SOON - Preview Resources (LOCKED) */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3" style={{ color: '#1B365D' }}>
            <Lock className="w-7 h-7 text-gray-400" />
            Available to Members
            <span className="text-sm font-normal text-gray-500">(Preview)</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* How-To Guides Preview */}
            <LockedResourceCard
              title="How-To Guides Library"
              count="124 guides"
              icon={<FileText className="w-6 h-6" />}
              color="purple"
              examples={[
                "HVAC Filter Replacement (Photos)",
                "Detecting Water Leaks Early",
                "Winterizing Your Property",
                "Deck Staining & Sealing",
                "Gutter Cleaning Best Practices"
              ]}
            />

            {/* Video Library Preview */}
            <LockedResourceCard
              title="Video Tutorial Library"
              count="87 videos"
              icon={<Video className="w-6 h-6" />}
              color="red"
              examples={[
                "Diagnosing HVAC Problems",
                "Emergency Shut-Offs Tour",
                "Foundation Crack Assessment",
                "Roof Inspection Walkthrough",
                "Plumbing Leak Detection"
              ]}
            />

            {/* Checklists Preview */}
            <LockedResourceCard
              title="Seasonal Checklists"
              count="16 checklists"
              icon={<Calendar className="w-6 h-6" />}
              color="orange"
              examples={[
                "Spring Inspection (Pacific NW)",
                "Summer Inspection (Pacific NW)",
                "Fall Inspection (Pacific NW)",
                "Winter Inspection (Pacific NW)",
                "Move-In/Move-Out Checklist"
              ]}
            />

            {/* Cost Estimator Preview */}
            <LockedResourceCard
              title="Cost Estimator Tools"
              count="42 calculators"
              icon={<Calculator className="w-6 h-6" />}
              color="green"
              examples={[
                "Roof Replacement Cost",
                "HVAC Replacement Cost",
                "Kitchen Remodel Estimator",
                "Landscaping Budget Planner",
                "Energy Efficiency ROI"
              ]}
            />

            {/* Contractor Guides Preview */}
            <LockedResourceCard
              title="Contractor Interview Guides"
              count="18 guides"
              icon={<Users className="w-6 h-6" />}
              color="blue"
              examples={[
                "Hiring a General Contractor",
                "HVAC Contractor Questions",
                "Roofing Contractor Red Flags",
                "Plumber Selection Criteria",
                "Electrician Licensing Verification"
              ]}
            />

            {/* Templates Preview */}
            <LockedResourceCard
              title="Downloadable Templates"
              count="31 templates"
              icon={<Download className="w-6 h-6" />}
              color="purple"
              examples={[
                "Property Maintenance Log",
                "Inspection Report Template",
                "Contractor Quote Comparison",
                "Rental Property Inspection",
                "CapEx Planning Spreadsheet"
              ]}
            />
          </div>
        </div>

        <DemoCTA />
      </div>

      {/* Modals for Clickable Content */}
      {selectedGuide === 'methodology' && (
        <MethodologyGuideModal onClose={() => setSelectedGuide(null)} />
      )}

      {selectedGuide === 'demo-nav' && (
        <DemoNavGuideModal onClose={() => setSelectedGuide(null)} />
      )}
    </div>
  );
}

// CLICKABLE Resource Card
function ClickableResourceCard({ title, description, icon, color, readTime, onClick }) {
  const colorClasses = {
    green: 'from-green-50 to-emerald-100 border-green-300 hover:border-green-400',
    blue: 'from-blue-50 to-sky-100 border-blue-300 hover:border-blue-400',
    purple: 'from-purple-50 to-violet-100 border-purple-300 hover:border-purple-400'
  };

  const textColorClasses = {
    green: 'text-green-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700'
  };

  return (
    <Card
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} border-2 cursor-pointer hover:shadow-lg transition-all`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-${color}-200 rounded-full flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${textColorClasses[color]}`}>
            {readTime}
          </span>
          <span className={`text-sm font-bold ${textColorClasses[color]} flex items-center gap-1`}>
            Read Now
            <ExternalLink className="w-4 h-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// LOCKED Resource Card (Preview Only)
function LockedResourceCard({ title, count, icon, color, examples }) {
  const colorClasses = {
    purple: 'from-purple-50 to-violet-50 border-purple-200',
    red: 'from-red-50 to-rose-50 border-red-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    blue: 'from-blue-50 to-sky-50 border-blue-200'
  };

  const iconColorClasses = {
    purple: 'bg-purple-200 text-purple-700',
    red: 'bg-red-200 text-red-700',
    orange: 'bg-orange-200 text-orange-700',
    green: 'bg-green-200 text-green-700',
    blue: 'bg-blue-200 text-blue-700'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-2 relative overflow-hidden`}>
      <CardContent className="p-4 md:p-6">
        {/* Lock overlay */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <div className={`w-10 h-10 ${iconColorClasses[color]} rounded-full flex items-center justify-center mb-3`}>
            {React.cloneElement(icon, { className: `w-5 h-5` })}
          </div>
          <h3 className="font-bold text-gray-900 mb-1 text-base md:text-lg pr-8">{title}</h3>
          <p className="text-sm text-gray-600">{count}</p>
        </div>

        {/* Preview list */}
        <div className="space-y-2 mb-4 opacity-75">
          {examples.slice(0, 3).map((example, idx) => (
            <div key={idx} className="text-xs text-gray-700 flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span className="flex-1">{example}</span>
            </div>
          ))}
          <div className="text-xs text-gray-500 italic">
            + {examples.length - 3} more...
          </div>
        </div>

        {/* Locked badge */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-center">
          <span className="text-xs font-semibold text-gray-600">
            🔒 Members Only
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// MODAL 1: 360° Method Guide
function MethodologyGuideModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-8 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Book className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">The 360° Method</h2>
                <p className="text-sm md:text-base text-gray-600">Origins, Philosophy & Why It Works</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl ml-2 flex-shrink-0 leading-none"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-sm md:prose max-w-none">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">The Problem: Cascade Failures</h3>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              Most homeowners and landlords operate <strong>reactively</strong> - waiting for things 
              to break before taking action. This leads to what we call <strong>"cascade failures"</strong> 
              - where a small, ignored problem creates a chain reaction of expensive disasters.
            </p>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
              <h4 className="font-bold text-red-900 mb-3 text-base md:text-lg">Real Example: The $10,000 Bathroom Leak</h4>
              <div className="space-y-2 text-xs md:text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">Week 1:</span>
                  <span>Toilet seal cracks (invisible, under toilet) - $5 repair if caught</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">Week 4:</span>
                  <span>Water seeps into subfloor unnoticed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">Week 8:</span>
                  <span>Subfloor begins to rot, mold starts growing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">Week 16:</span>
                  <span>Ceiling below bathroom shows water stain - problem discovered</span>
                </div>
                <div className="flex items-start gap-2 pt-3 border-t border-red-300">
                  <span className="font-bold flex-shrink-0">Final Cost:</span>
                  <span className="font-bold">$10,400 (subfloor replacement, mold remediation, drywall, repainting, tile work)</span>
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base text-gray-700 mb-6">
              <strong>A $5 seal replacement becomes $10,400</strong> because the problem wasn't 
              caught early. This happens thousands of times per year across millions of properties.
            </p>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">The Solution: Systematic Prevention</h3>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              The 360° Method is built on a simple premise: <strong>prevent cascade failures through 
              systematic early detection</strong>. We don't wait for problems - we hunt for them when 
              they're still cheap to fix.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-6">
              <h4 className="font-bold text-blue-900 mb-4 text-base md:text-lg">The 3×3 Framework</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-blue-800 mb-2">Phase I: AWARE</h5>
                  <div className="space-y-1 text-xs md:text-sm text-blue-800 ml-4">
                    <div><strong>Step 1 - BASELINE:</strong> Document all major systems</div>
                    <div><strong>Step 2 - INSPECT:</strong> Conduct seasonal diagnostic visits</div>
                    <div><strong>Step 3 - TRACK:</strong> Log all maintenance & costs</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-blue-800 mb-2">Phase II: ACT</h5>
                  <div className="space-y-1 text-xs md:text-sm text-blue-800 ml-4">
                    <div><strong>Step 4 - PRIORITIZE:</strong> Rank tasks by cascade risk</div>
                    <div><strong>Step 5 - SCHEDULE:</strong> Plan work strategically</div>
                    <div><strong>Step 6 - EXECUTE:</strong> Complete tasks proactively</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-blue-800 mb-2">Phase III: ADVANCE</h5>
                  <div className="space-y-1 text-xs md:text-sm text-blue-800 ml-4">
                    <div><strong>Step 7 - PRESERVE:</strong> Extend system lifespans</div>
                    <div><strong>Step 8 - UPGRADE:</strong> Add value & reduce costs</div>
                    <div><strong>Step 9 - SCALE:</strong> Build wealth systematically</div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Why It Works: The Science</h3>
            
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <h5 className="font-bold text-green-900 mb-2 text-sm md:text-base">Early Detection Multiplier</h5>
                <p className="text-xs md:text-sm text-green-800">
                  Problems caught in the first 25% of their lifespan cost <strong>5-20× less</strong> 
                  to fix than when caught at failure point.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
                <h5 className="font-bold text-purple-900 mb-2 text-sm md:text-base">Cascade Prevention</h5>
                <p className="text-xs md:text-sm text-purple-800">
                  One failing system often damages 2-3 adjacent systems. Stopping the source 
                  prevents the cascade entirely.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                <h5 className="font-bold text-orange-900 mb-2 text-sm md:text-base">Strategic Timing</h5>
                <p className="text-xs md:text-sm text-orange-800">
                  Planned maintenance costs 30-50% less than emergency repairs (no rush fees, 
                  better contractor negotiation).
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h5 className="font-bold text-blue-900 mb-2 text-sm md:text-base">Compound Benefits</h5>
                <p className="text-xs md:text-sm text-blue-800">
                  Well-maintained properties command 5-8% sale premiums and rent 2-3 weeks faster 
                  with better tenants.
                </p>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Real-World Results</h3>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-4 md:p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-Year Case Study: Single-Family Home</h4>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h5 className="font-semibold text-red-800 mb-3 text-sm md:text-base">Without 360° Method (Reactive)</h5>
                  <div className="space-y-2 text-xs md:text-sm text-gray-700">
                    <div>Year 1: $800 routine + $0 emergencies</div>
                    <div>Year 2: $900 routine + $2,400 water heater failure</div>
                    <div>Year 3: $1,100 routine + $8,200 roof leak cascade</div>
                    <div>Year 4: $1,200 routine + $3,800 HVAC emergency</div>
                    <div>Year 5: $950 routine + $0 emergencies</div>
                    <div className="pt-2 border-t border-gray-300 font-bold">
                      Total 5 Years: $19,350
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-green-800 mb-3 text-sm md:text-base">With 360° Method (Proactive)</h5>
                  <div className="space-y-2 text-xs md:text-sm text-gray-700">
                    <div>Year 1: $1,800 planned maintenance</div>
                    <div>Year 2: $2,100 planned + proactive water heater</div>
                    <div>Year 3: $1,900 planned (roof issue caught early: $400)</div>
                    <div>Year 4: $2,200 planned + HVAC repair ($600)</div>
                    <div>Year 5: $1,850 planned maintenance</div>
                    <div className="pt-2 border-t border-gray-300 font-bold text-green-700">
                      Total 5 Years: $9,850
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-green-400 text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">$9,500 Saved</div>
                <div className="text-xs md:text-sm text-gray-600">49% lower total cost over 5 years</div>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">The Origin Story</h3>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              The 360° Method was developed by Marcin Micek after managing a 12-door rental portfolio 
              and experiencing firsthand how <strong>small ignored problems become financial disasters</strong>. 
              His background spans:
            </p>
            <ul className="list-disc ml-6 text-xs md:text-sm text-gray-700 space-y-2 mb-4">
              <li>Construction work (uncle's contracting company, age 12-18)</li>
              <li>College painting business ($500K+ revenue across Illinois)</li>
              <li>State Farm insurance representative (understanding risk & loss prevention)</li>
              <li>6 years in industrial B2B sales at Norton Abrasives (systematic sales processes)</li>
              <li>Active rental property investor (12 doors + storage units)</li>
            </ul>

            <p className="text-sm md:text-base text-gray-700 mb-4">
              The methodology combines <strong>construction knowledge, insurance risk assessment, 
              industrial sales systems thinking, and real-world property management experience</strong> 
              into a comprehensive framework that prevents problems rather than reacts to them.
            </p>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 md:p-6">
              <h4 className="font-bold text-purple-900 mb-3 text-base md:text-lg">Core Philosophy</h4>
              <p className="text-sm md:text-base text-purple-800 italic">
                "Property ownership should build wealth and peace of mind - not create anxiety and 
                drain bank accounts through preventable disasters. The 360° Method transforms 
                maintenance from a cost center into a <strong>wealth preservation engine</strong>."
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// MODAL 2: Demo Navigation Guide
function DemoNavGuideModal({ onClose }) {
  const { isInvestor } = useDemo();

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-8 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Demo Navigation Guide</h2>
                <p className="text-sm md:text-base text-gray-600">
                  {isInvestor ? 'Investor Demo Walkthrough' : 'Homeowner Demo Walkthrough'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl ml-2 flex-shrink-0 leading-none"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-blue-900 mb-3 text-base md:text-lg">What You're Exploring</h3>
              <p className="text-sm md:text-base text-blue-800">
                {isInvestor 
                  ? "This investor demo shows a 3-property portfolio (Duplex, Single-Family, 4-Plex) managed with the 360° Method. You'll see how systematic maintenance protects portfolio value and maximizes ROI."
                  : "This homeowner demo shows a fully documented single-family home managed with the 360° Method. You'll see how systematic maintenance prevents expensive disasters and builds equity."}
              </p>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Recommended Navigation Path</h3>
              
              <div className="space-y-3 md:space-y-4">
                {/* Steps 1-11 */}
                {[
                  { num: 1, title: 'Dashboard - Mission Control', desc: 'Start here to see the big picture: property health score, prevented costs, ' + (isInvestor ? 'portfolio metrics,' : 'wealth projection,') + ' and what needs attention now.', time: '2-3 minutes' },
                  { num: 2, title: 'Properties - ' + (isInvestor ? 'Portfolio Overview' : 'Your Home Details'), desc: isInvestor ? 'See all 3 properties, their financials, health scores, and active tasks. Click into individual properties for detailed views.' : 'View your property\'s profile - purchase details, current value, equity, and financial metrics.', time: '2-3 minutes' },
                  { num: 3, title: 'Baseline - System Documentation', desc: 'This is your property\'s permanent record. ' + (isInvestor ? 'View systems across all properties or filter by property.' : 'See all 16 major systems documented - age, condition, replacement cost, last service.'), time: '3-4 minutes • Click into systems to see details' },
                  { num: 4, title: 'Inspect - Seasonal Diagnostics', desc: 'See completed inspection history. Click "View" on any inspection to see findings and the action items generated from each visit.', time: '2-3 minutes' },
                  { num: 5, title: 'Track - Maintenance History', desc: 'Your complete maintenance log - every task, every dollar, every disaster prevented. Great for insurance, warranties, and resale documentation.', time: '2 minutes' },
                  { num: 6, title: 'Prioritize - AI-Powered Ranking', desc: 'See how AI analyzes cascade risk. URGENT/HIGH items are the ones that prevent $5K+ disasters if delayed.', time: '2 minutes' },
                  { num: 7, title: 'Schedule - Strategic Planning', desc: 'See tasks grouped by season and contractor type to minimize costs and avoid emergency pricing.', time: '1-2 minutes' },
                  { num: 8, title: 'Execute - Task Completion', desc: 'Click into tasks to see detailed how-to guides, cost estimates, difficulty ratings, and safety warnings.', time: '2-3 minutes' },
                  { num: 9, title: 'Preserve - Strategic Interventions', desc: 'High-ROI interventions that extend system life 3-15 years. These aren\'t routine maintenance - they\'re strategic investments.', time: '2-3 minutes' },
                  { num: 10, title: 'Upgrade - Value Builder', desc: 'Browse upgrade ideas (energy efficiency, value-add projects) and track active projects with milestones and ROI calculations.', time: '3-4 minutes • Explore "Browse Ideas" tab' },
                  { num: 11, title: 'Scale - ' + (isInvestor ? 'Portfolio CFO' : 'Wealth Builder'), desc: isInvestor ? 'The crown jewel - 10-year wealth projections, property comparison analysis, hold/sell recommendations, and acquisition opportunities.' : 'See your 10-year wealth projection. This is THE reason people buy homes - to build equity and financial security.', time: '4-5 minutes • This is the emotional payoff' }
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className={`w-7 h-7 md:w-8 md:h-8 ${step.num <= 2 ? 'bg-blue-600' : step.num <= 5 ? 'bg-green-600' : step.num <= 8 ? 'bg-orange-600' : 'bg-purple-600'} text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm md:text-base`}>
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base leading-tight">{step.title}</h4>
                      <p className="text-xs md:text-sm text-gray-700 mb-1 md:mb-2 leading-relaxed">
                        {step.desc}
                      </p>
                      <div className="text-xs text-gray-600">
                        ⏱️ Spend: {step.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-green-900 mb-3 text-base md:text-lg">💡 Pro Tips</h3>
              <ul className="space-y-2 text-xs md:text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Total time:</strong> 25-30 minutes to see everything
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Click into details:</strong> Don't just skim - open systems, tasks, 
                    and inspections to see the depth
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>End at Scale:</strong> This is where you see the wealth-building payoff
                  </span>
                </li>
                {!isInvestor && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Want to see investor features?</strong> Exit demo and choose "Explore 
                      Investor Demo" to see portfolio management (3 properties, Scale fully unlocked)
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-none">
              <CardContent className="p-4 md:p-6 text-center text-white">
                <h3 className="text-lg md:text-xl font-bold mb-2">Ready to Protect Your Own Property?</h3>
                <p className="text-sm md:text-base text-orange-100 mb-4">
                  Create your free account and start the 360° Method today
                </p>
                <Button
                  onClick={() => {
                    onClose();
                    base44.auth.redirectToLogin();
                  }}
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                  style={{ minHeight: '48px' }}
                >
                  Start Free Today
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}