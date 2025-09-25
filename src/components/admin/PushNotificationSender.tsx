import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Clock, Zap, Target, MessageSquare, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface PushNotificationSenderProps {
  onSendNotification: (data: any) => Promise<void>;
  signalPlans: any[];
  competitions: any[];
  loading: boolean;
}

const PushNotificationSender: React.FC<PushNotificationSenderProps> = ({
  onSendNotification,
  signalPlans,
  competitions,
  loading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetAudience: 'all',
    selectedSignalPlan: '',
    selectedCompetition: '',
    isScheduled: false,
    scheduledTime: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        ...(formData.targetAudience === 'specific_signal_plan' && {
          signalPlanId: formData.selectedSignalPlan
        })
      };

      await onSendNotification(payload);
      
      // Reset form after successful send
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
        targetAudience: 'all',
        selectedSignalPlan: '',
        selectedCompetition: '',
        isScheduled: false,
        scheduledTime: ''
      });
    } catch (error) {
      // Error handling:'Error sending notification:', error);
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      {/* Send Form */}
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Push Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-white flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter notification message"
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                  required
                />
              </div>

              {/* Type and Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-white flex items-center gap-2 h-5">
                    Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience" className="text-white flex items-center gap-2 h-5">
                    <Target className="h-4 w-4" />
                    Target *
                  </Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => handleSelectChange('targetAudience', value)}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="challenge_participants">Competition Participants</SelectItem>
                      <SelectItem value="specific_competition">Specific Competition</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="signal_plan_subscribers">Signal Plan Subscribers</SelectItem>
                      <SelectItem value="specific_signal_plan">Specific Signal Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Signal Plan Selector */}
              {formData.targetAudience === 'specific_signal_plan' && (
                <div>
                  <Label htmlFor="selectedSignalPlan" className="text-white">Select Signal Plan *</Label>
                  <Select value={formData.selectedSignalPlan} onValueChange={(value) => handleSelectChange('selectedSignalPlan', value)}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a signal plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      {signalPlans.map((plan) => (
                        <SelectItem key={plan._id} value={plan._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{plan.name}</span>
                            <span className="text-gray-400 text-xs ml-2">
                              ({plan.currentSubscribers || 0} subscribers)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Competition Selector */}
              {formData.targetAudience === 'specific_competition' && (
                <div>
                  <Label htmlFor="selectedCompetition" className="text-white">Select Competition *</Label>
                  <Select value={formData.selectedCompetition} onValueChange={(value) => handleSelectChange('selectedCompetition', value)}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a competition" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      {competitions.map((competition) => (
                        <SelectItem key={competition._id} value={competition._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{competition.name}</span>
                            <span className="text-gray-400 text-xs ml-2">
                              ({competition.currentParticipants || 0} participants)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Scheduling */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isScheduled"
                    checked={formData.isScheduled}
                    onChange={(e) => handleCheckboxChange('isScheduled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="isScheduled" className="text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule for later
                  </Label>
                </div>

                {formData.isScheduled && (
                  <div>
                    <Label htmlFor="scheduledTime" className="text-white">Scheduled Time *</Label>
                    <Input
                      id="scheduledTime"
                      name="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                      required={formData.isScheduled}
                    />
                  </div>
                )}
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.message.trim()}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Notification
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PushNotificationSender;
