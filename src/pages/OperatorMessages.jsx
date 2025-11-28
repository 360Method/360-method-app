import React, { useState } from 'react';
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
  Smile
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
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock conversations
  const conversations = [
    {
      id: '1',
      client_name: 'Sarah Johnson',
      property_address: '123 Oak Street, Portland',
      avatar: 'SJ',
      last_message: 'Thanks for the inspection report! Everything looks great.',
      last_message_time: '2025-11-28T10:30:00',
      unread: 0,
      starred: true,
      online: true,
      messages: [
        { id: 1, sender: 'client', text: 'Hi, I wanted to check on the status of my HVAC maintenance.', time: '2025-11-28T09:15:00' },
        { id: 2, sender: 'operator', text: 'Hi Sarah! The technician completed the HVAC maintenance yesterday. Everything is running smoothly. I\'ll send over the detailed report shortly.', time: '2025-11-28T09:45:00' },
        { id: 3, sender: 'client', text: 'That\'s great to hear! When can I expect the report?', time: '2025-11-28T10:00:00' },
        { id: 4, sender: 'operator', text: 'I just emailed it to you. Please let me know if you have any questions!', time: '2025-11-28T10:15:00' },
        { id: 5, sender: 'client', text: 'Thanks for the inspection report! Everything looks great.', time: '2025-11-28T10:30:00' },
      ]
    },
    {
      id: '2',
      client_name: 'Mike Peterson',
      property_address: '456 Elm Avenue, Portland',
      avatar: 'MP',
      last_message: 'When can the plumber come by? The leak is getting worse.',
      last_message_time: '2025-11-28T09:15:00',
      unread: 2,
      starred: false,
      online: false,
      messages: [
        { id: 1, sender: 'client', text: 'I noticed a leak under my kitchen sink.', time: '2025-11-27T14:00:00' },
        { id: 2, sender: 'operator', text: 'Thanks for letting us know, Mike. I\'ll schedule a plumber for you. Is tomorrow morning okay?', time: '2025-11-27T14:30:00' },
        { id: 3, sender: 'client', text: 'Tomorrow works. What time?', time: '2025-11-27T15:00:00' },
        { id: 4, sender: 'client', text: 'When can the plumber come by? The leak is getting worse.', time: '2025-11-28T09:15:00' },
      ]
    },
    {
      id: '3',
      client_name: 'Lisa Chen',
      property_address: '789 Pine Road, Portland',
      avatar: 'LC',
      last_message: 'The new water heater is working perfectly!',
      last_message_time: '2025-11-27T16:45:00',
      unread: 0,
      starred: false,
      online: true,
      messages: [
        { id: 1, sender: 'operator', text: 'Hi Lisa, just following up on the water heater installation. How\'s everything working?', time: '2025-11-27T14:00:00' },
        { id: 2, sender: 'client', text: 'The new water heater is working perfectly!', time: '2025-11-27T16:45:00' },
      ]
    },
    {
      id: '4',
      client_name: 'David Williams',
      property_address: '321 Cedar Lane, Portland',
      avatar: 'DW',
      last_message: 'Can we schedule the annual roof inspection?',
      last_message_time: '2025-11-26T11:20:00',
      unread: 1,
      starred: true,
      online: false,
      messages: [
        { id: 1, sender: 'client', text: 'Can we schedule the annual roof inspection?', time: '2025-11-26T11:20:00' },
      ]
    },
    {
      id: '5',
      client_name: 'Emily Rodriguez',
      property_address: '654 Maple Drive, Portland',
      avatar: 'ER',
      last_message: 'Perfect, see you Thursday!',
      last_message_time: '2025-11-25T09:30:00',
      unread: 0,
      starred: false,
      online: false,
      messages: [
        { id: 1, sender: 'operator', text: 'Hi Emily, your quarterly inspection is coming up. Does Thursday at 10am work?', time: '2025-11-25T09:00:00' },
        { id: 2, sender: 'client', text: 'Perfect, see you Thursday!', time: '2025-11-25T09:30:00' },
      ]
    }
  ];

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
    if (!newMessage.trim()) return;
    // In real app, would send to backend
    console.log('Sending:', newMessage);
    setNewMessage('');
  };

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
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2" />
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
                  disabled={!newMessage.trim()}
                  className="rounded-full w-11 h-11 p-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-5 h-5" />
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
