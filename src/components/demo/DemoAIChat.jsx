import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useDemo } from '../shared/DemoContext';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What is the 360° Method?",
  "Why is seasonal inspection important?",
  "Where do I find my water heater?",
  "What happens if I skip maintenance?",
  "How does this prevent expensive repairs?"
];

export default function DemoAIChat() {
  const { demoMode, demoData } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Create conversation on first open
  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

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

  const initializeConversation = async () => {
    try {
      const propertyContext = demoData?.property ? 
        `Demo Property: ${demoData.property.address} (${demoData.property.property_type})` : 
        'Demo Mode';

      const conversation = await base44.agents.createConversation({
        agent_name: 'demo_assistant',
        metadata: {
          name: 'Demo AI Assistant',
          description: propertyContext
        }
      });

      setConversationId(conversation.id);
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your 360° Method AI assistant. I'm here to help you understand property maintenance and the demo you're exploring.\n\nFeel free to ask me anything about:\n• The 360° Method framework\n• Your demo property's inspection findings\n• Where to find home systems\n• Why maintenance matters\n• How to prevent expensive repairs\n\nWhat would you like to know?`
      }]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading || !conversationId) return;

    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Subscribe to updates for streaming
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages);
      });

      // Send message
      await base44.agents.addMessage({ id: conversationId }, userMessage);

      // Cleanup subscription after response
      setTimeout(() => unsubscribe(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try asking your question again.'
      }]);
    } finally {
      setIsLoading(false);
    }
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
        className="fixed top-40 right-4 md:top-24 md:right-6 z-40 w-14 h-14 bg-white text-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group border-2 border-purple-600"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask AI Assistant 💬
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 top-40 bottom-4 md:top-1/2 md:right-6 md:left-auto md:-translate-y-1/2 md:w-[500px] md:max-h-[85vh] z-[9999]">
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
                    className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full border border-purple-200 transition-colors"
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
                className="bg-purple-600 hover:bg-purple-700"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}