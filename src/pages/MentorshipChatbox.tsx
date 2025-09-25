import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Pin, 
  Calendar,
  Clock,
  User,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Image,
  Link,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  senderType: 'mentor' | 'student';
  content: string;
  messageType: 'lesson' | 'question' | 'feedback' | 'general' | 'session';
  lessonData?: {
    title: string;
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    resources: string[];
  };
  sessionData?: {
    scheduledDate: string;
    duration: number;
    topic: string;
    notes: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  };
  attachments?: Array<{
    type: 'image' | 'file' | 'video' | 'link';
    url: string;
    filename: string;
    size: number;
  }>;
  isPinned: boolean;
  createdAt: string;
}

interface Chatbox {
  _id: string;
  mentorshipPlan: string;
  messages: Message[];
  subscribers: Array<{
    user: string;
    subscription: string;
    joinedAt: string;
    isActive: boolean;
    sessionCount: number;
    maxSessions: number;
  }>;
  settings: {
    allowStudentMessages: boolean;
    autoArchiveAfterDays: number;
    maxMessageLength: number;
    sessionBookingEnabled: boolean;
  };
}

interface Subscription {
  _id: string;
  status: string;
  sessionCount: number;
  maxSessions: number;
  nextSessionDate: string | null;
  sessionHistory: Array<{
    date: string;
    duration: number;
    topic: string;
    notes: string;
    status: string;
  }>;
}

const MentorshipChatbox = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chatbox, setChatbox] = useState<Chatbox | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'general' | 'question' | 'feedback'>('general');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (planId) {
      fetchChatbox();
    }
  }, [planId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatbox?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatbox = async () => {
    try {
      const response = await fetch(`${API_URL}/mentorship-chatboxes/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatbox(data.data.chatbox);
        setSubscription(data.data.subscription);
      } else {
        toast.error('Failed to fetch chatbox');
        navigate('/mentorships');
      }
    } catch (error) {
      // Silent error handling for chatbox
      toast.error('Failed to fetch chatbox');
      navigate('/mentorships');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chatbox) return;

    try {
      const response = await fetch(`${API_URL}/mentorship-chatboxes/${planId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: message.trim(),
          messageType: messageType
        })
      });

      if (response.ok) {
        setMessage('');
        fetchChatbox(); // Refresh messages
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      // Silent error handling for sending message
      toast.error('Failed to send message');
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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'session': return <Video className="h-4 w-4" />;
      case 'question': return <MessageSquare className="h-4 w-4" />;
      case 'feedback': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-500/20 text-blue-300';
      case 'session': return 'bg-purple-500/20 text-purple-300';
      case 'question': return 'bg-yellow-500/20 text-yellow-300';
      case 'feedback': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading mentorship chat..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (!chatbox || !subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chatbox not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/mentorships')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Mentorship Chatbox</h1>
                <p className="text-gray-300 text-sm">Connect with your mentor</p>
              </div>
            </div>
            
            {/* Session Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  Sessions: {subscription.sessionCount}/{subscription.maxSessions}
                </p>
                {subscription.nextSessionDate && (
                  <p className="text-gray-400 text-xs">
                    Next: {formatDate(subscription.nextSessionDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 h-[600px] flex flex-col">
              <CardHeader className="p-4 border-b border-white/10">
                <CardTitle className="text-white text-lg">Messages</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {chatbox.messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatbox.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender._id === user?.id
                              ? 'bg-purple-600 text-white'
                              : msg.senderType === 'mentor'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {/* Message Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </span>
                              <Badge className={`text-xs ${getMessageTypeColor(msg.messageType)}`}>
                                {getMessageTypeIcon(msg.messageType)}
                                <span className="ml-1 capitalize">{msg.messageType}</span>
                              </Badge>
                            </div>
                            {msg.isPinned && (
                              <Pin className="h-3 w-3 text-yellow-400" />
                            )}
                          </div>

                          {/* Message Content */}
                          <p className="text-sm">{msg.content}</p>

                          {/* Lesson Data */}
                          {msg.lessonData && (
                            <div className="mt-2 p-2 bg-black/20 rounded text-xs">
                              <p className="font-medium">{msg.lessonData.title}</p>
                              <p className="text-gray-300">Topic: {msg.lessonData.topic}</p>
                              <p className="text-gray-300">Difficulty: {msg.lessonData.difficulty}</p>
                              <p className="text-gray-300">Duration: {msg.lessonData.duration} minutes</p>
                            </div>
                          )}

                          {/* Session Data */}
                          {msg.sessionData && (
                            <div className="mt-2 p-2 bg-black/20 rounded text-xs">
                              <p className="font-medium">Session Scheduled</p>
                              <p className="text-gray-300">Date: {formatDate(msg.sessionData.scheduledDate)}</p>
                              <p className="text-gray-300">Topic: {msg.sessionData.topic}</p>
                              <p className="text-gray-300">Duration: {msg.sessionData.duration} minutes</p>
                              <Badge className={`mt-1 ${getMessageTypeColor(msg.sessionData.status)}`}>
                                {msg.sessionData.status}
                              </Badge>
                            </div>
                          )}

                          {/* Message Time */}
                          <p className="text-xs opacity-70 mt-2">
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex space-x-2 mb-2">
                      <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        <option value="general">General</option>
                        <option value="question">Question</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400 resize-none"
                      rows={2}
                      maxLength={chatbox.settings.maxMessageLength}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {message.length}/{chatbox.settings.maxMessageLength} characters
                    </p>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Session Stats */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4">
                <CardTitle className="text-white text-lg">Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Used</span>
                    <span className="text-white font-medium">{subscription.sessionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Available</span>
                    <span className="text-white font-medium">{subscription.maxSessions}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(subscription.sessionCount / subscription.maxSessions) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            {subscription.sessionHistory.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader className="p-4">
                  <CardTitle className="text-white text-lg">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {subscription.sessionHistory.slice(0, 3).map((session, index) => (
                      <div key={index} className="p-2 bg-white/5 rounded text-xs">
                        <p className="text-white font-medium">{session.topic}</p>
                        <p className="text-gray-400">{formatDate(session.date)}</p>
                        <Badge className={`mt-1 ${getMessageTypeColor(session.status)}`}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MentorshipChatbox;
