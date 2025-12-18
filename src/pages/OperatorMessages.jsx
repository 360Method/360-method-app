import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Operator } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  Trash2,
  ChevronLeft,
  Home,
  Clock,
  CheckCheck,
  Check,
  Image,
  File,
  Smile,
  Loader2,
  MessageSquare
} from 'lucide-react';
import OperatorLayout from '@/components/operator/OperatorLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function OperatorMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch operator profile
  const { data: myOperator } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const operators = await Operator.filter({ user_id: user?.id });
      return operators[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch conversations (threads with clients)
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['operator-conversations', myOperator?.id],
    queryFn: async () => {
      // Fetch message threads grouped by client
      const { data: threads, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          operator_clients(id, contact_name, property_address),
          messages(id, content, sender_type, created_at, read_at)
        `)
        .eq('operator_id', myOperator.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        // If message_threads table doesn't exist, return empty array
        console.log('Message threads query error (table may not exist):', error.message);
        return [];
      }

      // Transform to expected format
      return (threads || []).map(thread => {
        const client = thread.operator_clients || {};
        const messages = thread.messages || [];
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(m => m.sender_type === 'client' && !m.read_at).length;
        const clientName = client.contact_name || 'Unknown Client';

        return {
          id: thread.id,
          client_id: thread.client_id,
          client_name: clientName,
          property_address: client.property_address || 'No address',
          avatar: clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          last_message: lastMessage?.content || 'No messages yet',
          last_message_time: thread.last_message_at || thread.created_at,
          unread: unreadCount,
          starred: thread.starred || false,
          online: false, // Would need real-time presence tracking
          messages: messages.map(m => ({
            id: m.id,
            sender: m.sender_type === 'operator' ? 'operator' : 'client',
            text: m.content,
            time: m.created_at
          }))
        };
      });
    },
    enabled: !!myOperator?.id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_type: 'operator',
          sender_id: myOperator.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Update thread's last_message_at
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', threadId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-conversations'] });
    }
  });

  // Toggle starred mutation
  const toggleStarredMutation = useMutation({
    mutationFn: async ({ threadId, starred }) => {
      const { error } = await supabase
        .from('message_threads')
        .update({ starred })
        .eq('id', threadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-conversations'] });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Filter conversations
  let filteredConversations = conversations.filter(c =>
    c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.property_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filter === 'unread') {
    filteredConversations = filteredConversations.filter(c => c.unread > 0);
  } else if (filter === 'starred') {
    filteredConversations = filteredConversations.filter(c => c.starred);
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      threadId: selectedConversation.id,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  const handleToggleStar = () => {
    if (!selectedConversation) return;
    toggleStarredMutation.mutate({
      threadId: selectedConversation.id,
      starred: !selectedConversation.starred
    });
    // Update local state
    setSelectedConversation(prev => prev ? { ...prev, starred: !prev.starred } : null);
  };

  // Loading state
  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="flex h-[calc(100vh-56px)] md:h-screen">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              {totalUnread > 0 && (
                <Badge className="bg-red-500 text-white">{totalUnread}</Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'starred', label: 'Starred' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">{conversation.avatar}</span>
                  </div>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{conversation.client_name}</span>
                      {conversation.starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(conversation.last_message_time)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Home className="w-3 h-3" />
                    <span className="truncate">{conversation.property_address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conversation.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conversation.last_message}
                    </p>
                    {conversation.unread > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs ml-2">{conversation.unread}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">{selectedConversation.avatar}</span>
                  </div>
                  {selectedConversation.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedConversation.client_name}</h2>
                  <p className="text-xs text-gray-500">{selectedConversation.property_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleToggleStar}>
                      <Star className={`w-4 h-4 mr-2 ${selectedConversation.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      {selectedConversation.starred ? 'Unstar' : 'Star'} conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message, index) => {
                const isOperator = message.sender === 'operator';
                const showTime = index === 0 ||
                  new Date(message.time).toDateString() !== new Date(selectedConversation.messages[index - 1].time).toDateString();

                return (
                  <React.Fragment key={message.id}>
                    {showTime && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          {new Date(message.time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isOperator ? 'order-2' : ''}`}>
                        <div className={`p-3 rounded-2xl ${
                          isOperator
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isOperator ? 'justify-end' : ''}`}>
                          <span className="text-xs text-gray-400">{formatMessageTime(message.time)}</span>
                          {isOperator && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-100 rounded-2xl">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="border-0 bg-transparent resize-none min-h-[44px] max-h-32 focus-visible:ring-0"
                    rows={1}
                  />
                  <div className="flex items-center gap-1 px-3 pb-2">
                    <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                      <Image className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="rounded-full w-11 h-11 p-0 bg-blue-600 hover:bg-blue-700"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a client to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}
