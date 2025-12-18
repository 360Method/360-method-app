import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { Contractor } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import { MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractorMessages() {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Fetch contractor profile
  const { data: contractor } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      const contractors = await Contractor.filter({ user_id: user?.id });
      return contractors?.[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch operator connections (as message threads)
  const { data: operatorConnections, isLoading } = useQuery({
    queryKey: ['contractor-operators', contractor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_contractors')
        .select(`
          *,
          operator:operators (
            id,
            company_name
          )
        `)
        .eq('contractor_id', contractor?.id)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractor?.id
  });

  // Transform to threads format
  const threads = useMemo(() => {
    if (!operatorConnections) return [];
    return operatorConnections.map(conn => ({
      id: conn.operator?.id || conn.id,
      operator_name: conn.operator?.company_name || 'Unknown Operator',
      operator_company: conn.operator?.company_name || 'Unknown',
      last_message: 'Start a conversation', // Placeholder - would come from messages table
      last_message_time: 'Just now',
      unread_count: 0
    }));
  }, [operatorConnections]);

  // Messages would be fetched from a messages table when available
  const messages = selectedThread ? [] : [];

  const handleSend = async () => {
    if (!messageText.trim()) return;
    // Would send message to database when messages table is available
    toast.info('Messaging feature coming soon!');
    setMessageText('');
  };

  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  if (selectedThread) {
    const currentThread = threads.find(t => t.id === selectedThread);
    return (
      <ContractorLayout>
        <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">
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
                  {currentThread?.operator_name}
                </div>
                <div className="text-sm text-gray-600">
                  {currentThread?.operator_company}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
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
              ))
            )}
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
      </ContractorLayout>
    );
  }

  return (
    <ContractorLayout>
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Conversations with operators</p>
        </div>

        {/* Thread List */}
        <div className="space-y-3">
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
      </div>
    </ContractorLayout>
  );
}