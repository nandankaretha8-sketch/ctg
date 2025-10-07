import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  Send,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
interface SupportTicket {
  _id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  messages: Array<{
    _id: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    senderType: 'user' | 'admin';
    message: string;
    timestamp: string;
    isRead: boolean;
  }>;
  lastMessage: string;
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    name?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New ticket form
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/support/my-tickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data.tickets);
      } else {
        toast.error('Failed to fetch support tickets');
      }
    } catch (error) {
      toast.error('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`${API_URL}/support/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.data);
      } else {
        toast.error('Failed to fetch ticket details');
      }
    } catch (error) {
      toast.error('Failed to fetch ticket details');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/support/${selectedTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        await fetchTicketDetails(selectedTicket._id);
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const createNewTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTicketForm)
      });

      if (response.ok) {
        const data = await response.json();
        setTickets([data.data, ...tickets]);
        setSelectedTicket(data.data);
        setShowNewTicket(false);
        setNewTicketForm({
          subject: '',
          category: 'general',
          priority: 'medium',
          message: ''
        });
        toast.success('Support ticket created successfully');
      } else {
        toast.error('Failed to create support ticket');
      }
    } catch (error) {
      toast.error('Failed to create support ticket');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-purple-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.messages[0]?.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading support tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Center</h1>
            <p className="text-gray-300 text-sm sm:text-base">Get help from our support team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-white text-lg sm:text-xl">My Tickets</CardTitle>
                  <Button
                    onClick={() => setShowNewTicket(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
                
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No support tickets found</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => fetchTicketDetails(ticket._id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedTicket?._id === ticket._id
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium text-sm line-clamp-1">
                            {ticket.subject}
                          </h3>
                          <div className="flex gap-1">
                            <Badge className={`${getStatusColor(ticket.status)} text-white text-xs`}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                          {ticket.messages[0]?.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(ticket.lastMessage)}</span>
                          <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs`}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 h-[600px] flex flex-col">
                <CardHeader className="p-4 sm:p-6 border-b border-white/10">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg sm:text-xl truncate">
                          {selectedTicket.subject}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(selectedTicket.status)} text-white text-xs`}>
                            {selectedTicket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white text-xs`}>
                            {selectedTicket.priority}
                          </Badge>
                          <Badge variant="outline" className="text-gray-400 border-gray-400 text-xs">
                            {selectedTicket.category}
                          </Badge>
                        </div>
                      </div>
                      {selectedTicket.assignedTo && (
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">Assigned to</p>
                          <p className="text-white text-sm">{selectedTicket.assignedTo.name}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* User Information */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(selectedTicket.user?.firstName || selectedTicket.user?.email?.charAt(0) || 'U').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {selectedTicket.user?.firstName && selectedTicket.user?.lastName 
                            ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`
                            : selectedTicket.user?.firstName || 'Unknown User'}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {selectedTicket.user?.email || 'No email provided'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Created</p>
                        <p className="text-white text-xs">
                          {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg break-words ${
                            message.senderType === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-purple-900 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">
                              {message.senderType === 'admin' ? 'Admin' : 
                               message.sender?.firstName && message.sender?.lastName 
                                 ? `${message.sender.firstName} ${message.sender.lastName}`
                                 : message.sender?.firstName || 'You'}
                            </span>
                            <span className="text-xs opacity-70 flex-shrink-0">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400 resize-none min-h-[60px] sm:min-h-[80px]"
                      rows={2}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl mb-2">Select a ticket to view conversation</h3>
                  <p className="text-gray-400">Choose a support ticket from the list to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-lg sm:text-xl">Create New Support Ticket</CardTitle>
                <CardDescription className="text-gray-300">
                  Describe your issue and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-white">Subject *</Label>
                  <Input
                    id="subject"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <Select value={newTicketForm.category} onValueChange={(value) => setNewTicketForm({ ...newTicketForm, category: value })}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority" className="text-white">Priority</Label>
                    <Select value={newTicketForm.priority} onValueChange={(value) => setNewTicketForm({ ...newTicketForm, priority: value })}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-white">Message *</Label>
                  <Textarea
                    id="message"
                    value={newTicketForm.message}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createNewTicket}
                    disabled={sending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white"
                  >
                    {sending ? 'Creating...' : 'Create Ticket'}
                  </Button>
                  <Button
                    onClick={() => setShowNewTicket(false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;