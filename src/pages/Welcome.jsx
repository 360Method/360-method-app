import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Check, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('main'); // 'main', 'homeowner', 'investor'

  if (activeView === 'homeowner') {
    return <HomeownerPath onBack={() => setActiveView('main')} />;
  }
  
  if (activeView === 'investor') {
    return <InvestorPath onBack={() => setActiveView('main')} />;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-3 flex justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Here's The Perfect Solution If You Want To<br />
            <span className="text-blue-600">Grow Wealth With A Proven Strategy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            (even if you believe maintenance is just something you deal with when things break,<br className="hidden md:block" /> or that you don't have time to stay on top of everything)
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Home Maintenance is<br />3 Simple Phases:
            </h2>
            <div className="space-y-3 text-left text-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-blue-600">1.</span>
                <span><strong>KNOW</strong> what you have</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-orange-600">2.</span>
                <span><strong>KEEP</strong> it working</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-green-600">3.</span>
                <span><strong>MAKE</strong> it better</span>
              </div>
            </div>
            <p className="text-xl text-gray-700 mt-6 font-semibold">
              That's it. We built an app for that.
            </p>
          </div>
        </div>

        {/* The 3 Phases Explained */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            The 3 Phases
          </h2>
          
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Phase 1: KNOW */}
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
                <h3 className="text-2xl font-bold text-gray-900">PHASE 1: KNOW<span className="text-lg font-normal text-gray-600 ml-2">(What You Have)</span></h3>
              </div>
              
              <p className="text-lg text-gray-700 mb-4">
                🏠 The 6 things in your home:<br />
                HVAC • Roof • Plumbing • Electrical • Foundation • Exterior
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 mb-2">📋 3 simple steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Document what you have</li>
                  <li>Take photos</li>
                  <li>See your starting score</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600"><strong>Time:</strong> 1 hour, one time</p>
              <p className="text-sm text-gray-900 font-semibold"><strong>Result:</strong> You know exactly what you're working with</p>
            </div>
            
            {/* Phase 2: KEEP */}
            <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
                <h3 className="text-2xl font-bold text-gray-900">PHASE 2: KEEP<span className="text-lg font-normal text-gray-600 ml-2">(It Working)</span></h3>
              </div>
              
              <p className="text-lg text-gray-700 mb-4">
                🔄 Check those 6 things every season:<br />
                Spring • Summer • Fall • Winter
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 mb-2">📋 3 simple steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Walk through (app guides you)</li>
                  <li>Catch small problems</li>
                  <li>Fix them before they're expensive</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600"><strong>Time:</strong> 15 minutes, every 3 months</p>
              <p className="text-sm text-gray-900 font-semibold"><strong>Result:</strong> Nothing surprises you</p>
            </div>
            
            {/* Phase 3: MAKE */}
            <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
                <h3 className="text-2xl font-bold text-gray-900">PHASE 3: MAKE<span className="text-lg font-normal text-gray-600 ml-2">(It Better)</span></h3>
              </div>
              
              <p className="text-lg text-gray-700 mb-4">
                📈 Improve over time:<br />
                Extend lifespans • Upgrade smart • Increase value
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 mb-2">📋 3 simple steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>See what's aging</li>
                  <li>Replace before it fails</li>
                  <li>Add upgrades that pay back</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600"><strong>Time:</strong> Ongoing</p>
              <p className="text-sm text-gray-900 font-semibold"><strong>Result:</strong> Your home gets better every year</p>
            </div>
          </div>
        </div>

        {/* Choose Your Path */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            How Do You Want To Use This?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveView('homeowner')}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-2xl p-8 text-left transition-all group"
            >
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">I Own My Home</h3>
              <p className="text-gray-700 mb-4">
                Use the 3 phases to maintain my property
              </p>
              <div className="text-blue-600 font-semibold group-hover:underline">Show Me How →</div>
            </button>
            
            <button
              onClick={() => setActiveView('investor')}
              className="bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-2xl p-8 text-left transition-all group"
            >
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600">I Own Rentals</h3>
              <p className="text-gray-700 mb-4">
                Use the 3 phases across my portfolio
              </p>
              <div className="text-green-600 font-semibold group-hover:underline">Show Me How →</div>
            </button>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            What The 3 Phases Do For People
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <p className="text-gray-700 mb-3">
                <strong className="text-gray-900">Sarah M., Lake Oswego:</strong><br />
                "Phase 1 showed me my roof was 24 years old. Phase 2 caught a small leak in month 3. 
                Fixed it for $200. Roofer said 'Another 6 months and this would've been $8,000 of damage.'"
              </p>
              <p className="text-blue-600 font-semibold">The 3 phases saved her $7,800.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <p className="text-gray-700 mb-3">
                <strong className="text-gray-900">Marcus T., 18-property portfolio:</strong><br />
                "I was spending $22K/year on emergency repairs. First year with the 3 phases? $9K total. 
                My tenants don't call me anymore because nothing breaks. Retention went from 60% to 87%."
              </p>
              <p className="text-green-600 font-semibold">The 3 phases saved him $13K in year one. Plus another $15K from reduced vacancy.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <p className="text-gray-700 mb-3">
                <strong className="text-gray-900">Jennifer K., Property Manager, 42 doors:</strong><br />
                "Owners used to micromanage me constantly. Now I show them a dashboard: 'Your portfolio 
                score is 84. Here's what we're working on.' They trust me. I look like a pro. I doubled my 
                portfolio in 18 months."
              </p>
              <p className="text-purple-600 font-semibold">The 3 phases helped her scale her business 2x.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Homeowner Path Component
function HomeownerPath({ onBack }) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-8 font-semibold"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Homeowner: Own With Confidence
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          The same 3 phases. Two ways to use them.
        </p>
        
        <div className="space-y-8 max-w-5xl mx-auto mb-16">
          {/* DIY Option */}
          <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📱</span>
              WITH THE APP (DIY)
            </h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 1: KNOW</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Answer 8 questions about your home</li>
                  <li>Upload photos of your 6 systems</li>
                  <li>Get your score instantly</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 2: KEEP</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>App reminds you every 3 months</li>
                  <li>15-minute guided walkthrough</li>
                  <li>App tells you: "Fix this now" or "Watch this"</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 3: MAKE</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>See what's aging before it fails</li>
                  <li>Get upgrade recommendations that pay back</li>
                  <li>Track every improvement</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">Result:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                <li>You avoid $5K-15K emergency repairs</li>
                <li>You know exactly what's happening</li>
                <li>Your home gets better every year</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              Join Waitlist for App
            </button>
          </div>
          
          {/* Done-For-You Option */}
          <div className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              WITH OUR TEAM (DONE-FOR-YOU)
            </h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 1: KNOW</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We inspect your entire property (2 hours)</li>
                  <li>We document every system</li>
                  <li>You see your score + full report</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 2: KEEP</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We come every 3 months</li>
                  <li>We check all 6 systems</li>
                  <li>We text you: "All good" or "Small issue - fixing Thursday"</li>
                  <li>You approve. We handle it.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 3: MAKE</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We tell you 6-12 months before things fail</li>
                  <li>We recommend smart upgrades</li>
                  <li>We coordinate everything</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">Result:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                <li>You never think about maintenance again</li>
                <li>Nothing surprises you</li>
                <li>Your weekends stay yours</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-lg transition-colors"
            >
              Join Waitlist for Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Investor Path Component
function InvestorPath({ onBack }) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="text-green-600 hover:text-green-800 mb-8 font-semibold"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Investor: Build With Purpose
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          The same 3 phases. Applied to your entire portfolio.
        </p>
        
        <div className="space-y-8 max-w-5xl mx-auto mb-16">
          {/* Portfolio App Option */}
          <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📱</span>
              PORTFOLIO APP
            </h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 1: KNOW (every property)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Document all 6 systems × all properties</li>
                  <li>One dashboard shows everything</li>
                  <li>See: 🟢 9 good • 🟡 2 watch • 🔴 1 urgent</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 2: KEEP (every property)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Tenants check quarterly via app</li>
                  <li>They earn $25/month rent credit</li>
                  <li>You see which properties need attention</li>
                  <li>Focus only where it matters</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 3: MAKE (portfolio-wide)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Forecast expenses across all properties</li>
                  <li>Plan replacements strategically</li>
                  <li>Track ROI on every dollar</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">Result:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                <li>Stop firefighting</li>
                <li>Cut reactive repairs 50-70%</li>
                <li>Scale confidently</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg transition-colors"
            >
              Join Waitlist for Portfolio App
            </button>
          </div>
          
          {/* Managed Service Option */}
          <div className="bg-indigo-50 rounded-2xl p-8 border-2 border-indigo-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              MANAGED PORTFOLIO SERVICE
            </h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 1: KNOW (every property)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We inspect every property annually</li>
                  <li>Complete documentation, all 6 systems</li>
                  <li>Portfolio score + individual scores</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 2: KEEP (every property)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We run tenant inspection program</li>
                  <li>We review all submissions</li>
                  <li>We tell you what needs fixing where</li>
                  <li>One monthly email: "All 12 inspected. Property #7 needs water heater next month."</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Phase 3: MAKE (portfolio-wide)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We forecast all upcoming capital expenses</li>
                  <li>We recommend strategic improvements</li>
                  <li>We coordinate everything</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">Result:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                <li>Your phone stops buzzing</li>
                <li>Tenants stay longer (no breakdowns)</li>
                <li>Banks love your portfolio documentation</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-lg transition-colors"
            >
              Join Waitlist for Managed Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}