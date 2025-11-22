import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Imagine Never Worrying About<br />
            Your Home Breaking Down Again.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            What would that peace of mind be worth to you?
          </p>
          
          <button
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-colors shadow-lg"
          >
            I Want That
          </button>
        </div>
          
        {/* Pain Point Selection */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Which nightmare sounds familiar?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Homeowner Pain */}
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-blue-500 transition-all cursor-pointer"
                 onClick={() => navigate(createPageUrl('DemoEntry') + '?type=homeowner')}>
              <div className="text-5xl mb-4">😰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">HOMEOWNER</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "It's Saturday morning. The AC just died. It's 95 degrees. You spend 4 hours calling contractors. None call back. Your weekend is ruined. <strong>Again.</strong>"
              </p>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors">
                I'm Tired of This
              </button>
            </div>
            
            {/* Investor Pain */}
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-green-500 transition-all cursor-pointer"
                 onClick={() => navigate(createPageUrl('DemoEntry') + '?type=investor')}>
              <div className="text-5xl mb-4">😤</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">INVESTOR/MANAGER</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "You own 12 rentals. Tenant texts: 'Water heater is leaking.' It's 9pm Sunday. You have no idea how old it is or if you've maintained it. Now it's an emergency. <strong>And expensive.</strong>"
              </p>
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors">
                I Need Control
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="text-gray-600 hover:text-gray-900 underline text-base"
            >
              Skip ahead, just join waitlist →
            </button>
          </div>
        </div>

        {/* Does This Sound Familiar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">😰</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Does This Sound Familiar?
            </h2>
          </div>
          
          <div className="space-y-4 text-lg text-gray-700 mb-8">
            <p className="italic">"When was the last time I changed my HVAC filter?"</p>
            <p className="italic">"Should I be worried about that ceiling stain?"</p>
            <p className="italic">"Is my water heater about to explode?"</p>
            <p className="italic">"Why does home maintenance feel so overwhelming?"</p>
          </div>
          
          <p className="text-center text-gray-600 text-lg">
            You're not alone. <strong className="text-gray-900">78% of homeowners</strong> feel the same way.
          </p>
        </div>
        
        {/* Before/After */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Before */}
            <div className="text-left">
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                😰 Your Life Now
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <span>Every problem is a surprise</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <span>Your weekends disappear into home emergencies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <span>You feel guilty for not "taking care of things"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <span>You have no idea what maintenance you've skipped</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="text-left">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                😊 Your Life After
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span>No surprises. Ever.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span>Your weekends are yours again</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span>You feel confident and in control</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span>You know exactly what's happening with your home</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real Customer Stories */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            What This Feels Like
          </h2>
          
          <div className="space-y-6">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                "I used to spend every Saturday dealing with contractor calls and home emergencies. 
                <strong className="text-gray-900"> Now I get a monthly text that everything's handled.</strong> 
                It feels like I got my life back."
              </p>
              <p className="text-sm text-gray-600">— Sarah M., Portland homeowner</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                "I used to get 2-3 emergency calls per month from tenants. 
                <strong className="text-gray-900"> Last year? Zero.</strong> 
                Because they catch everything before tenants even notice. My retention went from 60% to 85%. That alone pays for the service."
              </p>
              <p className="text-sm text-gray-600">— Marcus T., 18-door portfolio owner</p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                "My friends complain about emergency repairs. 
                <strong className="text-gray-900"> I literally can't relate anymore.</strong> 
                Nothing's an emergency when you catch it early."
              </p>
              <p className="text-sm text-gray-600">— David L., Vancouver homeowner</p>
            </div>
          </div>
        </div>

        {/* What Changes For You */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-12 max-w-4xl mx-auto border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What Changes For You
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">❌</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Instead of this:</p>
                  <p className="text-gray-700">"Is that ceiling stain a problem? When did I last service the HVAC? Should I be worried about that noise? Who do I even call for this?"</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">✅</div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-2">You get this:</p>
                  <p className="text-gray-700">Text from us: "Inspected your home today. Everything looks good. Small caulk issue in bathroom - fixing it Thursday."</p>
                  <p className="text-green-700 font-semibold mt-2">You do: Nothing. We handle it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* The Numbers */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What You Pay vs What You Get
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <p className="text-xl text-gray-600 mb-2">You invest:</p>
              <p className="text-5xl font-bold text-gray-900">$183<span className="text-2xl text-gray-600">/month</span></p>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-8">
              <p className="text-xl text-gray-600 mb-4 text-center">You get back:</p>
              <ul className="space-y-3 text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span><strong>Your weekends</strong> (worth thousands in time)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span><strong>No emergency repair bills</strong> ($5K-15K saved yearly)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span><strong>Peace of mind</strong> (priceless)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span><strong>A home you're proud of</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span><strong>Confidence when selling</strong></span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mt-8 border-2 border-blue-200">
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong>One client saved $12,000 last year</strong> because we caught a roof leak before it destroyed the attic.
              </p>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-600">The leak repair:</span>
                <span className="text-2xl font-bold text-green-600">$200</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600">What it would have been:</span>
                <span className="text-2xl font-bold text-red-600">$12,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Stop Worrying?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            See how it works with a 2-minute interactive demo. No signup required.
          </p>
          
          <button
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-xl transition-all shadow-lg inline-flex items-center gap-3"
          >
            Show Me How It Works
            <ArrowRight className="w-6 h-6" />
          </button>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm text-gray-500">
            <div>✓ 2-minute demo</div>
            <div>✓ No signup needed</div>
            <div>✓ See real examples</div>
          </div>
        </div>

      </div>
    </div>
  );
}