import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ContractorBottomNav from '../components/contractor/BottomNav';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

export default function ContractorMessages() {
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');

  const threads = [
    {
      id: '1',
      operator_name: 'Handy Pioneers',
      operator_company: 'Handy Pioneers LLC',
      last_message: 'Thanks for the update. Looks great!',
      last_message_time: '2 hours ago',
      unread_count: 0
    },
    {
      id: '2',
      operator_name: 'Property Care Pro',
      operator_company: 'Property Care Pro Inc',
      last_message: 'Can you arrive by 9am tomorrow?',
      last_message_time: '5 hours ago',
      unread_count: 2
    }
  ];

  const messages = selectedThread ? [
    {
      id: '1',
      from: 'operator',
      text: 'Hi! Just wanted to confirm you received the job details.',
      time: '10:30 AM'
    },
    {
      id: '2',
      from: 'contractor',
      text: 'Yes, got it! Planning to start tomorrow morning.',
      time: '10:45 AM'
    },
    {
      id: '3',
      from: 'operator',
      text: 'Perfect. Let me know if you need anything.',
      time: '10:47 AM'
    }
  ] : [];

  const handleSend = () => {
    if (!messageText.trim()) return;
    setMessageText('');
  };

  if (selectedThread) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedThread(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="font-bold text-gray-900">
                {threads.find(t => t.id === selectedThread)?.operator_name}
              </div>
              <div className="text-sm text-gray-600">
                {threads.find(t => t.id === selectedThread)?.operator_company}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'contractor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.from === 'contractor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="text-sm leading-relaxed">{msg.text}</div>
                <div className={`text-xs mt-1 ${
                  msg.from === 'contractor' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} size="lg" className="gap-2">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Conversations with operators</p>
      </div>

      {/* Thread List */}
      <div className="p-4 space-y-3 pb-24">
        {threads.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="font-semibold text-gray-900 mb-2">No Messages</div>
            <div className="text-sm text-gray-600">
              Your conversations will appear here
            </div>
          </Card>
        ) : (
          threads.map(thread => (
            <Card
              key={thread.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedThread(thread.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-gray-900">
                      {thread.operator_name}
                    </div>
                    {thread.unread_count > 0 && (
                      <Badge className="bg-blue-600 text-white">
                        {thread.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {thread.operator_company}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {thread.last_message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {thread.last_message_time}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ContractorBottomNav />
    </div>
  );
}