import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How is this different from a spreadsheet or reminder app?",
      answer: "Spreadsheets don't predict cascade failures, calculate health scores, or teach you to think systematically. The 360° Method isn't just tracking—it's a complete transformation framework that turns reactive homeowners into proactive asset managers. The app is the implementation tool for the methodology."
    },
    {
      question: "I'm not handy. Will this work for me?",
      answer: "Absolutely. The 360° Method isn't about doing repairs yourself—it's about KNOWING what needs attention and WHEN. You can DIY, hire professionals, or do a mix of both. The system tells you what to prioritize regardless of who does the work."
    },
    {
      question: "My property is new. Do I really need this?",
      answer: "New properties are the BEST time to start. Establishing your baseline now means you'll catch issues while they're under warranty, track everything from day one, and prevent the 'I don't know the history' problem that costs homeowners thousands."
    },
    {
      question: "What if I have multiple properties?",
      answer: "The 360° Method scales beautifully. Whether you have 1 property or 100, the same 9-step framework applies. Our higher tiers support portfolio management with consolidated dashboards and per-property metrics."
    },
    {
      question: "How much does it cost?",
      answer: "We have a free tier for getting started with 1 property. Paid tiers start at $19/month. Most users prevent $2,000-8,000 in emergencies per year—so the ROI is typically 10x or more."
    },
    {
      question: "What if I don't like it?",
      answer: "The basic tier is free forever—try it without risk. For paid tiers, you can cancel anytime with no penalties. We're confident you'll see results, but you're never locked in."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white scroll-mt-16">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Questions? We've Got Answers.
          </h2>
        </div>
        
        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}