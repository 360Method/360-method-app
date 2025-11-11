
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, AlertTriangle } from "lucide-react";
import IssueDocumentation from "./IssueDocumentation";

export default function AreaInspection({ area, inspection, property, baselineSystems, existingIssues, onComplete, onBack }) {
  const [documentingIssue, setDocumentingIssue] = React.useState(false);
  const [issues, setIssues] = React.useState(existingIssues || []);
  const [aiSuggestions, setAiSuggestions] = React.useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  // Handle null property early
  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-none shadow-lg max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Property Data</h1>
            <p className="text-gray-600 mb-6">Unable to perform inspection without property information.</p>
            <Button onClick={onBack} style={{ backgroundColor: '#1B365D' }}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Generate AI suggestions based on baseline data
  React.useEffect(() => {
    const generateSuggestions = async () => {
      // Only generate if there are relevant systems and suggestions haven't been fetched yet for this area/context
      if (relevantSystems.length === 0 || aiSuggestions !== null) {
        return;
      }
      
      setLoadingSuggestions(true);
      try {
        const systemsInfo = relevantSystems.map(sys => {
          const age = sys.installation_year ? new Date().getFullYear() - sys.installation_year : 'unknown';
          return `${sys.system_type} (nickname: ${sys.nickname || 'none'}, brand/model: ${sys.brand_model || 'unknown'}, age: ${age} years, condition: ${sys.condition || 'unknown'})`;
        }).join('\n');

        const prompt = `You are inspecting the "${area.name}" area during a ${inspection.season} seasonal inspection. Your goal is to help a homeowner identify potential issues and maintenance needs.

Systems documented in baseline for this area:
${systemsInfo}

Based on the documented systems (age, condition, type) and the current season (${inspection.season}), provide:
1. Priority inspection checks (3-5 specific, actionable things for the homeowner to look for right now)
2. Common issues or concerns found for these types of systems specifically during the ${inspection.season} season
3. Red flags that, if observed, indicate urgent attention or professional help is needed

Be concise, specific, and practical. Focus on preventing expensive failures and ensuring home safety. Do not invent systems or conditions not mentioned in the baseline. If no systems are documented, provide general advice for the area.`;

        const suggestions = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              priority_checks: { type: "array", items: { type: "string" } },
              seasonal_concerns: { type: "array", items: { type: "string" } },
              red_flags: { type: "array", items: { type: "string" } }
            },
            required: ["priority_checks", "seasonal_concerns", "red_flags"]
          },
          force_json: true
        });

        if (suggestions && Array.isArray(suggestions.priority_checks) && Array.isArray(suggestions.seasonal_concerns) && Array.isArray(suggestions.red_flags)) {
            setAiSuggestions(suggestions);
        } else {
            console.warn('AI returned invalid suggestions structure:', suggestions);
            setAiSuggestions({
                priority_checks: ["Could not generate specific checks. Please refer to general inspection points."],
                seasonal_concerns: ["Could not generate specific concerns at this time."],
                red_flags: ["Could not generate specific red flags. Rely on your judgment for urgent issues."]
            });
        }

      } catch (error) {
        console.error('Failed to generate AI suggestions:', error);
        setAiSuggestions({
            priority_checks: ["Failed to load AI suggestions. Please check general inspection points."],
            seasonal_concerns: ["Failed to load AI suggestions."],
            red_flags: ["Failed to load AI suggestions."]
        });
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (relevantSystems.length > 0 && aiSuggestions === null) {
      generateSuggestions();
    }
  }, [relevantSystems, area.id, inspection.season, aiSuggestions]);

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

        {/* AI-Powered Inspection Suggestions */}
        {relevantSystems.length > 0 && (
          <>
            {loadingSuggestions ? (
              <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin text-2xl">⚙️</div>
                    <span className="font-medium text-purple-900">AI analyzing your systems...</span>
                  </div>
                </CardContent>
              </Card>
            ) : aiSuggestions && (
              <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
                <CardContent className="p-4">
                  <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    🤖 AI Inspection Assistant
                  </h2>

                  {/* Priority Checks */}
                  {aiSuggestions.priority_checks?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-purple-900">Priority Checks Based on Your Systems:</h3>
                      <ul className="space-y-2">
                        {aiSuggestions.priority_checks.map((check, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-1" style={{ minWidth: '18px', minHeight: '18px' }} />
                            <span className="text-gray-800">{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Seasonal Concerns */}
                  {aiSuggestions.seasonal_concerns?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-orange-900">⚠️ {inspection.season} Concerns:</h3>
                      <ul className="space-y-1">
                        {aiSuggestions.seasonal_concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                            <span className="text-orange-600 font-bold mt-0.5">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Flags */}
                  {aiSuggestions.red_flags?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-900">🚨 Red Flags (Report Immediately):</h3>
                      <ul className="space-y-1">
                        {aiSuggestions.red_flags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

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
