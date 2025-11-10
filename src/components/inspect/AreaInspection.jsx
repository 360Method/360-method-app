
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, AlertTriangle } from "lucide-react";
import IssueDocumentation from "./IssueDocumentation";

export default function AreaInspection({ area, inspection, property, baselineSystems, existingIssues, onComplete, onBack }) {
  const [documentingIssue, setDocumentingIssue] = React.useState(false);
  const [issues, setIssues] = React.useState(existingIssues || []);

  // Get systems relevant to this area
  const relevantSystems = baselineSystems.filter(system => {
    if (area.id === 'hvac') return system.system_type === 'HVAC System';
    if (area.id === 'plumbing') return system.system_type === 'Plumbing System';
    if (area.id === 'electrical') return system.system_type === 'Electrical System';
    if (area.id === 'gutters') return system.system_type === 'Gutters & Downspouts';
    if (area.id === 'roof') return system.system_type === 'Roof System';
    if (area.id === 'foundation') return system.system_type === 'Foundation & Structure';
    if (area.id === 'safety') return ['Smoke Detector', 'CO Detector', 'Fire Extinguisher', 'Security System'].includes(system.system_type);
    return false;
  });

  const handleSaveAndContinue = () => {
    onComplete(issues);
  };

  const handleIssueDocumented = (issueData) => {
    const newIssues = [...issues, issueData];
    setIssues(newIssues);
    setDocumentingIssue(false);
  };

  if (documentingIssue) {
    return (
      <IssueDocumentation
        area={area}
        inspection={inspection}
        property={property}
        relevantSystems={relevantSystems}
        onSave={handleIssueDocumented}
        onCancel={() => setDocumentingIssue(false)}
      />
    );
  }

  // Generate "why it matters" content based on area
  const getWhyItMatters = () => {
    const whyMatters = {
      'exterior': 'Your home\'s exterior is the first line of defense against weather. Failed siding or foundation issues cause water intrusion leading to $20,000+ in structural damage and mold remediation.',
      'gutters': 'Clogged gutters cause water overflow leading to foundation damage, basement flooding, and landscaping erosion. Small task now prevents $10,000-30,000 in damage. In Pacific Northwest, this is CRITICAL before fall rain season.',
      'foundation': 'Foundation problems make homes unsellable and cost $20,000-100,000+ to repair. Small cracks grow over time. Water intrusion causes structural failure. Early detection lets you track changes while they\'re still manageable.',
      'hvac': 'Spring is when you test AC before summer heat. Catching problems now prevents emergency breakdowns when HVAC companies are booked weeks out at premium prices. Dirty filters reduce efficiency 15% and strain your system.',
      'plumbing': 'Water damage is the #1 homeowner insurance claim, averaging $10,000+ per incident. A burst pipe or failed water heater floods your home causing structural damage and mold. Small leaks escalate into major problems.',
      'bathrooms': 'Failed caulking and fixtures cause water damage behind walls leading to mold growth and structural rot. What starts as a $50 caulk job becomes $15,000+ in wall rebuilds.',
      'kitchen': 'Plumbing leaks and faulty appliances cause major water and fire damage. Kitchen fires and floods are among the most expensive home insurance claims at $15,000+ average.',
      'roof': 'Your roof is your home\'s primary defense. Small leaks rot the deck, damage insulation, and create interior water damage and mold - turning a $500 repair into a $20,000-40,000 disaster.',
      'attic': 'Poor attic ventilation causes moisture buildup, mold growth, and premature roof failure. Ice dams damage roofs and gutters. Inadequate insulation wastes $500-2,000/year in energy costs.',
      'windows': 'Failed seals cause water damage and account for 30% of heating/cooling loss. Rotted frames require complete replacement at 10X the cost of maintenance. Energy waste costs $300-800/year.',
      'electrical': 'Electrical problems cause 13% of home fires. Outdated wiring, overloaded panels, and old components create fire hazards. Insurance companies may deny claims if you knew about hazards.',
      'safety': '60% of fire deaths occur in homes with non-functional detectors. Carbon monoxide is an invisible, odorless killer. Non-functional safety systems provide no warning when you need it most.'
    };
    return whyMatters[area.id] || 'Regular inspection catches problems early when they\'re small, cheap, and easy to fix.';
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Areas
        </Button>

        {/* Area Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{area.icon}</span>
            <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '24px', lineHeight: '1.2' }}>
              INSPECTING: {area.name}
            </h1>
          </div>
        </div>

        {/* Documented Systems */}
        {relevantSystems.length > 0 && (
          <Card className="border-2 mobile-card" style={{ borderColor: '#1B365D', backgroundColor: '#F0F4F8' }}>
            <CardContent className="p-4">
              <h2 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '18px' }}>
                Your documented systems:
              </h2>
              <ul className="space-y-2">
                {relevantSystems.map((system) => (
                  <li key={system.id} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <span className="font-medium">{system.nickname || system.system_type}</span>
                      {system.brand_model && <span className="text-gray-600"> - {system.brand_model}</span>}
                      {system.installation_year && (
                        <span className="text-gray-600"> ({new Date().getFullYear() - system.installation_year} years old)</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200 my-6" />

        {/* What To Look For */}
        <Card className="border-2 mobile-card" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
          <CardContent className="p-4">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
              🔍 WHAT TO LOOK FOR:
            </h2>
            
            {relevantSystems.length > 0 ? (
              <div className="space-y-6">
                {relevantSystems.map((system) => (
                  <div key={system.id}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1B365D', fontSize: '16px' }}>
                      {system.nickname || system.system_type}
                      {system.brand_model && <span className="text-gray-600 font-normal"> ({system.brand_model})</span>}
                    </h3>
                    <ul className="space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {area.id === 'hvac' && (
                        <>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Filter condition - Dirty/clogged/clean?
                              {system.key_components?.filter_size && (
                                <span className="text-sm text-gray-600"> (Size: {system.key_components.filter_size})</span>
                              )}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Airflow from vents - Strong/weak?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Unusual sounds - Grinding/squealing/rattling?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Turn on AC - Does it cool properly?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Outdoor unit - Debris around it?</span>
                          </li>
                        </>
                      )}
                      {area.id === 'plumbing' && (
                        <>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Water heater - Any leaks at base?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Under sinks - Any moisture or water stains?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Washing machine hoses - Rubber or braided stainless?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Supply line shut-off valves - Do they turn smoothly?</span>
                          </li>
                        </>
                      )}
                      {area.id === 'safety' && (
                        <>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Test smoke detector - Does it alarm?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Check battery installation date</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span>Check detector age (Replace after 10 years)</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p><strong>General inspection points for {area.name}:</strong></p>
                <ul className="space-y-2 ml-4">
                  {area.whatToCheck.split(',').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                      <span>{item.trim().charAt(0).toUpperCase() + item.trim().slice(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <hr className="border-gray-200 my-6" />

        {/* Why It Matters */}
        <Card className="border-2 mobile-card" style={{ borderColor: '#FFC107', backgroundColor: '#FFFBF0' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#FFC107' }} />
              <div>
                <h2 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '18px' }}>
                  💡 WHY THIS MATTERS:
                </h2>
                <p className="text-gray-800" style={{ fontSize: '16px', lineHeight: '1.5' }}>
                  {getWhyItMatters()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <hr className="border-gray-200 my-6" />

        {/* Issues Found So Far */}
        {issues.length > 0 && (
          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-4">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                Issues Found in This Area: {issues.length}
              </h2>
              <div className="space-y-2">
                {issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF6B35' }} />
                    <div>
                      <span className="font-medium">{issue.severity}</span>: {issue.description.substring(0, 60)}...
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mb-4">
          <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
            Did you find any issues?
          </h2>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setDocumentingIssue(true)}
              className="w-full font-bold"
              style={{ backgroundColor: '#FF6B35', minHeight: '56px', fontSize: '16px' }}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              ⚠️ Found an Issue
            </Button>
            
            <Button
              onClick={handleSaveAndContinue}
              className="w-full font-bold"
              style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
            >
              ✓ Save & Continue to Next Area
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
