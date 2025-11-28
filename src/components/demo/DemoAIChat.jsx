import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemo } from '../shared/DemoContext';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What is the 360° Method?",
  "Why is seasonal inspection important?",
  "Where do I find my water heater?",
  "What happens if I skip maintenance?",
  "How does this prevent expensive repairs?"
];

// Simulated AI responses for demo mode (no server required)
const DEMO_RESPONSES = {
  "what is the 360° method": `The **360° Method** is a comprehensive property maintenance framework with 3 phases and 9 steps:

**Phase I: AWARE (OWN)**
1. **Baseline** - Document your home's systems
2. **Inspect** - Seasonal walkthrough checklists
3. **Track** - Log maintenance history

**Phase II: ACT (BUILD)**
4. **Prioritize** - Rank issues by urgency
5. **Schedule** - Plan maintenance strategically
6. **Execute** - Complete tasks with guidance

**Phase III: ADVANCE (GROW)**
7. **Preserve** - Extend system lifespan
8. **Upgrade** - Strategic improvements
9. **Scale** - Portfolio growth

This systematic approach prevents expensive emergency repairs by catching problems early!`,

  "why is seasonal inspection important": `**Seasonal inspections are critical** because different weather conditions reveal different problems:

🌸 **Spring**
- Check for winter damage to roof/siding
- Test AC before hot weather
- Inspect gutters after leaf fall

☀️ **Summer**
- Monitor AC efficiency
- Check for pest entry points
- Inspect deck/patio condition

🍂 **Fall**
- Prepare heating system
- Clean gutters before rain/snow
- Seal air leaks before winter

❄️ **Winter**
- Watch for ice dams
- Check pipe insulation
- Monitor heating costs

**Regular inspections catch 90% of problems before they become emergencies!**`,

  "where do i find my water heater": `**Common water heater locations:**

🏠 **Most Common:**
- Garage (attached or detached)
- Basement or utility room
- Dedicated closet (often near kitchen/laundry)

🔍 **How to identify it:**
- Large cylindrical tank (40-80 gallons typical)
- Two pipes connected at top (hot out, cold in)
- Temperature dial on front
- Drain valve near bottom
- Vent pipe going up (gas units)

📋 **What to check:**
- Age (label on side) - replace after 10-15 years
- Signs of rust or corrosion
- Puddles underneath
- Temperature setting (120°F recommended)

*In your demo property, the water heater is 16 years old - which means it's due for replacement planning!*`,

  "what happens if i skip maintenance": `**Skipping maintenance leads to:**

💸 **Financial Impact:**
- Emergency repairs cost 3-5x more than planned repairs
- $200 gutter cleaning → $15,000 foundation repair
- $150 HVAC tune-up → $5,000+ emergency replacement

🏚️ **Property Damage:**
- Small leaks become mold problems
- Clogged drains cause backups
- Worn weatherstripping increases energy bills 20-30%

⏰ **Cascading Failures:**
- One system failure often causes others
- Example: Failed sump pump → flooded basement → damaged furnace → mold growth

📉 **Home Value:**
- Deferred maintenance reduces resale value
- Buyers' inspections reveal problems
- Insurance claims may be denied

*The demo "struggling" property shows exactly what happens - a score of 62 with $17,000 in predicted repairs!*`,

  "how does this prevent expensive repairs": `**The 360° Method prevents expensive repairs through:**

🔍 **Early Detection:**
- Regular inspections catch issues when they're small
- $50 caulking fix prevents $5,000 water damage
- AI identifies problems you might miss

📅 **Strategic Scheduling:**
- Plan repairs during off-season (lower prices)
- Bundle related work for contractor discounts
- Avoid emergency rates (often 2-3x normal)

📊 **Prioritization:**
- Fix high-risk items first
- Understand "cascade risk" (one failure causing others)
- Focus limited budget where it matters most

💡 **Knowledge:**
- Know your systems' ages and expected lifespans
- Replace before failure, not after
- DIY guides for simple tasks

**Example savings:**
- Reactive homeowner: $17,000/year in emergencies
- Proactive homeowner: $3,000/year in planned maintenance

*That's $14,000 saved annually!*`
};

// Function to find the best matching response
const findBestResponse = (question) => {
  const q = question.toLowerCase().trim();

  // Check for exact or close matches
  for (const [key, response] of Object.entries(DEMO_RESPONSES)) {
    if (q.includes(key) || key.includes(q.slice(0, 20))) {
      return response;
    }
  }

  // Keyword matching
  if (q.includes('360') || q.includes('method') || q.includes('what is')) {
    return DEMO_RESPONSES["what is the 360° method"];
  }
  if (q.includes('season') || q.includes('inspect') || q.includes('check')) {
    return DEMO_RESPONSES["why is seasonal inspection important"];
  }
  if (q.includes('water heater') || q.includes('find') || q.includes('where') || q.includes('locate')) {
    return DEMO_RESPONSES["where do i find my water heater"];
  }
  if (q.includes('skip') || q.includes('ignore') || q.includes('happen') || q.includes('don\'t')) {
    return DEMO_RESPONSES["what happens if i skip maintenance"];
  }
  if (q.includes('prevent') || q.includes('save') || q.includes('expensive') || q.includes('repair') || q.includes('cost')) {
    return DEMO_RESPONSES["how does this prevent expensive repairs"];
  }

  // Default response
  return `Great question! In the **360° Method**, we focus on proactive maintenance to protect your home.

Here are some topics I can help with:
• **The 360° Method** - Our 3-phase, 9-step framework
• **Seasonal inspections** - Why timing matters
• **Finding systems** - Locating water heaters, HVAC, etc.
• **Consequences of neglect** - What happens without maintenance
• **Cost savings** - How prevention beats reaction

*Try asking one of the suggested questions, or explore the demo to see the method in action!*`;
};

export default function DemoAIChat() {
  const { demoMode, demoData } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true);
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your 360° Method AI assistant. I'm here to help you understand property maintenance and the demo you're exploring.

Feel free to ask me anything about:
• The 360° Method framework
• Your demo property's inspection findings
• Where to find home systems
• Why maintenance matters
• How to prevent expensive repairs

What would you like to know?`
      }]);
    }
  }, [isOpen, initialized]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI "thinking" delay for realistic feel
    setTimeout(() => {
      const response = findBestResponse(text);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
      setIsLoading(false);
    }, 800 + Math.random() * 700); // 800-1500ms delay
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  // Only show in demo mode
  if (!demoMode) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-demo-ai-trigger="true"
        className="fixed top-40 right-4 md:top-24 md:right-6 z-40 w-14 h-14 bg-white text-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group border-2 border-purple-600"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask AI Assistant
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 top-40 bottom-4 md:top-1/2 md:right-6 md:left-auto md:-translate-y-1/2 md:w-[500px] md:h-[75vh] z-[9999]">
      <Card className="shadow-2xl border-2 border-purple-300 h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            Demo Mode • Educational only
          </p>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (show when no messages yet) */}
          {messages.length <= 1 && !isLoading && (
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full border border-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: '36px' }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                style={{ minHeight: '44px' }}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}