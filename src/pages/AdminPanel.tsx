import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Users, Trophy, BarChart3, Shield, Home, Clock, Menu, X, Edit, Trash2, Calendar, Bell, Plus, CheckCircle, Eye, Globe, UserPlus, TrendingUp, Monitor, Smartphone, Tablet, Rocket, Star, MessageSquare, MessageCircle, User as UserIcon, Target, Play, XCircle, Layout, DollarSign, Save, Send, RefreshCw, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SettingsPanel from '@/components/SettingsPanel';
import PropFirmServiceDetailsModal from '@/components/PropFirmServiceDetailsModal';
import SignalManager from '@/components/admin/SignalManager';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import CopytradePlanManager from '@/components/admin/CopytradePlanManager';
import CopytradeSubscriptionManager from '@/components/admin/CopytradeSubscriptionManager';
import AdminPaymentVerification from './AdminPaymentVerification';
import AdminCryptoWallets from './AdminCryptoWallets';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

// Custom Date Picker Component
const CustomDatePicker = ({ selectedDate, onDateSelect, onClose }: {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}) => {
  // Use UTC methods for consistent date handling
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getUTCMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getUTCFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendarDays = (year: number, month: number) => {
    // Use UTC methods for consistent date calculations
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    const startingDayOfWeek = firstDay.getUTCDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    // Create UTC date for consistent handling
    const selectedDate = new Date(Date.UTC(currentYear, currentMonth, day));
    onDateSelect(selectedDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getUTCDate() &&
      currentMonth === today.getUTCMonth() &&
      currentYear === today.getUTCFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getUTCDate() &&
      currentMonth === selectedDate.getUTCMonth() &&
      currentYear === selectedDate.getUTCFullYear()
    );
  };

  const days = generateCalendarDays(currentYear, currentMonth);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        
        <h3 className="text-white font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white rotate-180" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => day && handleDateClick(day)}
            disabled={!day}
            className={`
              p-1.5 text-sm rounded-lg transition-colors
              ${!day ? 'cursor-default' : 'cursor-pointer hover:bg-white/10'}
              ${day && isToday(day) ? 'bg-purple-500/30 text-white font-semibold' : ''}
              ${day && isSelected(day) ? 'bg-purple-500 text-white font-semibold' : ''}
              ${day && !isToday(day) && !isSelected(day) ? 'text-white hover:text-white' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Today button */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            // Create UTC date for today
            const today = new Date();
            const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            onDateSelect(utcToday);
          }}
          className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState('challenges');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Utility function to get admin panel glass card classes
  const getGlassCardClasses = (additionalClasses = '') => {
    // Use admin-specific glass card class with rounded corners
    return `admin-glass-card ${additionalClasses}`;
  };
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);

  const [challengeStatusFilter, setChallengeStatusFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [signalPlans, setSignalPlans] = useState<any[]>([]);
  const [signalPlansLoading, setSignalPlansLoading] = useState(false);
  const [competitionsLoading, setCompetitionsLoading] = useState(false);
  const [isCreateSignalPlanModalOpen, setIsCreateSignalPlanModalOpen] = useState(false);
  const [isEditSignalPlanModalOpen, setIsEditSignalPlanModalOpen] = useState(false);
  const [editingSignalPlan, setEditingSignalPlan] = useState<any>(null);
  
  // Mentorship Plans state
  const [mentorshipPlans, setMentorshipPlans] = useState<any[]>([]);
  const [mentorshipPlansLoading, setMentorshipPlansLoading] = useState(false);
  const [isCreateMentorshipPlanModalOpen, setIsCreateMentorshipPlanModalOpen] = useState(false);
  const [isEditMentorshipPlanModalOpen, setIsEditMentorshipPlanModalOpen] = useState(false);
  const [editingMentorshipPlan, setEditingMentorshipPlan] = useState<any>(null);

  // Manage Mentorships state
  const [mentorshipSubscriptions, setMentorshipSubscriptions] = useState<any[]>([]);
  const [mentorshipSubscriptionsLoading, setMentorshipSubscriptionsLoading] = useState(false);
  const [selectedMentorshipSubscription, setSelectedMentorshipSubscription] = useState<any>(null);
  const [isMentorshipChatModalOpen, setIsMentorshipChatModalOpen] = useState(false);
  const [mentorshipChatMessages, setMentorshipChatMessages] = useState<any[]>([]);
  const [newMentorshipChatMessage, setNewMentorshipChatMessage] = useState('');
  const [sendingMentorshipChatMessage, setSendingMentorshipChatMessage] = useState(false);
  
  // Session scheduling state
  const [isSessionScheduleModalOpen, setIsSessionScheduleModalOpen] = useState(false);
  const [sessionScheduleData, setSessionScheduleData] = useState({
    date: '',
    time: '',
    timezone: 'UTC',
    duration: 60,
    topic: '',
    notes: ''
  });
  const [schedulingSession, setSchedulingSession] = useState(false);
  
  // Sessions management state
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editSessionData, setEditSessionData] = useState({
    date: '',
    time: '',
    timezone: 'UTC',
    duration: 60,
    topic: '',
    notes: ''
  });
  const [updatingSession, setUpdatingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [mentorshipPlanFormData, setMentorshipPlanFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'monthly',
    pricingType: 'monthly',
    features: [''],
    isPopular: false,
    maxSubscribers: '',
    metadata: {
      sessionFrequency: 'Weekly',
      courseDuration: '7 days',
      maxSessionsPerMonth: 4,
      mentorExperience: '5+ years',
      specialization: ['forex'],
      successRate: 75,
      languages: ['English'],
      mentorName: '',
      mentorBio: ''
    }
  });
  
  // YouTube Videos state
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [youtubeVideosLoading, setYoutubeVideosLoading] = useState(false);
  const [isCreateYouTubeVideoModalOpen, setIsCreateYouTubeVideoModalOpen] = useState(false);
  const [isEditYouTubeVideoModalOpen, setIsEditYouTubeVideoModalOpen] = useState(false);
  const [editingYouTubeVideo, setEditingYouTubeVideo] = useState<any>(null);
  const [youtubeVideoFormData, setYoutubeVideoFormData] = useState({
    title: '',
    url: '',
    thumbnail: '',
    description: '',
    isActive: true
  });

  // Footer Settings state
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [footerSettingsLoading, setFooterSettingsLoading] = useState(false);
  const [isFooterSettingsModalOpen, setIsFooterSettingsModalOpen] = useState(false);
  const [footerSettingsFormData, setFooterSettingsFormData] = useState({
    companyName: '',
    companyDescription: '',
    email: '',
    phone: '',
    address: '',
    supportLinks: {
      whatsapp: '',
      telegram: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      telegram: ''
    },
    newsletter: {
      title: '',
      description: '',
      isActive: true
    },
    legalLinks: {
      privacyPolicy: '',
      termsOfService: '',
      cookiePolicy: ''
    },
    isActive: true
  });

  // Prop firm package states
  const [propFirmPackages, setPropFirmPackages] = useState<any[]>([]);
  const [propFirmPackagesLoading, setPropFirmPackagesLoading] = useState(false);
  const [isCreatePropFirmPackageModalOpen, setIsCreatePropFirmPackageModalOpen] = useState(false);
  const [isEditPropFirmPackageModalOpen, setIsEditPropFirmPackageModalOpen] = useState(false);
  const [editingPropFirmPackage, setEditingPropFirmPackage] = useState<any>(null);
  const [propFirmPackageFormData, setPropFirmPackageFormData] = useState({
    name: '',
    description: '',
    serviceFee: '',
    pricingType: 'monthly',
    features: [''] as string[],
    requirements: {
      minAccountSize: '',
      supportedPropFirms: [''] as string[],
      recommendedPropFirms: [{
        name: '',
        priority: 'medium' as 'high' | 'medium' | 'low',
        isRecommended: true,
        description: ''
      }],
      maxDrawdown: '',
      profitTarget: '',
      minTradingDays: ''
    },
    isPopular: false,
    maxClients: '',
    successRate: 0,
    coversAllPhaseFees: false
  });

  // Prop firm services states
  const [propFirmServices, setPropFirmServices] = useState<any[]>([]);
  const [propFirmServicesLoading, setPropFirmServicesLoading] = useState(false);
  const [isPropFirmServiceDetailsModalOpen, setIsPropFirmServiceDetailsModalOpen] = useState(false);
  const [selectedPropFirmServiceId, setSelectedPropFirmServiceId] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedServiceForChat, setSelectedServiceForChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [visitorStatsLoading, setVisitorStatsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeCompetitions: 0,
    totalUsers: 0,
    lifetimeCompetitions: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    accountSize: '',
    price: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    maxParticipants: '100',
    targetProfit: '10',
    maxDrawdown: '10'
  });
  const [rules, setRules] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<Array<{rank?: number, rankStart?: number, rankEnd?: number, prize: string, amount: number, isBulk: boolean}>>([]);
  const [customType, setCustomType] = useState('');
  
  // Signal Plan form data
  const [signalPlanFormData, setSignalPlanFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    price: '',
    duration: 'monthly',
    pricingType: 'monthly',
    features: [''],
    isPopular: false,
    maxSubscribers: '',
    signalFrequency: 'Daily',
    signalTypes: ['forex'],
    riskLevel: 'medium',
    successRate: 75
  });
  const [challengeMode, setChallengeMode] = useState<'rank' | 'target'>('target');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Support Management states
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [supportStats, setSupportStats] = useState<any>(null);
  const [supportFilters, setSupportFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all'
  });
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Notification states (simplified for new component)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Leaderboard management states
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [isEditLeaderboardModalOpen, setIsEditLeaderboardModalOpen] = useState(false);
  const [editingLeaderboardEntry, setEditingLeaderboardEntry] = useState<any>(null);
  const [mt5UpdateLoading, setMt5UpdateLoading] = useState(false);
  const [syncLeaderboardLoading, setSyncLeaderboardLoading] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [competitionParticipants, setCompetitionParticipants] = useState<any[]>([]);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'challenges', label: 'Competitions', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard Management', icon: TrendingUp },
    { id: 'signal-plans', label: 'Signal Plans', icon: Rocket },
    { id: 'mentorships', label: 'Mentorships', icon: UserIcon },
    { id: 'manage-mentorships', label: 'Manage Mentorships', icon: Users },
    { id: 'signal-manager', label: 'Send Signals', icon: MessageSquare },
    { id: 'copytrade-plans', label: 'Copytrade Plans', icon: Copy },
    { id: 'copytrade-subscriptions', label: 'Copytrade Subscriptions', icon: Users },
    { id: 'prop-firm-packages', label: 'Prop Firm Packages', icon: Target },
    { id: 'prop-firm-services', label: 'Prop Firm Services', icon: CheckCircle },
    { id: 'payment-verification', label: 'Payment Verification', icon: DollarSign },
    { id: 'crypto-wallets', label: 'Crypto Wallets', icon: Shield },
    { id: 'youtube-videos', label: 'YouTube Videos', icon: Play },
    { id: 'footer-settings', label: 'Footer Settings', icon: Layout },
    { id: 'support', label: 'Support Management', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Push Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Fetch challenges data
  const fetchChallenges = async () => {
    try {
      setChallengesLoading(true);
      
      // Use public endpoint to get all challenges (not just admin's own)
      // Add aggressive cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now() + Math.random();
      const response = await authenticatedApiCall(`/challenges?status=active,upcoming,completed&_t=${cacheBuster}&_r=${Math.random()}`);
      
      if (!response.ok) {
        throw new Error(`Challenges API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setChallenges(data.data);
      }
    } catch (error) {
      // Error:Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setChallengesLoading(false);
    }
  };


  // Fetch notifications data
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Notifications API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      // Error:Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Users API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      // Error:Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!userSearchTerm) return true;
    
    const searchLower = userSearchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const role = user.role?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           role.includes(searchLower);
  });

  // Fetch signal plans data
  const fetchSignalPlans = async () => {
    try {
      setSignalPlansLoading(true);
      
      const response = await authenticatedApiCall('/signal-plans');
      
      if (!response.ok) {
        throw new Error(`Signal Plans API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSignalPlans(data.data);
      }
    } catch (error) {
      // Error:Error fetching signal plans:', error);
      toast.error('Failed to load signal plans');
    } finally {
      setSignalPlansLoading(false);
    }
  };


  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      
      // Only fetch if a competition is selected
      if (!selectedCompetition) {
        setLeaderboard([]);
        return;
      }
      
      const url = `${API_URL}/leaderboard?challengeId=${selectedCompetition}&limit=100&_t=${Date.now()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Leaderboard API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.leaderboard.length > 0) {
        }
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      // Error:Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch competitions
  const fetchCompetitions = async () => {
    try {
      // Load all relevant competitions for admin filter (active, upcoming, completed)
      const response = await fetch(`${API_URL}/challenges?status=active,upcoming,completed`);
      
      if (!response.ok) {
        throw new Error(`Competitions API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const competitionsData = data.data || [];
        setCompetitions(competitionsData);
        
        // Set first competition as default if none selected
        if (competitionsData.length > 0 && !selectedCompetition) {
          setSelectedCompetition(competitionsData[0]._id);
        }
      }
    } catch (error) {
      // Error:Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    }
  };

  // Fetch competition participants
  const fetchCompetitionParticipants = async (competitionId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/challenges/${competitionId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Participants API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCompetitionParticipants(data.participants || []);
      }
    } catch (error) {
      // Error:Error fetching participants:', error);
      toast.error('Failed to load participants');
    }
  };

  // Filter participants based on search term
  const filteredParticipants = competitionParticipants.filter(participant => {
    if (!participantSearchTerm) return true;
    
    const searchLower = participantSearchTerm.toLowerCase();
    const fullName = `${participant.user?.firstName || ''} ${participant.user?.lastName || ''}`.toLowerCase();
    const email = participant.user?.email?.toLowerCase() || '';
    const username = participant.user?.username?.toLowerCase() || '';
    const accountId = participant.mt5Account?.id?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           username.includes(searchLower) ||
           accountId.includes(searchLower);
  });

  // Manual MT5 update
  const triggerMT5Update = async () => {
    try {
      setMt5UpdateLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/leaderboard/update-mt5`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`MT5 update API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('MT5 data updated successfully');
        // Refresh leaderboard after update
        await fetchLeaderboard();
      }
    } catch (error) {
      // Error:Error updating MT5 data:', error);
      toast.error('Failed to update MT5 data');
    } finally {
      setMt5UpdateLoading(false);
    }
  };

  // Sync leaderboard with participant data
  const syncLeaderboard = async () => {
    try {
      setSyncLeaderboardLoading(true);
      const response = await authenticatedApiCall('/challenges/admin/sync-leaderboard', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Leaderboard synced successfully! ${data.syncedCount} participants updated.`);
        // Refresh leaderboard after sync
        await fetchLeaderboard();
      }
    } catch (error) {
      // Error:Error syncing leaderboard:', error);
      toast.error('Failed to sync leaderboard');
    } finally {
      setSyncLeaderboardLoading(false);
    }
  };

  // Update leaderboard entry
  const updateLeaderboardEntry = async (entryId: string, updatedData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if this is a challenge-specific entry (no _id field) or a global leaderboard entry
      if (!entryId || entryId === 'undefined') {
        // This is a challenge-specific entry, update the participant data instead
        
        // If participantId is missing, try to find it from the current leaderboard state
        let participantId = updatedData.participantId;
        if (!participantId) {
          const currentEntry = leaderboard.find(lb => lb.userId === updatedData.userId);
          if (currentEntry && currentEntry.participantId) {
            participantId = currentEntry.participantId;
          }
        }
        
        if (!selectedCompetition || !participantId) {
          throw new Error('Missing competition or participant information');
        }

        const response = await authenticatedApiCall(`/challenges/${selectedCompetition}/participants/${participantId}`, {
          method: 'PUT',
          body: JSON.stringify({
            currentBalance: updatedData.balance,
            profit: updatedData.profit,
            profitPercent: updatedData.profitPercent,
            status: 'active' // Keep status as active when updating
          })
        });

        if (!response.ok) {
          throw new Error(`Update participant API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          toast.success('Participant data updated successfully');
          await fetchLeaderboard();
          await fetchCompetitionParticipants(selectedCompetition);
          setIsEditLeaderboardModalOpen(false);
          setEditingLeaderboardEntry(null);
        } else {
          throw new Error(data.message || 'Failed to update participant');
        }
      } else {
        // This is a global leaderboard entry, update via leaderboard API
        const response = await fetch(`${API_URL}/leaderboard/${entryId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
          throw new Error(`Update API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          toast.success('Leaderboard entry updated successfully');
          await fetchLeaderboard();
          setIsEditLeaderboardModalOpen(false);
          setEditingLeaderboardEntry(null);
        } else {
          throw new Error(data.message || 'Failed to update leaderboard entry');
        }
      }
    } catch (error) {
      // Error:Error updating leaderboard entry:', error);
      toast.error('Failed to update leaderboard entry');
    }
  };

  // Delete leaderboard entry
  const deleteLeaderboardEntry = async (entryId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/leaderboard/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Delete API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Leaderboard entry deleted successfully');
        await fetchLeaderboard();
      }
    } catch (error) {
      // Error:Error deleting leaderboard entry:', error);
      toast.error('Failed to delete leaderboard entry');
    }
  };

  // Mentorship plan handlers
  const handleCreateMentorshipPlan = async () => {
    try {
      // Validate required fields
      if (!mentorshipPlanFormData.name || !mentorshipPlanFormData.price || !mentorshipPlanFormData.metadata.mentorName) {
        toast.error('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const planData = {
        ...mentorshipPlanFormData,
        price: parseFloat(mentorshipPlanFormData.price),
        maxSubscribers: mentorshipPlanFormData.maxSubscribers ? parseInt(mentorshipPlanFormData.maxSubscribers) : null,
        features: mentorshipPlanFormData.features.filter(f => f.trim() !== ''),
        metadata: {
          ...mentorshipPlanFormData.metadata,
          courseDuration: mentorshipPlanFormData.metadata.courseDuration,
          maxSessionsPerMonth: parseInt(mentorshipPlanFormData.metadata.maxSessionsPerMonth.toString()),
          successRate: parseInt(mentorshipPlanFormData.metadata.successRate.toString())
        }
      };

      const response = await authenticatedApiCall('/mentorship-plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Mentorship plan created successfully!');
        setIsCreateMentorshipPlanModalOpen(false);
        setMentorshipPlanFormData({
          name: '',
          description: '',
          price: '',
          duration: 'monthly',
          pricingType: 'monthly',
          features: [''],
          isPopular: false,
          maxSubscribers: '',
          metadata: {
            sessionFrequency: 'Weekly',
            courseDuration: '7 days',
            maxSessionsPerMonth: 4,
            mentorExperience: '5+ years',
            specialization: ['forex'],
            successRate: 75,
            languages: ['English'],
            mentorName: '',
            mentorBio: ''
          }
        });
        fetchMentorshipPlans();
      } else {
        toast.error(data.message || 'Failed to create mentorship plan');
        if (data.validationErrors) {
          data.validationErrors.forEach((error: string) => {
            toast.error(error);
          });
        }
      }
    } catch (error) {
      // Error:Error creating mentorship plan:', error);
      toast.error('Failed to create mentorship plan');
    }
  };

  const handleUpdateMentorshipPlan = async () => {
    if (!editingMentorshipPlan) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const planData = {
        ...mentorshipPlanFormData,
        price: parseFloat(mentorshipPlanFormData.price),
        maxSubscribers: mentorshipPlanFormData.maxSubscribers ? parseInt(mentorshipPlanFormData.maxSubscribers) : null,
        features: mentorshipPlanFormData.features.filter(f => f.trim() !== ''),
        metadata: {
          ...mentorshipPlanFormData.metadata,
          courseDuration: mentorshipPlanFormData.metadata.courseDuration,
          maxSessionsPerMonth: parseInt(mentorshipPlanFormData.metadata.maxSessionsPerMonth.toString()),
          successRate: parseInt(mentorshipPlanFormData.metadata.successRate.toString())
        }
      };

      const response = await authenticatedApiCall(`/mentorship-plans/${editingMentorshipPlan._id}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Mentorship plan updated successfully!');
        setIsEditMentorshipPlanModalOpen(false);
        setEditingMentorshipPlan(null);
        setMentorshipPlanFormData({
          name: '',
          description: '',
          price: '',
          duration: 'monthly',
          pricingType: 'monthly',
          features: [''],
          isPopular: false,
          maxSubscribers: '',
          metadata: {
            sessionFrequency: 'Weekly',
            courseDuration: '7 days',
            maxSessionsPerMonth: 4,
            mentorExperience: '5+ years',
            specialization: ['forex'],
            successRate: 75,
            languages: ['English'],
            mentorName: '',
            mentorBio: ''
          }
        });
        fetchMentorshipPlans();
      } else {
        toast.error(data.message || 'Failed to update mentorship plan');
        if (data.validationErrors) {
          data.validationErrors.forEach((error: string) => {
            toast.error(error);
          });
        }
      }
    } catch (error) {
      // Error:Error updating mentorship plan:', error);
      toast.error('Failed to update mentorship plan');
    }
  };

  const handleDeleteMentorshipPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this mentorship plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authenticatedApiCall(`/mentorship-plans/${planId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Mentorship plan deleted successfully!');
        fetchMentorshipPlans();
      } else {
        toast.error(data.message || 'Failed to delete mentorship plan');
      }
    } catch (error) {
      // Error:Error deleting mentorship plan:', error);
      toast.error('Failed to delete mentorship plan');
    }
  };

  // Fetch mentorship plans data
  const fetchMentorshipPlans = async () => {
    try {
      setMentorshipPlansLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/mentorship-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Mentorship Plans API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setMentorshipPlans(data.data);
      } else {
        // Error:Invalid mentorship plans data format:', data);
        setMentorshipPlans([]);
      }
    } catch (error) {
      // Error:Error fetching mentorship plans:', error);
      toast.error('Failed to load mentorship plans');
    } finally {
      setMentorshipPlansLoading(false);
    }
  };

  // Fetch mentorship subscriptions for management
  const fetchMentorshipSubscriptions = async () => {
    try {
      setMentorshipSubscriptionsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/mentorship-plans/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Mentorship Subscriptions API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setMentorshipSubscriptions(data.data);
      } else {
        // Error:Invalid mentorship subscriptions data format:', data);
        setMentorshipSubscriptions([]);
      }
    } catch (error) {
      // Error:Error fetching mentorship subscriptions:', error);
      toast.error('Failed to load mentorship subscriptions');
    } finally {
      setMentorshipSubscriptionsLoading(false);
    }
  };

  // Chat functions for mentorship management
  const handleOpenMentorshipChat = async (subscription: any) => {
    setSelectedMentorshipSubscription(subscription);
    setIsMentorshipChatModalOpen(true);
    if (subscription.mentorshipPlan?._id) {
      await fetchMentorshipChatMessages(subscription.mentorshipPlan._id);
    }
  };

  const handleCloseMentorshipChat = () => {
    setIsMentorshipChatModalOpen(false);
    setSelectedMentorshipSubscription(null);
    setMentorshipChatMessages([]);
  };

  const fetchMentorshipChatMessages = async (planId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/mentorship-chat/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMentorshipChatMessages(data.data || []);
      }
    } catch (error) {
      // Error:Error fetching chat messages:', error);
    }
  };

  const sendMentorshipChatMessage = async () => {
    if (!newMentorshipChatMessage.trim() || sendingMentorshipChatMessage || !selectedMentorshipSubscription) return;

    setSendingMentorshipChatMessage(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/mentorship-chat/${selectedMentorshipSubscription.mentorshipPlan?._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMentorshipChatMessage.trim(),
          senderType: 'admin'
        })
      });

      if (response.ok) {
        setNewMentorshipChatMessage('');
        await fetchMentorshipChatMessages(selectedMentorshipSubscription.mentorshipPlan?._id);
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      // Error:Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMentorshipChatMessage(false);
    }
  };

  // Session scheduling functions
  const handleOpenSessionSchedule = (subscription: any) => {
    setSelectedMentorshipSubscription(subscription);
    setIsSessionScheduleModalOpen(true);
    // Reset form data
    setSessionScheduleData({
      date: '',
      time: '',
      timezone: 'UTC',
      duration: 60,
      topic: '',
      notes: ''
    });
  };

  const handleCloseSessionSchedule = () => {
    setIsSessionScheduleModalOpen(false);
    setSelectedMentorshipSubscription(null);
    setSessionScheduleData({
      date: '',
      time: '',
      timezone: 'UTC',
      duration: 60,
      topic: '',
      notes: ''
    });
  };

  const handleScheduleSession = async () => {
    if (!sessionScheduleData.date || !sessionScheduleData.time || !selectedMentorshipSubscription) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSchedulingSession(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Combine date and time
      const sessionDateTime = new Date(`${sessionScheduleData.date}T${sessionScheduleData.time}`);
      
      const response = await fetch(`${API_URL}/mentorship-plans/${selectedMentorshipSubscription.mentorshipPlan?._id}/schedule-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: selectedMentorshipSubscription._id,
          sessionDate: sessionDateTime.toISOString(),
          timezone: sessionScheduleData.timezone,
          duration: sessionScheduleData.duration,
          topic: sessionScheduleData.topic,
          notes: sessionScheduleData.notes
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success('Session scheduled successfully!');
        
        // Update the local state to reflect the changes immediately
        if (responseData.data && responseData.data.session) {
          const newSession = responseData.data.session;
          setSelectedMentorshipSubscription(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              sessionHistory: [...prev.sessionHistory, newSession]
            };
          });
        }
        
        handleCloseSessionSchedule();
        // Refresh subscriptions to show updated session data
        fetchMentorshipSubscriptions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to schedule session');
      }
    } catch (error) {
      // Error:Error scheduling session:', error);
      toast.error('Failed to schedule session');
    } finally {
      setSchedulingSession(false);
    }
  };

  // Handle opening sessions modal
  const handleOpenSessionsModal = (subscription: any) => {
    setSelectedMentorshipSubscription(subscription);
    setIsSessionsModalOpen(true);
  };

  // Handle closing sessions modal
  const handleCloseSessionsModal = () => {
    setIsSessionsModalOpen(false);
    setSelectedMentorshipSubscription(null);
  };

  // Handle opening edit session modal
  const handleOpenEditSession = (session: any) => {
    setEditingSession(session);
    setEditSessionData({
      date: new Date(session.date).toISOString().split('T')[0],
      time: new Date(session.date).toTimeString().slice(0, 5),
      timezone: session.timezone || 'UTC',
      duration: session.duration,
      topic: session.topic || '',
      notes: session.notes || ''
    });
    setIsEditSessionModalOpen(true);
  };

  // Handle closing edit session modal
  const handleCloseEditSession = () => {
    setIsEditSessionModalOpen(false);
    setEditingSession(null);
    setEditSessionData({
      date: '',
      time: '',
      timezone: 'UTC',
      duration: 60,
      topic: '',
      notes: ''
    });
  };

  // Handle updating session
  const handleUpdateSession = async () => {
    if (!editingSession || !selectedMentorshipSubscription) return;

    try {
      setUpdatingSession(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const sessionDateTime = new Date(`${editSessionData.date}T${editSessionData.time}`);
      
      const response = await fetch(`${API_URL}/mentorship-plans/${selectedMentorshipSubscription._id}/sessions/${editingSession._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionDate: sessionDateTime.toISOString(),
          timezone: editSessionData.timezone,
          duration: editSessionData.duration,
          topic: editSessionData.topic,
          notes: editSessionData.notes
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success('Session updated successfully!');
        
        // Update the local state to reflect the changes immediately
        if (responseData.data && responseData.data.session) {
          const updatedSession = responseData.data.session;
          setSelectedMentorshipSubscription(prev => {
            if (!prev) return prev;
            const updatedSessionHistory = prev.sessionHistory.map(session => 
              session._id === editingSession._id ? updatedSession : session
            );
            return {
              ...prev,
              sessionHistory: updatedSessionHistory
            };
          });
        }
        
        handleCloseEditSession();
        fetchMentorshipSubscriptions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update session');
      }
    } catch (error) {
      // Error:Error updating session:', error);
      toast.error('Failed to update session');
    } finally {
      setUpdatingSession(false);
    }
  };

  // Handle deleting session
  const handleDeleteSession = async (session: any) => {
    if (!selectedMentorshipSubscription) return;

    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      setDeletingSession(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/mentorship-plans/${selectedMentorshipSubscription._id}/sessions/${session._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Session deleted successfully!');
        
        // Update the local state to reflect the changes immediately
        setSelectedMentorshipSubscription(prev => {
          if (!prev) return prev;
          const updatedSessionHistory = prev.sessionHistory.filter(s => s._id !== session._id);
          return {
            ...prev,
            sessionHistory: updatedSessionHistory
          };
        });
        
        fetchMentorshipSubscriptions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete session');
      }
    } catch (error) {
      // Error:Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
      setDeletingSession(false);
    }
  };

  // Fetch YouTube videos data
  const fetchYouTubeVideos = async () => {
    try {
      setYoutubeVideosLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/youtube-videos/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`YouTube Videos API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setYoutubeVideos(data.data);
      }
    } catch (error) {
      // Error:Error fetching YouTube videos:', error);
      toast.error('Failed to load YouTube videos');
    } finally {
      setYoutubeVideosLoading(false);
    }
  };

  // Fetch footer settings data
  const fetchFooterSettings = async () => {
    try {
      setFooterSettingsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/footer-settings/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Footer Settings API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFooterSettings(data.data);
        setFooterSettingsFormData(data.data);
      }
    } catch (error) {
      // Error:Error fetching footer settings:', error);
      toast.error('Failed to load footer settings');
    } finally {
      setFooterSettingsLoading(false);
    }
  };

  // Update footer settings
  const handleUpdateFooterSettings = async () => {
    try {
      if (!footerSettings) {
        toast.error('No footer settings found');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/footer-settings/${footerSettings._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(footerSettingsFormData)
      });

      if (!response.ok) {
        throw new Error(`Footer Settings update error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFooterSettings(data.data);
        setIsFooterSettingsModalOpen(false);
        toast.success('Footer settings updated successfully');
      }
    } catch (error) {
      // Error:Error updating footer settings:', error);
      toast.error('Failed to update footer settings');
    }
  };

  // Fetch visitor statistics
  const fetchVisitorStats = async () => {
    try {
      setVisitorStatsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/visitors/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Visitor stats API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setVisitorStats(data.data);
      }
    } catch (error) {
      // Error:Error fetching visitor stats:', error);
      toast.error('Failed to load visitor statistics');
    } finally {
      setVisitorStatsLoading(false);
    }
  };

  // Send notification
  const sendNotification = async (formData: any) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const payload = {
        ...formData,
        ...(formData.targetAudience === 'specific_signal_plan' && {
          signalPlanId: formData.selectedSignalPlan
        }),
        ...(formData.targetAudience === 'specific_competition' && {
          competitionId: formData.selectedCompetition
        })
      };

      const response = await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Send notification API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Notification sent successfully!');
        fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      // Error:Error sending notification:', error);
      toast.error('Failed to send notification');
      throw error; // Re-throw so the component can handle it
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Delete notification API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Notification deleted successfully!');
        fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      // Error:Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        
      // Fetch challenges data
      const challengesResponse = await authenticatedApiCall('/challenges');
        
        
        if (!challengesResponse.ok) {
          const errorText = await challengesResponse.text();
          // Error:Challenges API error:', errorText);
          throw new Error(`Challenges API error: ${challengesResponse.status}`);
        }
        const challengesData = await challengesResponse.json();
        
        // Fetch users data
        const usersResponse = await authenticatedApiCall('/users');
        
        
        if (!usersResponse.ok) {
          const errorText = await usersResponse.text();
          // Error:Users API error:', errorText);
          throw new Error(`Users API error: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        
        if (challengesData.success && usersData.success) {
          const activeCompetitions = challengesData.data.filter((challenge: any) => challenge.status === 'active').length;
          const lifetimeCompetitions = challengesData.data.length;
          const totalUsers = usersData.data.length;
          
          
          setDashboardStats({
            activeCompetitions,
            totalUsers,
            lifetimeCompetitions
          });
        }
      } catch (error) {
        // Error:Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    if (user?.role === 'admin' && activeMenu === 'dashboard') {
      fetchDashboardStats();
    }
  }, [user, activeMenu]); // Refetch when switching to dashboard

  // Fetch challenges when challenges menu is active
  useEffect(() => {
    if (activeMenu === 'challenges') {
      fetchChallenges();
    }
  }, [activeMenu]);

  // Fetch YouTube videos when YouTube videos menu is active
  useEffect(() => {
    if (activeMenu === 'youtube-videos') {
      fetchYouTubeVideos();
    }
  }, [activeMenu]);

  // Fetch footer settings when footer settings menu is active
  useEffect(() => {
    if (activeMenu === 'footer-settings') {
      fetchFooterSettings();
    }
  }, [activeMenu]);

  // Fetch notifications when notifications menu is active
  useEffect(() => {
    if (activeMenu === 'notifications') {
      fetchNotifications();
      fetchSignalPlans(); // Also fetch signal plans for the dropdown
      fetchCompetitions(); // Also fetch competitions for the dropdown
    }
  }, [activeMenu]);

  // Fetch users when users menu is active
  useEffect(() => {
    if (activeMenu === 'users') {
      fetchUsers();
    }
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'signal-plans') {
      fetchSignalPlans();
    }
    if (activeMenu === 'mentorships') {
      fetchMentorshipPlans();
    }
    if (activeMenu === 'manage-mentorships') {
      fetchMentorshipSubscriptions();
    }
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'prop-firm-packages') {
      fetchPropFirmPackages();
    }
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'prop-firm-services') {
      fetchPropFirmServices();
    }
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'support') {
      fetchSupportTickets();
      fetchSupportStats();
    }
  }, [activeMenu, supportFilters]);

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchVisitorStats();
    }
  }, [activeMenu]);

  // Fetch leaderboard when leaderboard menu is active
  useEffect(() => {
    if (activeMenu === 'leaderboard') {
      fetchCompetitions();
      fetchLeaderboard();
    }
  }, [activeMenu]);

  // Fetch leaderboard when competition selection changes
  useEffect(() => {
    if (activeMenu === 'leaderboard' && selectedCompetition) {
      fetchLeaderboard();
      fetchCompetitionParticipants(selectedCompetition);
    }
  }, [selectedCompetition]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Signal Plan form handlers
  const handleSignalPlanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSignalPlanFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignalPlanSelectChange = (name: string, value: string) => {
    setSignalPlanFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignalPlanCheckboxChange = (name: string, checked: boolean) => {
    setSignalPlanFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addSignalPlanFeature = () => {
    setSignalPlanFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeSignalPlanFeature = (index: number) => {
    setSignalPlanFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateSignalPlanFeature = (index: number, value: string) => {
    setSignalPlanFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const toggleSignalType = (type: string) => {
    setSignalPlanFormData(prev => ({
      ...prev,
      signalTypes: prev.signalTypes.includes(type)
        ? prev.signalTypes.filter(t => t !== type)
        : [...prev.signalTypes, type]
    }));
  };

  // Create signal plan
  const handleCreateSignalPlan = async () => {
    try {
      // Validate required fields
      if (!signalPlanFormData.name || !signalPlanFormData.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (signalPlanFormData.features.filter(f => f.trim()).length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const planData = {
        name: signalPlanFormData.name,
        description: signalPlanFormData.description || undefined,
        originalPrice: signalPlanFormData.originalPrice ? parseFloat(signalPlanFormData.originalPrice) : undefined,
        price: parseFloat(signalPlanFormData.price),
        duration: signalPlanFormData.duration,
        features: signalPlanFormData.features.filter(f => f.trim()),
        isPopular: signalPlanFormData.isPopular,
        maxSubscribers: signalPlanFormData.maxSubscribers ? parseInt(signalPlanFormData.maxSubscribers) : null,
        metadata: {
          signalFrequency: signalPlanFormData.signalFrequency,
          signalTypes: signalPlanFormData.signalTypes,
          riskLevel: signalPlanFormData.riskLevel,
          successRate: signalPlanFormData.successRate
        }
      };

      const response = await authenticatedApiCall('/signal-plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal plan created successfully!');
        setIsCreateSignalPlanModalOpen(false);
        // Reset form
        setSignalPlanFormData({
          name: '',
          description: '',
          originalPrice: '',
          price: '',
          duration: 'monthly',
          pricingType: 'monthly',
          features: [''],
          isPopular: false,
          maxSubscribers: '',
          signalFrequency: 'Daily',
          signalTypes: ['forex'],
          riskLevel: 'medium',
          successRate: 75
        });
        // Refresh signal plans list
        fetchSignalPlans();
      } else {
        // Handle validation errors
        if (data.error && data.error.includes('validation failed')) {
          toast.error('Please check your input: ' + (data.message || 'Validation failed'));
        } else {
          toast.error(data.message || 'Failed to create signal plan');
        }
      }
    } catch (error) {
      // Error:Error creating signal plan:', error);
      toast.error('Failed to create signal plan');
    }
  };

  // Update signal plan
  const handleUpdateSignalPlan = async () => {
    try {
      if (!editingSignalPlan) return;

      // Validate required fields
      if (!signalPlanFormData.name || !signalPlanFormData.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (signalPlanFormData.features.filter(f => f.trim()).length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const planData = {
        name: signalPlanFormData.name,
        description: signalPlanFormData.description || undefined,
        originalPrice: signalPlanFormData.originalPrice ? parseFloat(signalPlanFormData.originalPrice) : undefined,
        price: parseFloat(signalPlanFormData.price),
        duration: signalPlanFormData.duration,
        features: signalPlanFormData.features.filter(f => f.trim()),
        isPopular: signalPlanFormData.isPopular,
        maxSubscribers: signalPlanFormData.maxSubscribers ? parseInt(signalPlanFormData.maxSubscribers) : null,
        metadata: {
          signalFrequency: signalPlanFormData.signalFrequency,
          signalTypes: signalPlanFormData.signalTypes,
          riskLevel: signalPlanFormData.riskLevel,
          successRate: signalPlanFormData.successRate
        }
      };

      const response = await authenticatedApiCall(`/signal-plans/${editingSignalPlan._id}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal plan updated successfully!');
        setIsEditSignalPlanModalOpen(false);
        setEditingSignalPlan(null);
        // Reset form
        setSignalPlanFormData({
          name: '',
          description: '',
          originalPrice: '',
          price: '',
          duration: 'monthly',
          pricingType: 'monthly',
          features: [''],
          isPopular: false,
          maxSubscribers: '',
          signalFrequency: 'Daily',
          signalTypes: ['forex'],
          riskLevel: 'medium',
          successRate: 75
        });
        // Refresh signal plans list
        fetchSignalPlans();
      } else {
        // Handle validation errors
        if (data.error && data.error.includes('validation failed')) {
          toast.error('Please check your input: ' + (data.message || 'Validation failed'));
        } else {
          toast.error(data.message || 'Failed to update signal plan');
        }
      }
    } catch (error) {
      // Error:Error updating signal plan:', error);
      toast.error('Failed to update signal plan');
    }
  };

  // Delete signal plan
  const handleDeleteSignalPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this signal plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authenticatedApiCall(`/signal-plans/${planId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal plan deleted successfully!');
        // Refresh signal plans list
        fetchSignalPlans();
      } else {
        toast.error(data.message || 'Failed to delete signal plan');
      }
    } catch (error) {
      // Error:Error deleting signal plan:', error);
      toast.error('Failed to delete signal plan');
    }
  };

  // Edit signal plan
  const handleEditSignalPlan = (plan: any) => {
    setEditingSignalPlan(plan);
    setSignalPlanFormData({
      name: plan.name,
      description: plan.description || '',
      originalPrice: plan.originalPrice ? plan.originalPrice.toString() : '',
      price: plan.price.toString(),
      duration: plan.duration,
      pricingType: plan.pricingType || 'monthly',
      features: plan.features.length > 0 ? plan.features : [''],
      isPopular: plan.isPopular,
      maxSubscribers: plan.maxSubscribers ? plan.maxSubscribers.toString() : '',
      signalFrequency: plan.metadata?.signalFrequency || 'Daily',
      signalTypes: plan.metadata?.signalTypes || ['forex'],
      riskLevel: plan.metadata?.riskLevel || 'medium',
      successRate: plan.metadata?.successRate || 75
    });
    setIsEditSignalPlanModalOpen(true);
  };

  // YouTube Video Functions
  const handleCreateYouTubeVideo = async () => {
    try {
      // Validate required fields
      if (!youtubeVideoFormData.title || !youtubeVideoFormData.url) {
        toast.error('Please fill in title and URL');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/youtube-videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(youtubeVideoFormData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('YouTube video added successfully!');
        setYoutubeVideoFormData({
          title: '',
          url: '',
          thumbnail: '',
          description: '',
          isActive: true
        });
        setIsCreateYouTubeVideoModalOpen(false);
        // Refresh YouTube videos list
        fetchYouTubeVideos();
      } else {
        toast.error(data.message || 'Failed to add YouTube video');
      }
    } catch (error) {
      // Error:Error creating YouTube video:', error);
      toast.error('Failed to add YouTube video');
    }
  };

  const handleEditYouTubeVideo = (video: any) => {
    setEditingYouTubeVideo(video);
    setYoutubeVideoFormData({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail || '',
      description: video.description || '',
      isActive: video.isActive
    });
    setIsEditYouTubeVideoModalOpen(true);
  };

  const handleUpdateYouTubeVideo = async () => {
    try {
      if (!editingYouTubeVideo) return;

      // Validate required fields
      if (!youtubeVideoFormData.title || !youtubeVideoFormData.url) {
        toast.error('Please fill in title and URL');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/youtube-videos/${editingYouTubeVideo._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(youtubeVideoFormData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('YouTube video updated successfully!');
        setYoutubeVideoFormData({
          title: '',
          url: '',
          thumbnail: '',
          description: '',
          isActive: true
        });
        setIsEditYouTubeVideoModalOpen(false);
        setEditingYouTubeVideo(null);
        // Refresh YouTube videos list
        fetchYouTubeVideos();
      } else {
        toast.error(data.message || 'Failed to update YouTube video');
      }
    } catch (error) {
      // Error:Error updating YouTube video:', error);
      toast.error('Failed to update YouTube video');
    }
  };

  const handleDeleteYouTubeVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this YouTube video? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/youtube-videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('YouTube video deleted successfully!');
        // Refresh YouTube videos list
        fetchYouTubeVideos();
      } else {
        toast.error(data.message || 'Failed to delete YouTube video');
      }
    } catch (error) {
      // Error:Error deleting YouTube video:', error);
      toast.error('Failed to delete YouTube video');
    }
  };

  const handleToggleYouTubeVideoStatus = async (videoId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/youtube-videos/${videoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('YouTube video status updated successfully!');
        // Refresh YouTube videos list
        fetchYouTubeVideos();
      } else {
        toast.error(data.message || 'Failed to update YouTube video status');
      }
    } catch (error) {
      // Error:Error toggling YouTube video status:', error);
      toast.error('Failed to update YouTube video status');
    }
  };

  // Prop Firm Package Functions
  const fetchPropFirmPackages = async () => {
    try {
      setPropFirmPackagesLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/prop-firm-packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPropFirmPackages(data.data || []);
      } else {
        throw new Error('Failed to fetch prop firm packages');
      }
    } catch (error) {
      // Error:Error fetching prop firm packages:', error);
      toast.error('Failed to load prop firm packages');
    } finally {
      setPropFirmPackagesLoading(false);
    }
  };

  const handleCreatePropFirmPackage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Validate required fields
      if (!propFirmPackageFormData.name || !propFirmPackageFormData.serviceFee) {
        toast.error('Please fill in all required fields (Name, Service Fee)');
        return;
      }

      // Validate service fee is a valid number
      const serviceFee = parseFloat(propFirmPackageFormData.serviceFee);
      if (isNaN(serviceFee) || serviceFee < 0) {
        toast.error('Service fee must be a valid positive number');
        return;
      }

      // Validate requirements
      if (!propFirmPackageFormData.requirements.minAccountSize || 
          !propFirmPackageFormData.requirements.maxDrawdown || 
          !propFirmPackageFormData.requirements.profitTarget) {
        toast.error('Please fill in all requirement fields (Min Account Size, Max Drawdown, Profit Target)');
        return;
      }

      // Validate that we have at least one feature and one supported prop firm
      const validFeatures = propFirmPackageFormData.features.filter(f => f.trim() !== '');
      const validPropFirms = propFirmPackageFormData.requirements.supportedPropFirms.filter(f => f.trim() !== '');
      
      if (validFeatures.length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      if (validPropFirms.length === 0) {
        toast.error('Please add at least one supported prop firm');
        return;
      }

      const response = await fetch(`${API_URL}/prop-firm-packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: propFirmPackageFormData.name,
          description: propFirmPackageFormData.description,
          serviceFee: serviceFee,
          pricingType: propFirmPackageFormData.pricingType,
          features: validFeatures,
          requirements: {
            minAccountSize: parseFloat(propFirmPackageFormData.requirements.minAccountSize),
            supportedPropFirms: validPropFirms,
            recommendedPropFirms: propFirmPackageFormData.requirements.recommendedPropFirms.filter(f => f.name.trim() !== ''),
            maxDrawdown: parseFloat(propFirmPackageFormData.requirements.maxDrawdown),
            profitTarget: parseFloat(propFirmPackageFormData.requirements.profitTarget),
            minTradingDays: parseFloat(propFirmPackageFormData.requirements.minTradingDays) || 0
          },
          isPopular: propFirmPackageFormData.isPopular,
          maxClients: propFirmPackageFormData.maxClients ? parseInt(propFirmPackageFormData.maxClients) : null,
          successRate: propFirmPackageFormData.successRate,
          coversAllPhaseFees: propFirmPackageFormData.coversAllPhaseFees
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Prop firm package created successfully!');
        setIsCreatePropFirmPackageModalOpen(false);
        // Reset form
        setPropFirmPackageFormData({
          name: '',
          description: '',
          serviceFee: '',
          pricingType: 'monthly',
          features: [''],
          requirements: {
            minAccountSize: '',
            supportedPropFirms: [''],
            recommendedPropFirms: [{
              name: '',
              priority: 'medium' as 'high' | 'medium' | 'low',
              isRecommended: true,
              description: ''
            }],
            maxDrawdown: '',
            profitTarget: '',
            minTradingDays: ''
          },
          isPopular: false,
          maxClients: '',
          successRate: 0,
          coversAllPhaseFees: false
        });
        // Refresh packages list
        fetchPropFirmPackages();
      } else {
        if (data.validationErrors && data.validationErrors.length > 0) {
          toast.error(`Validation failed: ${data.validationErrors.join(', ')}`);
        } else {
          toast.error(data.message || 'Failed to create prop firm package');
        }
      }
    } catch (error) {
      // Error:Error creating prop firm package:', error);
      toast.error('Failed to create prop firm package');
    }
  };

  const handleDeletePropFirmPackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this prop firm package? This will also cancel all associated services and cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/prop-firm-packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Prop firm package deleted successfully!');
        // Refresh packages list
        fetchPropFirmPackages();
      } else {
        toast.error(data.message || 'Failed to delete prop firm package');
      }
    } catch (error) {
      // Error:Error deleting prop firm package:', error);
      toast.error('Failed to delete prop firm package');
    }
  };

  const handleEditPropFirmPackage = (pkg: any) => {
    setEditingPropFirmPackage(pkg);
    setPropFirmPackageFormData({
      name: pkg.name,
      description: pkg.description || '',
      serviceFee: pkg.serviceFee ? pkg.serviceFee.toString() : '',
      pricingType: pkg.pricingType,
      features: pkg.features.length > 0 ? pkg.features : [''],
      requirements: {
        minAccountSize: pkg.requirements.minAccountSize.toString(),
        supportedPropFirms: pkg.requirements.supportedPropFirms.length > 0 ? pkg.requirements.supportedPropFirms : [''],
        recommendedPropFirms: pkg.requirements.recommendedPropFirms && pkg.requirements.recommendedPropFirms.length > 0 
          ? pkg.requirements.recommendedPropFirms 
          : [{
              name: '',
              priority: 'medium' as 'high' | 'medium' | 'low',
              isRecommended: true,
              description: ''
            }],
        maxDrawdown: pkg.requirements.maxDrawdown.toString(),
        profitTarget: pkg.requirements.profitTarget.toString(),
        minTradingDays: pkg.requirements.minTradingDays.toString()
      },
      isPopular: pkg.isPopular,
      maxClients: pkg.maxClients ? pkg.maxClients.toString() : '',
      successRate: pkg.successRate,
      coversAllPhaseFees: pkg.coversAllPhaseFees
    });
    setIsEditPropFirmPackageModalOpen(true);
  };

  const handleUpdatePropFirmPackage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (!editingPropFirmPackage) {
        toast.error('No package selected for editing');
        return;
      }

      // Validate required fields
      if (!propFirmPackageFormData.name || !propFirmPackageFormData.description || !propFirmPackageFormData.serviceFee) {
        toast.error('Please fill in all required fields (Name, Description, Service Fee)');
        return;
      }

      // Validate service fee is a valid number
      const serviceFee = parseFloat(propFirmPackageFormData.serviceFee);
      if (isNaN(serviceFee) || serviceFee < 0) {
        toast.error('Service fee must be a valid positive number');
        return;
      }

      // Validate requirements
      if (!propFirmPackageFormData.requirements.minAccountSize || 
          !propFirmPackageFormData.requirements.maxDrawdown || 
          !propFirmPackageFormData.requirements.profitTarget) {
        toast.error('Please fill in all requirement fields (Min Account Size, Max Drawdown, Profit Target)');
        return;
      }

      // Validate that we have at least one feature and one supported prop firm
      const validFeatures = propFirmPackageFormData.features.filter(f => f.trim() !== '');
      const validPropFirms = propFirmPackageFormData.requirements.supportedPropFirms.filter(f => f.trim() !== '');
      
      if (validFeatures.length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      if (validPropFirms.length === 0) {
        toast.error('Please add at least one supported prop firm');
        return;
      }

      const response = await fetch(`${API_URL}/prop-firm-packages/${editingPropFirmPackage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: propFirmPackageFormData.name,
          description: propFirmPackageFormData.description,
          serviceFee: serviceFee,
          pricingType: propFirmPackageFormData.pricingType,
          features: validFeatures,
          requirements: {
            minAccountSize: parseFloat(propFirmPackageFormData.requirements.minAccountSize),
            supportedPropFirms: validPropFirms,
            recommendedPropFirms: propFirmPackageFormData.requirements.recommendedPropFirms.filter(f => f.name.trim() !== ''),
            maxDrawdown: parseFloat(propFirmPackageFormData.requirements.maxDrawdown),
            profitTarget: parseFloat(propFirmPackageFormData.requirements.profitTarget),
            minTradingDays: parseFloat(propFirmPackageFormData.requirements.minTradingDays) || 0
          },
          isPopular: propFirmPackageFormData.isPopular,
          maxClients: propFirmPackageFormData.maxClients ? parseInt(propFirmPackageFormData.maxClients) : null,
          successRate: propFirmPackageFormData.successRate,
          coversAllPhaseFees: propFirmPackageFormData.coversAllPhaseFees
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Prop firm package updated successfully!');
        setIsEditPropFirmPackageModalOpen(false);
        setEditingPropFirmPackage(null);
        // Refresh packages list
        fetchPropFirmPackages();
      } else {
        if (data.validationErrors && data.validationErrors.length > 0) {
          toast.error(`Validation failed: ${data.validationErrors.join(', ')}`);
        } else {
          toast.error(data.message || 'Failed to update prop firm package');
        }
      }
    } catch (error) {
      // Error:Error updating prop firm package:', error);
      toast.error('Failed to update prop firm package');
    }
  };

  // Prop Firm Services Functions
  const fetchPropFirmServices = async () => {
    try {
      setPropFirmServicesLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/prop-firm-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      if (response.ok) {
        const data = await response.json();
        const services = data.data?.services || [];
        setPropFirmServices(services);
        
        if (services.length === 0) {
        }
      } else {
        const errorData = await response.json();
        // Error:Prop Firm Services API Error:', errorData);
        if (response.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else if (response.status === 401) {
          toast.error('Authentication required.');
        } else {
          toast.error('Failed to fetch prop firm services');
        }
      }
    } catch (error) {
      // Error:Error fetching prop firm services:', error);
      toast.error('Failed to load prop firm services');
    } finally {
      setPropFirmServicesLoading(false);
    }
  };

  // Support Management Functions
  const fetchSupportTickets = async () => {
    try {
      setSupportLoading(true);
      const queryParams = new URLSearchParams();
      if (supportFilters.status !== 'all') queryParams.append('status', supportFilters.status);
      if (supportFilters.priority !== 'all') queryParams.append('priority', supportFilters.priority);
      if (supportFilters.category !== 'all') queryParams.append('category', supportFilters.category);
      if (supportFilters.assignedTo !== 'all') queryParams.append('assignedTo', supportFilters.assignedTo);

      const response = await authenticatedApiCall(`/support?${queryParams.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setSupportTickets(data.data.tickets);
      } else {
        toast.error('Failed to fetch support tickets');
      }
    } catch (error) {
      // Error:Error fetching support tickets:', error);
      toast.error('Failed to fetch support tickets');
    } finally {
      setSupportLoading(false);
    }
  };

  const fetchSupportStats = async () => {
    try {
      const response = await authenticatedApiCall('/support/stats/overview');

      if (response.ok) {
        const data = await response.json();
        setSupportStats(data.data);
      }
    } catch (error) {
      // Error:Error fetching support stats:', error);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await authenticatedApiCall(`/support/${ticketId}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.data);
      } else {
        toast.error('Failed to fetch ticket details');
      }
    } catch (error) {
      // Error:Error fetching ticket details:', error);
      toast.error('Failed to fetch ticket details');
    }
  };

  const sendSupportMessage = async () => {
    if (!supportMessage.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const response = await authenticatedApiCall(`/support/${selectedTicket._id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: supportMessage })
      });

      if (response.ok) {
        setSupportMessage('');
        await fetchTicketDetails(selectedTicket._id);
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      // Error:Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await authenticatedApiCall(`/support/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchSupportTickets();
        if (selectedTicket?._id === ticketId) {
          await fetchTicketDetails(ticketId);
        }
        toast.success('Ticket status updated successfully');
      } else {
        toast.error('Failed to update ticket status');
      }
    } catch (error) {
      // Error:Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const deleteSupportTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this support ticket? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authenticatedApiCall(`/support/${ticketId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSupportTickets();
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(null);
        }
        toast.success('Support ticket deleted successfully');
      } else {
        toast.error('Failed to delete support ticket');
      }
    } catch (error) {
      // Error:Error deleting support ticket:', error);
      toast.error('Failed to delete support ticket');
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear custom type when selecting a predefined type
    if (name === 'type' && value !== 'other') {
      setCustomType('');
    }
  };

  // Prize management functions
  const addPrize = () => {
    const newRank = prizes.length > 0 ? Math.max(...prizes.map(p => p.rank || 0)) + 1 : 1;
    const newPrize = { rank: newRank, prize: '', amount: 0, isBulk: false };
    const updatedPrizes = [...prizes, newPrize];
    setPrizes(updatedPrizes);
  };

  const addBulkPrize = () => {
    const newPrize = { rankStart: 1, rankEnd: 10, prize: '', amount: 0, isBulk: true };
    const updatedPrizes = [...prizes, newPrize];
    setPrizes(updatedPrizes);
  };

  const removePrize = (index: number) => {
    const updatedPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(updatedPrizes);
  };

  const updatePrize = (index: number, field: 'rank' | 'rankStart' | 'rankEnd' | 'prize' | 'amount' | 'isBulk', value: string | number | boolean) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setPrizes(updatedPrizes);
  };

  // Rules management functions
  const addRule = () => {
    const updatedRules = [...rules, ''];
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = value;
    setRules(updatedRules);
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  // User action handlers
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleCloseUserModals = () => {
    setIsViewUserModalOpen(false);
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  // Chat functions
  const handleOpenChat = async (service: any) => {
    setSelectedServiceForChat(service);
    setIsChatModalOpen(true);
    await fetchChatMessages(service._id);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedServiceForChat(null);
    setChatMessages([]);
    setNewChatMessage('');
  };

  const fetchChatMessages = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.data || []);
      }
    } catch (error) {
      // Error:Error fetching chat messages:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedServiceForChat || sendingChatMessage) return;

    try {
      setSendingChatMessage(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/prop-firm-services/${selectedServiceForChat._id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newChatMessage.trim()
        })
      });

      if (response.ok) {
        setNewChatMessage('');
        await fetchChatMessages(selectedServiceForChat._id);
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      // Error:Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingChatMessage(false);
    }
  };


  // Helper function to determine challenge status based on dates
  const getChallengeStatus = (startDate: string, endDate: string, status: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Use UTC dates for comparison to avoid timezone issues
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const startUTC = new Date(start.getTime() + (start.getTimezoneOffset() * 60000));
    const endUTC = new Date(end.getTime() + (end.getTimezoneOffset() * 60000));
    
    if (status === 'cancelled') return 'cancelled';
    if (nowUTC < startUTC) return 'upcoming';
    if (nowUTC >= startUTC && nowUTC <= endUTC) return 'active';
    if (nowUTC > endUTC) return 'completed';
    return status;
  };

  // Filter challenges based on status
  const getFilteredChallenges = () => {
    if (challengeStatusFilter === 'all') {
      // For "All", sort by status: upcoming first, then active, then completed
      // Create a new array instead of mutating the original
      return [...challenges].sort((a, b) => {
        const statusA = getChallengeStatus(a.startDate, a.endDate, a.status);
        const statusB = getChallengeStatus(b.startDate, b.endDate, b.status);
        
        // Define order: upcoming (0), active (1), completed (2)
        const statusOrder = { 'upcoming': 0, 'active': 1, 'completed': 2 };
        const orderA = statusOrder[statusA] ?? 3;
        const orderB = statusOrder[statusB] ?? 3;
        
        return orderA - orderB;
      });
    }
    return challenges.filter(challenge => {
      const status = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
      return status === challengeStatusFilter;
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-purple-500';
    }
  };

  // Date picker helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Handle both ISO date strings and YYYY-MM-DD format
      let date: Date;
      
      if (dateString.includes('T')) {
        // ISO date string from backend
        date = new Date(dateString);
      } else {
        // YYYY-MM-DD format from form - use UTC to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(Date.UTC(year, month - 1, day));
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format in UTC to avoid timezone issues
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      // Error:Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date) => {
    // Create date string in UTC to maintain consistency
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    setFormData(prev => ({
      ...prev,
      [field]: dateString
    }));
    if (field === 'startDate') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  // Close date pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.date-picker-container')) {
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
      }
    };

    if (showStartDatePicker || showEndDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStartDatePicker, showEndDatePicker]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use custom type if "other" is selected and custom type is provided
    const challengeType = formData.type === 'other' && customType ? customType : formData.type;
    
    if (!formData.name || !challengeType || !formData.accountSize || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.type === 'other' && !customType) {
      toast.error('Please enter a custom challenge type');
      return;
    }

    // For target-based challenges, validate target profit and max drawdown
    if (challengeMode === 'target' && (!formData.targetProfit || !formData.maxDrawdown)) {
      toast.error('Please provide target profit and max drawdown for target-based challenges');
      return;
    }

    setLoading(true);
    
    const requestBody = {
      name: formData.name,
      type: challengeType,
      accountSize: parseFloat(formData.accountSize),
      price: parseFloat(formData.price) || 0,
      description: formData.description,
      startDate: `${formData.startDate}T${formData.startTime}:00Z`, // Combine date and time in UTC
      endDate: `${formData.endDate}T${formData.endTime}:00Z`, // Combine date and time in UTC
      maxParticipants: parseInt(formData.maxParticipants),
      status: (() => {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00Z`); // UTC datetime
        const now = new Date();
        return startDateTime > now ? 'upcoming' : 'active';
      })(), // Set status based on start datetime
      challengeMode: challengeMode,
      requirements: {
        ...(challengeMode === 'target' && {
          targetProfit: parseFloat(formData.targetProfit),
          maxDrawdown: parseFloat(formData.maxDrawdown)
        }),
        minBalance: 0
      },
      prizes: prizes.filter(prize => prize.amount > 0).map(prize => ({
        ...prize,
        prize: prize.prize.trim() || (prize.isBulk ? `Ranks ${prize.rankStart}-${prize.rankEnd} Prize` : `Rank ${prize.rank} Prize`)
      })),
      rules: rules.filter(rule => rule.trim() !== '')
    };
    
    
    try {
      const response = await authenticatedApiCall('/challenges', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Challenge created successfully!');
        setFormData({
          name: '',
          type: '',
          accountSize: '',
          price: '',
          description: '',
          startDate: '',
          startTime: '09:00',
          endDate: '',
          endTime: '17:00',
          maxParticipants: '100',
          targetProfit: '10',
          maxDrawdown: '10'
        });
        setPrizes([]);
        setIsCreateModalOpen(false);
        // Refresh challenges list
        fetchChallenges();
      } else {
        toast.error(data.message || 'Failed to create challenge');
      }
    } catch (error) {
      // Error:Error creating challenge:', error);
      toast.error('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit challenge
  const handleEditChallenge = (challenge: any) => {
    setEditingChallenge(challenge);
    
    // Populate form with challenge data
    const startDateTime = new Date(challenge.startDate);
    const endDateTime = new Date(challenge.endDate);
    
    const formDataToSet = {
      name: challenge.name,
      type: challenge.type,
      accountSize: challenge.accountSize.toString(),
      price: challenge.price.toString(),
      description: challenge.description,
      startDate: challenge.startDate.split('T')[0], // Convert ISO to YYYY-MM-DD
      startTime: startDateTime.toTimeString().slice(0, 5), // Extract HH:MM from datetime
      endDate: challenge.endDate.split('T')[0],
      endTime: endDateTime.toTimeString().slice(0, 5), // Extract HH:MM from datetime
      maxParticipants: challenge.maxParticipants.toString(),
      targetProfit: challenge.requirements?.targetProfit?.toString() || '10',
      maxDrawdown: challenge.requirements?.maxDrawdown?.toString() || '10'
    };
    
    setFormData(formDataToSet);
    
    setChallengeMode(challenge.challengeMode || 'target');
    setPrizes(challenge.prizes || []);
    setRules(challenge.rules || []);
    setIsEditModalOpen(true);
  };

  // Handle update challenge
  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingChallenge) return;
    
    // Use custom type if "other" is selected and custom type is provided
    const challengeType = formData.type === 'other' && customType ? customType : formData.type;
    
    if (!formData.name || !challengeType || !formData.accountSize || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.type === 'other' && !customType) {
      toast.error('Please enter a custom challenge type');
      return;
    }

    // For target-based challenges, validate target profit and max drawdown
    if (challengeMode === 'target' && (!formData.targetProfit || !formData.maxDrawdown)) {
      toast.error('Please provide target profit and max drawdown for target-based challenges');
      return;
    }

    setLoading(true);
    
    
    const updateRequestBody = {
      name: formData.name,
      type: challengeType,
      accountSize: parseFloat(formData.accountSize),
      price: parseFloat(formData.price) || 0,
      description: formData.description,
      startDate: `${formData.startDate}T${formData.startTime}:00Z`, // Combine date and time in UTC
      endDate: `${formData.endDate}T${formData.endTime}:00Z`, // Combine date and time in UTC
      maxParticipants: parseInt(formData.maxParticipants),
      status: (() => {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00Z`); // UTC datetime
        const now = new Date();
        return startDateTime > now ? 'upcoming' : 'active';
      })(), // Set status based on start datetime
      challengeMode: challengeMode,
      requirements: {
        ...(challengeMode === 'target' && {
          targetProfit: parseFloat(formData.targetProfit),
          maxDrawdown: parseFloat(formData.maxDrawdown)
        }),
        minBalance: 0
      },
      prizes: prizes.filter(prize => prize.amount > 0).map(prize => ({
        ...prize,
        prize: prize.prize.trim() || (prize.isBulk ? `Ranks ${prize.rankStart}-${prize.rankEnd} Prize` : `Rank ${prize.rank} Prize`)
      })),
      rules: rules.filter(rule => rule.trim() !== '')
    };
    
    
    
    try {
      const response = await authenticatedApiCall(`/challenges/${editingChallenge._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateRequestBody)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Challenge updated successfully!');
        setIsEditModalOpen(false);
        setEditingChallenge(null);
        setPrizes([]);
        setRules([]);
        // Refresh challenges list
        // Small delay to ensure database changes are committed
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchChallenges();
        // Force a small re-render to ensure UI updates
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      } else {
        toast.error(data.message || 'Failed to update challenge');
      }
    } catch (error) {
      // Error:Error updating challenge:', error);
      toast.error('Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete challenge
  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    try {
      let response = await authenticatedApiCall(`/challenges/${challengeId}`, {
        method: 'DELETE'
      });

      let data = await response.json();
      
      if (data.success) {
        toast.success('Challenge deleted successfully!');
        // Refresh challenges list
        fetchChallenges();
      } else {
        // If backend blocks due to participants, offer force delete
        const reason = (data.message || '').toLowerCase();
        if (reason.includes('participants')) {
          const confirmForce = window.confirm('This challenge has participants. Do you want to force delete it? This will remove the challenge and related stats recalculations will run.');
          if (!confirmForce) return;

          response = await authenticatedApiCall(`/challenges/${challengeId}?force=true`, {
            method: 'DELETE'
          });

          data = await response.json();
          if (data.success) {
            toast.success('Challenge force-deleted successfully!');
            fetchChallenges();
          } else {
            toast.error(data.message || 'Failed to delete challenge');
          }
        } else {
          toast.error(data.message || 'Failed to delete challenge');
        }
      }
    } catch (error) {
      // Error:Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render if user is not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
              <p className="text-gray-300">Overview of your trading platform</p>
            </div>
            
            {/* Platform Statistics */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Platform Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <Trophy className="h-8 w-8 md:h-12 md:w-12 text-yellow-400 mx-auto mb-3 md:mb-4" />
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{dashboardStats.activeCompetitions}</h3>
                        <p className="text-gray-300 text-sm md:text-base">Active Competitions</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <Users className="h-8 w-8 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{dashboardStats.totalUsers}</h3>
                        <p className="text-gray-300 text-sm md:text-base">Total Users</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <Clock className="h-8 w-8 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{dashboardStats.lifetimeCompetitions}</h3>
                        <p className="text-gray-300 text-sm md:text-base">Lifetime Competitions</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Visitor Analytics */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Visitor Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <Globe className="h-8 w-8 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
                    {visitorStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                          {visitorStats?.totalVisitors || 0}
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base">Total Visitors</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <UserPlus className="h-8 w-8 md:h-12 md:w-12 text-indigo-400 mx-auto mb-3 md:mb-4" />
                    {visitorStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                          {visitorStats?.uniqueVisitors || 0}
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base">Unique Visitors</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-emerald-400 mx-auto mb-3 md:mb-4" />
                    {visitorStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                          {visitorStats?.conversionRate || 0}%
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base">Conversion Rate</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-4 md:p-6 text-center">
                    <Shield className="h-8 w-8 md:h-12 md:w-12 text-cyan-400 mx-auto mb-3 md:mb-4" />
                    {visitorStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 md:h-8 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                          {visitorStats?.totalSessions || 0}
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base">Active Sessions</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Device Analytics */}
            {visitorStats?.deviceStats && visitorStats.deviceStats.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Device Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {visitorStats.deviceStats.map((device: any, index: number) => (
                    <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10">
                      <CardContent className="p-4 md:p-6 text-center">
                        {device._id === 'desktop' && <Monitor className="h-8 w-8 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />}
                        {device._id === 'mobile' && <Smartphone className="h-8 w-8 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />}
                        {device._id === 'tablet' && <Tablet className="h-8 w-8 md:h-12 md:w-12 text-orange-400 mx-auto mb-3 md:mb-4" />}
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                          {device.count}
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base capitalize">
                          {device._id} Users
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'challenges':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Challenges Management</h2>
                <p className="text-gray-300">Manage your trading challenges</p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-3"
              >
                Add New
              </Button>
            </div>
            
            {/* Challenge Status Filter Dropdown */}
            <div className="mb-6">
              <Select value={challengeStatusFilter} onValueChange={setChallengeStatusFilter}>
                <SelectTrigger className="w-full md:w-64 bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <SelectValue placeholder="Filter challenges..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      All Challenges
                    </div>
                  </SelectItem>
                  <SelectItem value="upcoming" className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      Upcoming
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled" className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Challenge Content */}
            <div className="mt-6">
                {challengesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className={getGlassCardClasses()}>
                        <CardContent className="p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-600 rounded mb-4"></div>
                            <div className="h-3 bg-gray-600 rounded mb-2"></div>
                            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : getFilteredChallenges().length === 0 ? (
                  <Card className={getGlassCardClasses()}>
                    <CardContent className="p-12 text-center">
                      <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        {challengeStatusFilter === 'all' ? 'No Challenges Yet' : `No ${challengeStatusFilter.charAt(0).toUpperCase() + challengeStatusFilter.slice(1)} Challenges`}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {challengeStatusFilter === 'all' 
                          ? 'Create your first trading challenge to get started'
                          : `No challenges found with ${challengeStatusFilter} status`
                        }
                      </p>
                      {challengeStatusFilter === 'all' && (
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          Create First
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredChallenges().map((challenge) => {
                      const status = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
                      return (
                        <Card key={challenge._id} className={`${getGlassCardClasses('hover:bg-white/10 transition-all duration-300')}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">{challenge.name}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(status)}/20 text-${getStatusBadgeColor(status).split('-')[1]}-400`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                    {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white hover:bg-white/10"
                                  onClick={() => handleEditChallenge(challenge)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleDeleteChallenge(challenge._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Account Size:</span>
                                <span className="text-white font-semibold">${challenge.accountSize.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Entry Price:</span>
                                <span className="text-white font-semibold">
                                  {challenge.price === 0 ? 'Free' : `$${challenge.price}`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Participants:</span>
                                <span className="text-white font-semibold">
                                  {challenge.currentParticipants}/{challenge.maxParticipants}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Duration:</span>
                                <span className="text-white font-semibold">
                                  {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Leaderboard Management</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage and track trading leaderboard</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={triggerMT5Update}
                  disabled={mt5UpdateLoading}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                >
                  {mt5UpdateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Update MT5 Data</span>
                      <span className="sm:hidden">Update</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={syncLeaderboard}
                  disabled={syncLeaderboardLoading}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                >
                  {syncLeaderboardLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Syncing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Sync Leaderboard</span>
                      <span className="sm:hidden">Sync</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Help Section */}
            <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">How to Use This System</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      • <strong>Select a competition</strong> to view its leaderboard and participants<br/>
                      • <strong>Update MT5 Data</strong> to sync live trading data<br/>
                      • <strong>Manage participants</strong> by clicking "Manage" to update balances, profits, and status<br/>
                      • <strong>Default balance</strong> is set to competition account size<br/>
                      • <strong>Profit starts at $0</strong> for new participants
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competition Filter */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="text-white font-semibold text-sm sm:text-base">Filter by Competition:</Label>
                  <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                    <SelectTrigger className="w-full sm:w-64 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select competition" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions.map((competition) => (
                        <SelectItem key={competition._id} value={competition._id}>
                          {competition.name} ({competition.currentParticipants}/{competition.maxParticipants})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mx-auto mb-1 sm:mb-2" />
                  <h3 className="text-lg sm:text-2xl font-bold text-white">{leaderboard.length}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Total Entries</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-3 sm:p-4 text-center">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-1 sm:mb-2" />
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    {leaderboard.length > 0 ? leaderboard[0]?.profitPercent?.toFixed(2) + '%' : '0%'}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Top Performance</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-3 sm:p-4 text-center">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-1 sm:mb-2" />
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    ${leaderboard.length > 0 ? leaderboard[0]?.balance?.toLocaleString() : '0'}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Highest Balance</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-1 sm:mb-2" />
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    {leaderboard.filter(entry => entry.profit > 0).length}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Profitable Traders</p>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Table */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                  Trading Leaderboard
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Real-time trading performance rankings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {leaderboardLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-600 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry._id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg gap-3 ${
                          index < 3 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-purple-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold text-sm sm:text-base truncate">
                              {entry.firstName} {entry.lastName}
                            </div>
                            <div className="text-gray-400 text-xs sm:text-sm truncate">@{entry.username}</div>
                            <div className="text-gray-500 text-xs truncate">Account: {entry.accountId}</div>
                            {entry.mt5Account && (
                              <div className="text-gray-500 text-xs truncate">
                                MT5: {entry.mt5Account.id} ({entry.mt5Account.server || 'No Server'})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 sm:mt-0">
                          <div className="flex items-center gap-2 sm:gap-6">
                            <div className="text-right">
                              <div className="text-white font-semibold text-sm sm:text-base">
                                ${entry.balance?.toLocaleString()}
                              </div>
                              <div className="text-gray-400 text-xs sm:text-sm">Balance</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold text-sm sm:text-base ${
                                entry.profit >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ${entry.profit?.toLocaleString()}
                              </div>
                              <div className="text-gray-400 text-xs sm:text-sm">Profit</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className={`font-semibold ${
                                entry.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {entry.profitPercent?.toFixed(2)}%
                              </div>
                              <div className="text-gray-400 text-sm">Performance</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={async () => {
                                // Add a temporary _id field for challenge-specific entries
                                
                                
                                // If participantId is missing, refresh the leaderboard data
                                if (!entry.participantId) {
                                  await fetchLeaderboard();
                                  // Wait a bit for the state to update
                                  setTimeout(() => {
                                    // Find the updated entry with participantId
                                    const updatedEntry = leaderboard.find(lb => lb.userId === entry.userId);
                                    if (updatedEntry && updatedEntry.participantId) {
                                      const entryWithId = {
                                        ...updatedEntry,
                                        _id: updatedEntry._id || 'undefined' // Don't use participantId as _id
                                      };
                                      setEditingLeaderboardEntry(entryWithId);
                                      setIsEditLeaderboardModalOpen(true);
                                    } else {
                                      const entryWithId = {
                                        ...entry,
                                        _id: entry._id || 'undefined' // Don't use participantId as _id
                                      };
                                      setEditingLeaderboardEntry(entryWithId);
                                      setIsEditLeaderboardModalOpen(true);
                                    }
                                  }, 100);
                                } else {
                                  const entryWithId = {
                                    ...entry,
                                    _id: entry._id || 'undefined' // Don't use participantId as _id
                                  };
                                  setEditingLeaderboardEntry(entryWithId);
                                  setIsEditLeaderboardModalOpen(true);
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20 p-1 sm:p-2"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this leaderboard entry?')) {
                                  deleteLeaderboardEntry(entry._id);
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 p-1 sm:p-2"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No leaderboard entries found</p>
                    <Button
                      onClick={triggerMT5Update}
                      className="bg-gradient-to-r from-gray-600 to-gray-800"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Update MT5 Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Participants Management */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Competition Participants
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage participants for the selected competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCompetition && competitions.length > 0 ? (
                  (() => {
                    const competition = competitions.find(c => c._id === selectedCompetition);
                    return competition ? (
                      <div className="border border-white/10 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{competition.name}</h4>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              {competition.currentParticipants}/{competition.maxParticipants} participants • 
                              ${competition.accountSize.toLocaleString()} account size
                            </p>
                          </div>
                          <Badge className={`${
                            competition.status === 'active' ? 'bg-green-500' : 
                            competition.status === 'upcoming' ? 'bg-yellow-500' : 
                            'bg-gray-500'
                          } text-white text-xs sm:text-sm self-start sm:self-center`}>
                            {competition.status}
                          </Badge>
                        </div>
                        
                        {/* Search Participants */}
                        {competition.participants && competition.participants.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                              <div className="flex-1 w-full">
                                <Label htmlFor="participant-search" className="text-white text-sm font-medium mb-2 block">
                                  Search Participants
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="participant-search"
                                    type="text"
                                    placeholder="Search by name, email, username, or MT5 account..."
                                    value={participantSearchTerm}
                                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20 pl-10"
                                  />
                                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                              {participantSearchTerm && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setParticipantSearchTerm('')}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                            {participantSearchTerm && (
                              <p className="text-gray-400 text-sm mt-2">
                                Found {competition.participants.filter(participant => {
                                  const searchLower = participantSearchTerm.toLowerCase();
                                  const fullName = `${participant.user?.firstName || ''} ${participant.user?.lastName || ''}`.toLowerCase();
                                  const email = participant.user?.email?.toLowerCase() || '';
                                  const username = participant.user?.username?.toLowerCase() || '';
                                  const accountId = participant.mt5Account?.id?.toLowerCase() || '';
                                  
                                  return fullName.includes(searchLower) || 
                                         email.includes(searchLower) || 
                                         username.includes(searchLower) ||
                                         accountId.includes(searchLower);
                                }).length} participant{competition.participants.filter(participant => {
                                  const searchLower = participantSearchTerm.toLowerCase();
                                  const fullName = `${participant.user?.firstName || ''} ${participant.user?.lastName || ''}`.toLowerCase();
                                  const email = participant.user?.email?.toLowerCase() || '';
                                  const username = participant.user?.username?.toLowerCase() || '';
                                  const accountId = participant.mt5Account?.id?.toLowerCase() || '';
                                  
                                  return fullName.includes(searchLower) || 
                                         email.includes(searchLower) || 
                                         username.includes(searchLower) ||
                                         accountId.includes(searchLower);
                                }).length !== 1 ? 's' : ''} matching "{participantSearchTerm}"
                              </p>
                            )}
                          </div>
                        )}
                        
                        {competition.participants && competition.participants.length > 0 ? (
                          (() => {
                            const filteredCompetitionParticipants = competition.participants.filter(participant => {
                              if (!participantSearchTerm) return true;
                              
                              const searchLower = participantSearchTerm.toLowerCase();
                              const fullName = `${participant.user?.firstName || ''} ${participant.user?.lastName || ''}`.toLowerCase();
                              const email = participant.user?.email?.toLowerCase() || '';
                              const username = participant.user?.username?.toLowerCase() || '';
                              const accountId = participant.mt5Account?.id?.toLowerCase() || '';
                              
                              return fullName.includes(searchLower) || 
                                     email.includes(searchLower) || 
                                     username.includes(searchLower) ||
                                     accountId.includes(searchLower);
                            });

                            return filteredCompetitionParticipants.length > 0 ? (
                              <div className="space-y-2">
                                {filteredCompetitionParticipants.map((participant) => (
                              <div
                                key={participant._id}
                                className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/10 gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                    {participant.user?.firstName?.charAt(0) || 'U'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-white font-medium text-sm truncate">
                                      {participant.user?.firstName} {participant.user?.lastName}
                                    </div>
                                    <div className="text-gray-400 text-xs truncate">@{participant.user?.username}</div>
                                    {participant.mt5Account?.id && (
                                      <div className="text-gray-500 text-xs truncate">
                                        MT5: {participant.mt5Account.id} ({participant.mt5Account.server || 'No Server'})
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  {/* Financial Info - Stack on mobile, side by side on desktop */}
                                  <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="text-right">
                                      <div className="text-white font-semibold text-xs sm:text-sm">
                                        ${participant.currentBalance?.toLocaleString() || competition.accountSize?.toLocaleString() || '0'}
                                      </div>
                                      <div className="text-gray-400 text-xs">Balance</div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`font-semibold text-xs sm:text-sm ${
                                        (participant.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        ${participant.profit?.toLocaleString() || '0'}
                                      </div>
                                      <div className="text-gray-400 text-xs">Profit</div>
                                    </div>
                                  </div>
                                  
                                  {/* Status and Actions - Stack on mobile, side by side on desktop */}
                                  <div className="flex items-center justify-between sm:justify-end gap-2">
                                    <Badge className={`text-xs ${
                                      participant.status === 'active' ? 'bg-green-500' :
                                      participant.status === 'pending_setup' ? 'bg-yellow-500' :
                                      participant.status === 'completed' ? 'bg-blue-500' :
                                      'bg-red-500'
                                    } text-white flex-shrink-0`}>
                                      {participant.status}
                                    </Badge>
                                    <Button
                                      onClick={() => {
                                        setSelectedUser({
                                          ...participant,
                                          competitionId: competition._id,
                                          competitionName: competition.name,
                                          // Set better defaults
                                          currentBalance: participant.currentBalance || competition.accountSize,
                                          profit: participant.profit || 0,
                                          profitPercent: participant.profitPercent || 0,
                                          status: participant.status || 'pending_setup',
                                          mt5Account: participant.mt5Account || { id: '', server: '', password: '' }
                                        });
                                        setIsUserManagementModalOpen(true);
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/60 hover:text-purple-200 transition-all duration-200 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md flex-shrink-0"
                                    >
                                      <Edit className="h-3 w-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Manage</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <h3 className="text-white font-semibold mb-2">No Participants Found</h3>
                                <p className="text-gray-400 text-sm">
                                  {participantSearchTerm 
                                    ? `No participants match your search for "${participantSearchTerm}"`
                                    : 'No participants found for this competition.'
                                  }
                                </p>
                                {participantSearchTerm && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setParticipantSearchTerm('')}
                                    className="mt-3 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                  >
                                    Clear Search
                                  </Button>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center py-4">
                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No participants yet</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">Selected competition not found</p>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Please select a competition to view participants</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competition Participants Management - Removed since participants are now shown above */}
            {false && selectedCompetition !== 'all' && competitionParticipants.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Competition Participants
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage participants for selected competition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitionParticipants.map((participant) => (
                      <div
                        key={participant._id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                            {participant.user?.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              {participant.user?.firstName} {participant.user?.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">@{participant.user?.username}</div>
                            <div className="text-gray-500 text-xs">
                              Status: <span className={`${
                                participant.status === 'active' ? 'text-green-400' :
                                participant.status === 'pending_setup' ? 'text-yellow-400' :
                                participant.status === 'completed' ? 'text-blue-400' :
                                'text-red-400'
                              }`}>{participant.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              ${participant.currentBalance?.toLocaleString() || '0'}
                            </div>
                            <div className="text-gray-400 text-sm">Current Balance</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              (participant.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${participant.profit?.toLocaleString() || '0'}
                            </div>
                            <div className="text-gray-400 text-sm">Profit</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const competition = competitions.find(c => c._id === selectedCompetition);
                                setSelectedUser({
                                  ...participant,
                                  competitionId: competition?._id,
                                  competitionName: competition?.name,
                                  currentBalance: participant.currentBalance || competition?.accountSize,
                                  profit: participant.profit || 0,
                                  profitPercent: participant.profitPercent || 0,
                                  status: participant.status || 'pending_setup',
                                  mt5Account: participant.mt5Account || { id: '', server: '', password: '' }
                                });
                                setIsUserManagementModalOpen(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'signal-plans':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Signal Plans Management</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage signal plan subscriptions and pricing</p>
              </div>
              <Button
                onClick={() => {
                  setSignalPlanFormData({
                    name: '',
                    description: '',
                    originalPrice: '',
                    price: '',
                    duration: 'monthly',
                    pricingType: 'monthly',
                    features: [''],
                    isPopular: false,
                    maxSubscribers: '',
                    signalFrequency: 'Daily',
                    signalTypes: ['forex'],
                    riskLevel: 'Medium',
                    successRate: 0
                  });
                  setIsCreateSignalPlanModalOpen(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create New Plan</span>
                <span className="sm:hidden">New Plan</span>
              </Button>
            </div>
            
            {/* Signal Plans Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <Rocket className="h-8 w-8 md:h-12 md:w-12 text-orange-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {signalPlans.length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Total Plans</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <Users className="h-8 w-8 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {signalPlans.reduce((total, plan) => total + plan.currentSubscribers, 0)}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Total Subscribers</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {signalPlans.filter(plan => plan.isActive).length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Active Plans</p>
                </CardContent>
              </Card>
            </div>

            {/* Signal Plans List */}
            {signalPlansLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : signalPlans.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Signal Plans Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first signal plan to start offering trading signals to users.
                  </p>
                  <Button
                    onClick={() => setIsCreateSignalPlanModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Signal Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signalPlans.map((plan) => (
                  <Card key={plan._id} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg md:text-xl">
                          {plan.name}
                        </CardTitle>
                        {plan.isPopular && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-300 text-sm md:text-base">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 md:p-6 pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-semibold">
                            ${plan.price} / {plan.duration}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Subscribers:</span>
                          <span className="text-white font-semibold">
                            {plan.currentSubscribers}
                            {plan.maxSubscribers && ` / ${plan.maxSubscribers}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge className={plan.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Success Rate:</span>
                          <span className="text-white font-semibold">
                            {plan.metadata?.successRate || 75}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleEditSignalPlan(plan)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteSignalPlan(plan._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'mentorships':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mentorship Plans Management</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage mentorship programs and subscriptions</p>
              </div>
              <Button
                onClick={() => {
                  setMentorshipPlanFormData({
                    name: '',
                    description: '',
                    price: '',
                    duration: 'monthly',
          pricingType: 'monthly',
                    features: [''],
                    isPopular: false,
                    maxSubscribers: '',
                    metadata: {
                      sessionFrequency: 'Weekly',
                      courseDuration: '7 days',
                      maxSessionsPerMonth: 4,
                      mentorExperience: '5+ years',
                      specialization: ['forex'],
                      successRate: 75,
                      languages: ['English'],
                      mentorName: '',
                      mentorBio: ''
                    }
                  });
                  setIsCreateMentorshipPlanModalOpen(true);
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create New Plan</span>
                <span className="sm:hidden">New Plan</span>
              </Button>
            </div>
            
            {/* Mentorship Plans Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <UserIcon className="h-8 w-8 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {mentorshipPlans.length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Total Plans</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <Users className="h-8 w-8 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {mentorshipPlans.reduce((total, plan) => total + (plan.currentSubscribers || 0), 0)}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Total Students</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {mentorshipPlans.filter(plan => plan.isActive === true).length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Active Plans</p>
                </CardContent>
              </Card>
            </div>

            {/* Mentorship Plans List */}
            {mentorshipPlansLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : mentorshipPlans.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Mentorship Plans Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first mentorship plan to start offering personalized trading guidance to users.
                  </p>
                  <Button
                    onClick={() => setIsCreateMentorshipPlanModalOpen(true)}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mentorship Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentorshipPlans.map((plan) => (
                  <Card key={plan._id} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg md:text-xl">
                          {plan.name}
                        </CardTitle>
                        {plan.isPopular && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-300 text-sm">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 md:p-6 pt-0">
                      {/* Plan Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-white/5 rounded">
                          <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
                          <p className="text-white text-sm font-medium">${plan.price || 0}</p>
                          <p className="text-gray-400 text-xs">Price</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                          <p className="text-white text-sm font-medium">{plan.currentSubscribers || 0}</p>
                          <p className="text-gray-400 text-xs">Students</p>
                        </div>
                      </div>

                      {/* Mentor Info */}
                      <div className="mb-4 p-2 bg-white/5 rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <UserIcon className="h-4 w-4 text-purple-400" />
                          <span className="text-white text-sm font-medium">{plan.metadata?.mentorName || 'N/A'}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{plan.metadata?.mentorExperience || 'N/A'}</p>
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2 text-sm">Features</h4>
                        <ul className="space-y-1">
                          {(plan.features || []).slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-xs">{feature}</span>
                            </li>
                          ))}
                          {(plan.features || []).length > 3 && (
                            <li className="text-gray-400 text-xs">
                              +{(plan.features || []).length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setEditingMentorshipPlan(plan);
                            setMentorshipPlanFormData({
                              name: plan.name || '',
                              description: plan.description || '',
                              price: plan.price ? plan.price.toString() : '',
                              duration: plan.duration || 'monthly',
                              pricingType: plan.pricingType || 'monthly',
                              features: (plan.features && plan.features.length > 0) ? plan.features : [''],
                              isPopular: plan.isPopular || false,
                              maxSubscribers: plan.maxSubscribers ? plan.maxSubscribers.toString() : '',
                              metadata: plan.metadata || {
                                sessionFrequency: 'Weekly',
                                courseDuration: '7 days',
                                maxSessionsPerMonth: 4,
                                mentorExperience: '5+ years',
                                specialization: ['forex'],
                                successRate: 75,
                                languages: ['English'],
                                mentorName: '',
                                mentorBio: ''
                              }
                            });
                            setIsEditMentorshipPlanModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteMentorshipPlan(plan._id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'manage-mentorships':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Manage Mentorships</h2>
                <p className="text-gray-300">Manage active mentorship subscriptions and communicate with students</p>
              </div>
            </div>
            
            {/* Mentorship Subscriptions List */}
            {mentorshipSubscriptionsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : mentorshipSubscriptions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Subscriptions</h3>
                  <p className="text-gray-400 mb-6">
                    No users have subscribed to mentorship plans yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentorshipSubscriptions?.map((subscription) => (
                  <Card key={subscription._id} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">
                            {subscription.mentorshipPlan?.name || 'Unknown Plan'}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {subscription.user?.firstName || 'Unknown'} {subscription.user?.lastName || 'User'}
                          </CardDescription>
                        </div>
                        <Badge className={`${
                          subscription.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Mentor:</span>
                          <span className="text-white">{subscription.mentorshipPlan?.metadata?.mentorName || 'Unknown Mentor'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Course Duration:</span>
                          <span className="text-white">{subscription.mentorshipPlan?.metadata?.courseDuration || 'Unknown Duration'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subscribed:</span>
                          <span className="text-white">
                            {new Date(subscription.subscribedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-white">
                            {new Date(subscription.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* View Sessions Button */}
                      {subscription.sessionHistory && subscription.sessionHistory.length > 0 && (
                        <div className="mb-4">
                          <Button
                            onClick={() => handleOpenSessionsModal(subscription)}
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            View Sessions ({subscription.sessionHistory.filter(s => s.status === 'scheduled').length})
                          </Button>
                        </div>
                      )}

                      {/* Next Session */}
                      {subscription.nextSessionDate && (
                        <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Next Session</span>
                          </div>
                          <div className="text-white text-sm">
                            {new Date(subscription.nextSessionDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-300 text-xs">
                            {new Date(subscription.nextSessionDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {subscription.sessionHistory && subscription.sessionHistory.length > 0 && (
                              (() => {
                                const nextSession = subscription.sessionHistory
                                  .filter(session => session.status === 'scheduled')
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                                return nextSession && (
                                  <span className="text-gray-500 ml-1">({nextSession.timezone || 'UTC'})</span>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => handleOpenMentorshipChat(subscription)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                          onClick={() => handleOpenSessionSchedule(subscription)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'signal-manager':
        return <SignalManager />;

      case 'copytrade-plans':
        return <CopytradePlanManager />;

      case 'copytrade-subscriptions':
        return <CopytradeSubscriptionManager />;

      case 'youtube-videos':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">YouTube Videos Management</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage YouTube videos for the home page carousel</p>
              </div>
              <Button
                onClick={() => {
                  setYoutubeVideoFormData({
                    title: '',
                    url: '',
                    thumbnail: '',
                    description: '',
                    isActive: true
                  });
                  setIsCreateYouTubeVideoModalOpen(true);
                }}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Video</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
            
            {/* YouTube Videos Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <Play className="h-8 w-8 md:h-12 md:w-12 text-red-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {youtubeVideos.length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Total Videos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <CheckCircle className="h-8 w-8 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {youtubeVideos.filter(video => video.isActive).length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Active Videos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4 md:p-6 text-center">
                  <XCircle className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {youtubeVideos.filter(video => !video.isActive).length}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">Inactive Videos</p>
                </CardContent>
              </Card>
            </div>

            {/* YouTube Videos List */}
            {youtubeVideosLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : youtubeVideos.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No YouTube Videos Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Add your first YouTube video to display in the home page carousel.
                  </p>
                  <Button
                    onClick={() => setIsCreateYouTubeVideoModalOpen(true)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <Card key={video._id} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg md:text-xl line-clamp-2">
                          {video.title}
                        </CardTitle>
                        <Badge 
                          className={`${video.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs`}
                        >
                          {video.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-300 text-sm line-clamp-2">
                        {video.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 md:p-6 pt-0">
                      {/* Video Thumbnail Preview */}
                      <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={video.thumbnail || `https://img.youtube.com/vi/${video.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || ''}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-video.jpg';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-red-600 rounded-full p-2">
                            <Play className="h-4 w-4 text-white" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">URL:</span>
                          <span className="text-white font-mono text-xs truncate max-w-32">
                            {video.url}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Added:</span>
                          <span className="text-white">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleEditYouTubeVideo(video)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleToggleYouTubeVideoStatus(video._id)}
                        >
                          {video.isActive ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteYouTubeVideo(video._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'prop-firm-packages':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Prop Firm Packages</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage prop firm account management packages</p>
              </div>
              <Button
                onClick={() => {
                  // Reset form data when opening modal
                  setPropFirmPackageFormData({
                    name: '',
                    description: '',
                    serviceFee: '',
                    pricingType: 'monthly',
                    features: [''],
                    requirements: {
                      minAccountSize: '',
                      supportedPropFirms: [''],
                      recommendedPropFirms: [],
                      maxDrawdown: '',
                      profitTarget: '',
                      minTradingDays: ''
                    },
                    isPopular: false,
                    maxClients: '',
                    successRate: 0,
                    coversAllPhaseFees: false
                  });
                  setIsCreatePropFirmPackageModalOpen(true);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Package</span>
                <span className="sm:hidden">New Package</span>
              </Button>
            </div>
            
            {propFirmPackagesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-600 rounded mb-4"></div>
                        <div className="h-3 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : propFirmPackages.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Prop Firm Packages</h3>
                  <p className="text-gray-400 mb-6">Create your first prop firm management package</p>
                  <Button
                    onClick={() => {
                      // Reset form data when opening modal
                      setPropFirmPackageFormData({
                        name: '',
                        description: '',
                        serviceFee: '',
                        pricingType: 'monthly',
                        features: [''],
                        requirements: {
                          minAccountSize: '',
                          supportedPropFirms: [''],
                          recommendedPropFirms: [{
                            name: '',
                            priority: 'medium' as 'high' | 'medium' | 'low',
                            isRecommended: true,
                            description: ''
                          }],
                          maxDrawdown: '',
                          profitTarget: '',
                          minTradingDays: ''
                        },
                        isPopular: false,
                        maxClients: '',
                        successRate: 0,
                        coversAllPhaseFees: false
                      });
                      setIsCreatePropFirmPackageModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Package
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propFirmPackages.map((plan) => (
                  <Card key={plan._id} className="bg-white/5 backdrop-blur-md border-white/10 relative">
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-orange-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            {plan.pricingType}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-gray-300 text-sm">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Service Fee:</span>
                          <span className="text-white font-semibold">${plan.serviceFee}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Current Clients:</span>
                          <span className="text-white">{plan.currentClients || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Success Rate:</span>
                          <span className="text-green-400">{plan.successRate}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Status:</span>
                          <Badge 
                            variant="outline" 
                            className={plan.isActive ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}
                          >
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPropFirmPackage(plan)}
                          className="flex-1 border-white/20 text-foreground hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePropFirmPackage(plan._id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'prop-firm-services':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Prop Firm Services</h2>
                <p className="text-gray-300">Manage prop firm account management services</p>
              </div>
            </div>
            
            {propFirmServicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-600 rounded mb-4"></div>
                        <div className="h-3 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : propFirmServices.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Services Found</h3>
                  <p className="text-gray-400 mb-4">No prop firm services have been applied yet</p>
                  <p className="text-gray-500 text-sm">
                    Users can apply for prop firm services from the packages page. 
                    Once they submit applications, they will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propFirmServices.map((service) => (
                  <Card key={service._id} className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg">{service.package?.name || 'Unknown Package'}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            service.status === 'active' ? 'border-green-500/50 text-green-400' :
                            service.status === 'pending' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-red-500/50 text-red-400'
                          }
                        >
                          {service.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-300 text-sm">
                        {service.user?.firstName} {service.user?.lastName} • {service.user?.email}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-0">
                      {/* Essential Information Only */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Prop Firm:</span>
                          <span className="text-white text-sm">{service.propFirmDetails?.firmName || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Account ID:</span>
                          <span className="text-white text-sm font-mono">{service.propFirmDetails?.accountId || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Account Size:</span>
                          <span className="text-white text-sm">${service.propFirmDetails?.accountSize?.toLocaleString() || 'N/A'}</span>
                        </div>
                        
                        {service.metadata?.applicationData && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Risk Level:</span>
                              <span className="text-white text-sm capitalize">{service.metadata.applicationData.preferredRiskLevel || 'N/A'}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Emergency Contact:</span>
                              <span className="text-white text-sm">{service.metadata.applicationData.emergencyContact || 'N/A'}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => {
                            setSelectedPropFirmServiceId(service._id);
                            setIsPropFirmServiceDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => handleOpenChat(service)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'footer-settings':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Footer Settings</h2>
                <p className="text-gray-300 text-sm sm:text-base">Manage footer content, contact information, and social media links</p>
              </div>
              <Button
                onClick={() => setIsFooterSettingsModalOpen(true)}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Settings</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
            
            {footerSettingsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : footerSettings ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Layout className="h-5 w-5 mr-2 text-purple-400" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Company Name</Label>
                      <p className="text-white font-medium">{footerSettings.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <p className="text-gray-300 text-sm">{footerSettings.companyDescription}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <p className="text-white">{footerSettings.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Phone</Label>
                      <p className="text-white">{footerSettings.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Address</Label>
                      <p className="text-white">{footerSettings.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media & Newsletter */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-purple-400" />
                      Social Media & Newsletter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Newsletter Title</Label>
                      <p className="text-white font-medium">{footerSettings.newsletter.title}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Newsletter Description</Label>
                      <p className="text-gray-300 text-sm">{footerSettings.newsletter.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Facebook</Label>
                        <p className="text-white text-sm truncate">{footerSettings.socialMedia.facebook || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Twitter</Label>
                        <p className="text-white text-sm truncate">{footerSettings.socialMedia.twitter || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Instagram</Label>
                        <p className="text-white text-sm truncate">{footerSettings.socialMedia.instagram || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">LinkedIn</Label>
                        <p className="text-white text-sm truncate">{footerSettings.socialMedia.linkedin || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">YouTube</Label>
                        <p className="text-white text-sm truncate">{footerSettings.socialMedia.youtube || 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Links */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-400" />
                      Legal Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-300">Privacy Policy</Label>
                        <p className="text-white text-sm truncate">{footerSettings.legalLinks.privacyPolicy}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Terms of Service</Label>
                        <p className="text-white text-sm truncate">{footerSettings.legalLinks.termsOfService}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Cookie Policy</Label>
                        <p className="text-white text-sm truncate">{footerSettings.legalLinks.cookiePolicy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-12 text-center min-h-[400px] flex flex-col justify-center">
                  <Layout className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">No Footer Settings Found</h3>
                  <p className="text-gray-300 mb-6 text-lg">Footer settings will be created automatically when you first edit them.</p>
                  <div className="space-y-3 text-gray-400">
                    <p className="text-sm">You can manage:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-white/5 rounded-full">Company Information</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full">Contact Details</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full">Social Media Links</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full">Newsletter Settings</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full">Legal Links</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'support':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Support Management</h2>
                <p className="text-gray-300">Manage user support tickets and conversations</p>
              </div>
            </div>
            
            {/* Support Statistics */}
            {supportStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Tickets</p>
                        <p className="text-2xl font-bold text-white">{supportStats.total}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Open</p>
                        <p className="text-2xl font-bold text-white">{supportStats.open}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">In Progress</p>
                        <p className="text-2xl font-bold text-white">{supportStats.inProgress}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Resolved</p>
                        <p className="text-2xl font-bold text-white">{supportStats.resolved}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Support Tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tickets List */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-white text-lg sm:text-xl">Support Tickets</CardTitle>
                    
                    {/* Filters */}
                    <div className="space-y-3 mt-4">
                      <Select value={supportFilters.status} onValueChange={(value) => setSupportFilters({...supportFilters, status: value})}>
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
                      
                      <Select value={supportFilters.priority} onValueChange={(value) => setSupportFilters({...supportFilters, priority: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3">
                      {supportLoading ? (
                        <div className="text-center py-8">
                          <LoadingSpinner message="Loading tickets..." size="sm" />
                        </div>
                      ) : supportTickets.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No support tickets found</p>
                        </div>
                      ) : (
                        supportTickets.map((ticket) => (
                          <div
                            key={ticket._id}
                            onClick={() => fetchTicketDetails(ticket._id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTicket?._id === ticket._id
                                ? 'bg-orange-500/20 border border-orange-500/50'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-white font-medium text-sm line-clamp-1">
                                {ticket.subject}
                              </h3>
                              <div className="flex gap-1">
                                <Badge className={`${
                                  ticket.status === 'open' ? 'bg-blue-500' :
                                  ticket.status === 'in_progress' ? 'bg-yellow-500' :
                                  ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                                } text-white text-xs`}>
                                  {ticket.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                              {ticket.messages[0]?.message}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{ticket.user?.firstName && ticket.user?.lastName 
                                ? `${ticket.user.firstName} ${ticket.user.lastName}`
                                : ticket.user?.firstName || 'Unknown User'}</span>
                              <Badge className={`${
                                ticket.priority === 'urgent' ? 'bg-red-500' :
                                ticket.priority === 'high' ? 'bg-orange-500' :
                                ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              } text-white text-xs`}>
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
                              <Badge className={`${
                                selectedTicket.status === 'open' ? 'bg-blue-500' :
                                selectedTicket.status === 'in_progress' ? 'bg-yellow-500' :
                                selectedTicket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                              } text-white text-xs`}>
                                {selectedTicket.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={`${
                                selectedTicket.priority === 'urgent' ? 'bg-red-500' :
                                selectedTicket.priority === 'high' ? 'bg-orange-500' :
                                selectedTicket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              } text-white text-xs`}>
                                {selectedTicket.priority}
                              </Badge>
                              <Badge variant="outline" className="text-gray-400 border-gray-400 text-xs">
                                {selectedTicket.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Select value={selectedTicket.status} onValueChange={(value) => updateTicketStatus(selectedTicket._id, value)}>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSupportTicket(selectedTicket._id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* User Information */}
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
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
                              {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
                      <div className="space-y-4">
                        {selectedTicket.messages.map((message: any) => (
                          <div
                            key={message._id}
                            className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg break-words ${
                                message.senderType === 'admin'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="h-3 w-3 flex-shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {message.senderType === 'admin' ? 'Admin' : 
                                   message.sender?.firstName && message.sender?.lastName 
                                     ? `${message.sender.firstName} ${message.sender.lastName}`
                                     : message.sender?.firstName || 'User'}
                                </span>
                                <span className="text-xs opacity-70 flex-shrink-0">
                                  {new Date(message.timestamp).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
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
                          placeholder="Type your response..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400 resize-none min-h-[60px] sm:min-h-[80px]"
                          rows={2}
                        />
                        <Button
                          onClick={sendSupportMessage}
                          disabled={!supportMessage.trim() || sendingMessage}
                          className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                        >
                          <MessageSquare className="h-4 w-4" />
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
          </div>
        );
        
      case 'users':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
              <p className="text-gray-300">Manage platform users and their accounts</p>
            </div>
            
            {/* Search Users */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <Label htmlFor="user-search" className="text-white text-sm font-medium mb-2 block">
                      Search Users
                    </Label>
                    <div className="relative">
                      <Input
                        id="user-search"
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20 pl-10"
                      />
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {userSearchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserSearchTerm('')}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {userSearchTerm && (
                  <p className="text-gray-400 text-sm mt-2">
                    Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{userSearchTerm}"
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Users Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {users.filter(user => user.isActive !== false).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Admin Users</p>
                      <p className="text-2xl font-bold text-white">
                        {users.filter(user => user.role === 'admin').length}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {usersLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner message="Loading users..." size="sm" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      {userSearchTerm ? 'No Users Found' : 'No Users Found'}
                    </h3>
                    <p className="text-gray-400">
                      {userSearchTerm 
                        ? `No users match your search for "${userSearchTerm}"`
                        : 'No users have registered on the platform yet.'
                      }
                    </p>
                    {userSearchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserSearchTerm('')}
                        className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white/5 rounded-lg border border-white/10 gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold truncate">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email
                              }
                            </h3>
                            <p className="text-gray-400 text-sm truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  user.role === 'admin' 
                                    ? 'border-purple-400 text-purple-400' 
                                    : 'border-blue-400 text-blue-400'
                                }`}
                              >
                                {user.role || 'user'}
                              </Badge>
                              {user.isActive !== false && (
                                <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-2 flex-shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-gray-400 text-xs">Joined</p>
                            <p className="text-white text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-2"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Push Notifications</h2>
                <p className="text-gray-300">Create and send beautiful push notifications to your users</p>
              </div>
            </div>
            
            <PushNotificationSender
              onSendNotification={sendNotification}
              signalPlans={signalPlans}
              competitions={competitions}
              loading={loading}
            />
          </div>
        );
        
        
      case 'payment-verification':
        return <AdminPaymentVerification />;
        
      case 'crypto-wallets':
        return <AdminCryptoWallets />;
        
      case 'settings':
        return <SettingsPanel />;
        
      default:
        return null;
    }
  };

  return (
    <>
      <style>
        {`
          body {
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            min-height: 100vh;
          }
          html {
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            min-height: 100vh;
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black" style={{ minHeight: '100vh' }}>
      {/* Mobile Header */}
      <div className={`md:hidden border-b p-4 ${getGlassCardClasses()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-xs">Trading Platform Control</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <div className={`${getGlassCardClasses()} w-64 h-full p-4 overflow-y-auto`}>
            {/* Back to Home Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full mb-6 text-white hover:bg-white/10 justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            {/* Admin Panel Title */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Trading Platform Control</p>
            </div>
            
            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeMenu === item.id ? "default" : "ghost"}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full justify-start ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex h-screen md:h-[calc(100vh-80px)] p-4">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block w-64 rounded-xl p-2 ml-4 mt-4 h-fit min-h-[calc(100vh-120px)] ${getGlassCardClasses()}`}>
          {/* Back to Home Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full mb-3 text-white hover:bg-white/10 justify-start text-xs py-1.5"
          >
            <Home className="h-3 w-3 mr-1.5" />
            Back to Home
          </Button>
          
          {/* Admin Panel Title */}
          <div className="mb-4">
            <h1 className="text-base font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-xs">Trading Platform Control</p>
          </div>
          
          {/* Navigation Menu */}
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                  <Button
                    key={item.id}
                    variant={activeMenu === item.id ? "default" : "ghost"}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full justify-start text-xs py-1.5 ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="h-3 w-3 mr-1.5" />
                    {item.label}
                  </Button>
              );
            })}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className={`max-w-6xl mx-auto rounded-xl p-6 mr-0 mt-4 ${getGlassCardClasses()}`}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${getGlassCardClasses()} w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Challenge</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Challenge Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter challenge name"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-white">Challenge Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                      <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select challenge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swing">Swing Trading</SelectItem>
                        <SelectItem value="scalp">Scalping</SelectItem>
                        <SelectItem value="day-trading">Day Trading</SelectItem>
                        <SelectItem value="position">Position Trading</SelectItem>
                        <SelectItem value="other">Other (Custom)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Type Input - Show when "Other" is selected */}
                    {formData.type === 'other' && (
                      <div className="mt-3">
                        <Label htmlFor="customType" className="text-white">Custom Challenge Type *</Label>
                        <Input
                          id="customType"
                          name="customType"
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder="Enter custom challenge type"
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountSize" className="text-white">Account Size ($) *</Label>
                    <Input
                      id="accountSize"
                      name="accountSize"
                      type="number"
                      value={formData.accountSize}
                      onChange={handleInputChange}
                      placeholder="10000"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-white">Entry Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0 (for free challenges)"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the challenge rules and objectives"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative date-picker-container">
                    <Label htmlFor="startDate" className="text-white">Start Date *</Label>
                    <div className="relative">
                      <Input
                        id="startDate"
                        name="startDate"
                        value={formatDate(formData.startDate)}
                        readOnly
                        placeholder="Select start date"
                        className="mt-2 bg-white/10 border-white/20 text-white cursor-pointer"
                        onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Custom Start Date Picker */}
                    {showStartDatePicker && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-black border border-white/20 rounded-xl p-3 shadow-xl w-full">
                        <CustomDatePicker
                          selectedDate={formData.startDate ? (() => {
                            const [year, month, day] = formData.startDate.split('-').map(Number);
                            return new Date(Date.UTC(year, month - 1, day));
                          })() : (() => {
                            const now = new Date();
                            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                          })()}
                          onDateSelect={(date) => handleDateSelect('startDate', date)}
                          onClose={() => setShowStartDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative date-picker-container">
                    <Label htmlFor="endDate" className="text-white">End Date *</Label>
                    <div className="relative">
                      <Input
                        id="endDate"
                        name="endDate"
                        value={formatDate(formData.endDate)}
                        readOnly
                        placeholder="Select end date"
                        className="mt-2 bg-white/10 border-white/20 text-white cursor-pointer"
                        onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Custom End Date Picker */}
                    {showEndDatePicker && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-black border border-white/20 rounded-xl p-3 shadow-xl w-full">
                        <CustomDatePicker
                          selectedDate={formData.endDate ? (() => {
                            const [year, month, day] = formData.endDate.split('-').map(Number);
                            return new Date(Date.UTC(year, month - 1, day));
                          })() : (() => {
                            const now = new Date();
                            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                          })()}
                          onDateSelect={(date) => handleDateSelect('endDate', date)}
                          onClose={() => setShowEndDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="text-white">Start Time *</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime" className="text-white">End Time *</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Challenge Mode Toggle */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-base font-semibold">Challenge Mode *</Label>
                    <p className="text-gray-400 text-sm mt-1">Choose how participants will be evaluated</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setChallengeMode('target')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                        challengeMode === 'target'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Target Based</div>
                        <div className="text-sm opacity-80">Participants must reach specific profit targets</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setChallengeMode('rank')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                        challengeMode === 'rank'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Rank Based</div>
                        <div className="text-sm opacity-80">Participants compete for top rankings</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Prizes Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-base font-semibold">Prizes (Optional)</Label>
                    <p className="text-gray-400 text-sm mt-1">Add rank-based prizes for participants</p>
                  </div>
                  
                  <div className="space-y-3">
                    {prizes.map((prize, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={prize.isBulk}
                            onChange={(e) => updatePrize(index, 'isBulk', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-white text-sm">Bulk Prize (Range)</Label>
                        </div>
                        
                        <div className="flex gap-3 items-end">
                          {prize.isBulk ? (
                            <>
                              <div className="flex-1">
                                <Label className="text-white text-sm">Start Rank</Label>
                                <Input
                                  type="number"
                                  value={prize.rankStart || ''}
                                  onChange={(e) => updatePrize(index, 'rankStart', parseInt(e.target.value) || 1)}
                                  className="mt-1 bg-white/10 border-white/20 text-white"
                                  min="1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-white text-sm">End Rank</Label>
                                <Input
                                  type="number"
                                  value={prize.rankEnd || ''}
                                  onChange={(e) => updatePrize(index, 'rankEnd', parseInt(e.target.value) || 1)}
                                  className="mt-1 bg-white/10 border-white/20 text-white"
                                  min="1"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="flex-1">
                              <Label className="text-white text-sm">Rank</Label>
                              <Input
                                type="number"
                                value={prize.rank || ''}
                                onChange={(e) => updatePrize(index, 'rank', parseInt(e.target.value) || 1)}
                                className="mt-1 bg-white/10 border-white/20 text-white"
                                min="1"
                              />
                            </div>
                          )}
                          
                          <div className="flex-2">
                            <Label className="text-white text-sm">Prize Description</Label>
                            <Input
                              value={prize.prize}
                              onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                              placeholder={prize.isBulk ? "e.g., Ranks 4-10 Prize" : "e.g., $1000 Cash Prize"}
                              className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-white text-sm">Amount ($)</Label>
                            <Input
                              type="number"
                              value={prize.amount}
                              onChange={(e) => updatePrize(index, 'amount', parseFloat(e.target.value) || 0)}
                              className="mt-1 bg-white/10 border-white/20 text-white"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePrize(index)}
                            className="text-red-400 border-red-400 hover:bg-red-400/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPrize}
                        className="flex-1 border-dashed border-white/30 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Individual Prize
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addBulkPrize}
                        className="flex-1 border-dashed border-white/30 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bulk Prize
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                <div>
                  <Label className="text-white text-lg font-semibold mb-3 block">Challenge Rules</Label>
                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Input
                            value={rule}
                            onChange={(e) => updateRule(index, e.target.value)}
                            placeholder={`Rule ${index + 1}`}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeRule(index)}
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRule}
                      className="w-full border-dashed border-white/30 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants" className="text-white">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Target-based fields - only show when target mode is selected */}
                  {challengeMode === 'target' && (
                    <>
                      <div>
                        <Label htmlFor="targetProfit" className="text-white">Target Profit (%) *</Label>
                        <Input
                          id="targetProfit"
                          name="targetProfit"
                          type="number"
                          value={formData.targetProfit}
                          onChange={handleInputChange}
                          placeholder="10"
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxDrawdown" className="text-white">Max Drawdown (%) *</Label>
                        <Input
                          id="maxDrawdown"
                          name="maxDrawdown"
                          type="number"
                          value={formData.maxDrawdown}
                          onChange={handleInputChange}
                          placeholder="10"
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Challenge
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {isEditModalOpen && editingChallenge && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Challenge</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingChallenge(null);
                    setPrizes([]);
                  }}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <form onSubmit={handleUpdateChallenge} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-white">Challenge Name *</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter challenge name"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type" className="text-white">Challenge Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select challenge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swing">Swing Trading</SelectItem>
                        <SelectItem value="scalp">Scalping</SelectItem>
                        <SelectItem value="day-trading">Day Trading</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {formData.type === 'other' && (
                      <Input
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Enter custom type"
                        className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-accountSize" className="text-white">Account Size ($) *</Label>
                    <Input
                      id="edit-accountSize"
                      name="accountSize"
                      type="number"
                      value={formData.accountSize}
                      onChange={handleInputChange}
                      placeholder="10000"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-price" className="text-white">Entry Price ($)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0 (for free challenges)"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description" className="text-white">Description *</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the challenge rules and objectives"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative date-picker-container">
                    <Label htmlFor="edit-startDate" className="text-white">Start Date *</Label>
                    <div className="relative">
                      <Input
                        id="edit-startDate"
                        name="startDate"
                        value={formatDate(formData.startDate)}
                        readOnly
                        placeholder="Select start date"
                        className="mt-2 bg-white/10 border-white/20 text-white cursor-pointer"
                        onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Custom Start Date Picker */}
                    {showStartDatePicker && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-black border border-white/20 rounded-xl p-3 shadow-xl w-full">
                        <CustomDatePicker
                          selectedDate={formData.startDate ? (() => {
                            const [year, month, day] = formData.startDate.split('-').map(Number);
                            return new Date(Date.UTC(year, month - 1, day));
                          })() : (() => {
                            const now = new Date();
                            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                          })()}
                          onDateSelect={(date) => handleDateSelect('startDate', date)}
                          onClose={() => setShowStartDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative date-picker-container">
                    <Label htmlFor="edit-endDate" className="text-white">End Date *</Label>
                    <div className="relative">
                      <Input
                        id="edit-endDate"
                        name="endDate"
                        value={formatDate(formData.endDate)}
                        readOnly
                        placeholder="Select end date"
                        className="mt-2 bg-white/10 border-white/20 text-white cursor-pointer"
                        onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Custom End Date Picker */}
                    {showEndDatePicker && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-black border border-white/20 rounded-xl p-3 shadow-xl w-full">
                        <CustomDatePicker
                          selectedDate={formData.endDate ? (() => {
                            const [year, month, day] = formData.endDate.split('-').map(Number);
                            return new Date(Date.UTC(year, month - 1, day));
                          })() : (() => {
                            const now = new Date();
                            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                          })()}
                          onDateSelect={(date) => handleDateSelect('endDate', date)}
                          onClose={() => setShowEndDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-startTime" className="text-white">Start Time *</Label>
                    <Input
                      id="edit-startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-endTime" className="text-white">End Time *</Label>
                    <Input
                      id="edit-endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Challenge Mode Toggle */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-base font-semibold">Challenge Mode *</Label>
                    <p className="text-gray-400 text-sm mt-1">Choose how participants will be evaluated</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setChallengeMode('target')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        challengeMode === 'target'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-left">
                        <h3 className="text-white font-semibold mb-2">Target Based</h3>
                        <p className="text-gray-400 text-sm">Participants must reach specific profit targets</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setChallengeMode('rank')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        challengeMode === 'rank'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-left">
                        <h3 className="text-white font-semibold mb-2">Rank Based</h3>
                        <p className="text-gray-400 text-sm">Participants compete for top rankings</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Prizes Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-base font-semibold">Prizes (Optional)</Label>
                    <p className="text-gray-400 text-sm mt-1">Add rank-based prizes for participants</p>
                  </div>
                  
                  <div className="space-y-3">
                    {prizes.map((prize, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={prize.isBulk}
                            onChange={(e) => updatePrize(index, 'isBulk', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-white text-sm">Bulk Prize (Range)</Label>
                        </div>
                        
                        <div className="flex gap-3 items-end">
                          {prize.isBulk ? (
                            <>
                              <div className="flex-1">
                                <Label className="text-white text-sm">Start Rank</Label>
                                <Input
                                  type="number"
                                  value={prize.rankStart || ''}
                                  onChange={(e) => updatePrize(index, 'rankStart', parseInt(e.target.value) || 1)}
                                  className="mt-1 bg-white/10 border-white/20 text-white"
                                  min="1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-white text-sm">End Rank</Label>
                                <Input
                                  type="number"
                                  value={prize.rankEnd || ''}
                                  onChange={(e) => updatePrize(index, 'rankEnd', parseInt(e.target.value) || 1)}
                                  className="mt-1 bg-white/10 border-white/20 text-white"
                                  min="1"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="flex-1">
                              <Label className="text-white text-sm">Rank</Label>
                              <Input
                                type="number"
                                value={prize.rank || ''}
                                onChange={(e) => updatePrize(index, 'rank', parseInt(e.target.value) || 1)}
                                className="mt-1 bg-white/10 border-white/20 text-white"
                                min="1"
                              />
                            </div>
                          )}
                          
                          <div className="flex-2">
                            <Label className="text-white text-sm">Prize Description</Label>
                            <Input
                              value={prize.prize}
                              onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                              placeholder={prize.isBulk ? "e.g., Ranks 4-10 Prize" : "e.g., $1000 Cash Prize"}
                              className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-white text-sm">Amount ($)</Label>
                            <Input
                              type="number"
                              value={prize.amount}
                              onChange={(e) => updatePrize(index, 'amount', parseFloat(e.target.value) || 0)}
                              className="mt-1 bg-white/10 border-white/20 text-white"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePrize(index)}
                            className="text-red-400 border-red-400 hover:bg-red-400/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPrize}
                        className="flex-1 border-dashed border-white/30 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Individual Prize
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addBulkPrize}
                        className="flex-1 border-dashed border-white/30 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bulk Prize
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                <div>
                  <Label className="text-white text-lg font-semibold mb-3 block">Challenge Rules</Label>
                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Input
                            value={rule}
                            onChange={(e) => updateRule(index, e.target.value)}
                            placeholder={`Rule ${index + 1}`}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeRule(index)}
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRule}
                      className="w-full border-dashed border-white/30 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-maxParticipants" className="text-white">Max Participants</Label>
                    <Input
                      id="edit-maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {challengeMode === 'target' && (
                    <>
                      <div>
                        <Label htmlFor="edit-targetProfit" className="text-white">Target Profit (%)</Label>
                        <Input
                          id="edit-targetProfit"
                          name="targetProfit"
                          type="number"
                          value={formData.targetProfit}
                          onChange={handleInputChange}
                          placeholder="10"
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-maxDrawdown" className="text-white">Max Drawdown (%)</Label>
                        <Input
                          id="edit-maxDrawdown"
                          name="maxDrawdown"
                          type="number"
                          value={formData.maxDrawdown}
                          onChange={handleInputChange}
                          placeholder="10"
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingChallenge(null);
                      setPrizes([]);
                    }}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Update Challenge
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* View User Modal */}
      {isViewUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                User Details
              </h3>
              <Button
                onClick={handleCloseUserModals}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedUser.firstName?.charAt(0) || selectedUser.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : selectedUser.email
                    }
                  </h4>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      selectedUser.role === 'admin' 
                        ? 'border-purple-400 text-purple-400' 
                        : 'border-blue-400 text-blue-400'
                    }`}
                  >
                    {selectedUser.role || 'user'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge 
                    variant="outline" 
                    className="border-green-400 text-green-400"
                  >
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined:</span>
                  <span className="text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {selectedUser.username && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span className="text-white">{selectedUser.username}</span>
                  </div>
                )}
                
                {selectedUser.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">
                      {new Date(selectedUser.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <Button
                onClick={handleCloseUserModals}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-400" />
                Edit User
              </h3>
              <Button
                onClick={handleCloseUserModals}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="edit-firstName" className="text-white">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={selectedUser.firstName || ''}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-lastName" className="text-white">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={selectedUser.lastName || ''}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email" className="text-white">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email || ''}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-username" className="text-white">Username</Label>
                <Input
                  id="edit-username"
                  value={selectedUser.username || ''}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role" className="text-white">Role</Label>
                <Select value={selectedUser.role || 'user'}>
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="user" className="text-white hover:bg-gray-700">
                      User
                    </SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
              <Button
                onClick={handleCloseUserModals}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Signal Plan Modal */}
      {isCreateSignalPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Signal Plan</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateSignalPlanModalOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signalPlanName" className="text-white">Plan Name *</Label>
                    <Input
                      id="signalPlanName"
                      name="name"
                      value={signalPlanFormData.name}
                      onChange={handleSignalPlanInputChange}
                      placeholder="e.g., Premium Trading Signals"
                      maxLength={200}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signalPlanDescription" className="text-white">Description *</Label>
                    <Textarea
                      id="signalPlanDescription"
                      name="description"
                      value={signalPlanFormData.description}
                      onChange={handleSignalPlanInputChange}
                      placeholder="Describe what this signal plan offers..."
                      maxLength={1000}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {signalPlanFormData.description.length}/1000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signalPlanOriginalPrice" className="text-white">Original Price ($)</Label>
                      <Input
                        id="signalPlanOriginalPrice"
                        name="originalPrice"
                        type="number"
                        value={signalPlanFormData.originalPrice}
                        onChange={handleSignalPlanInputChange}
                        placeholder="149.99"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signalPlanPrice" className="text-white">Current Price ($) *</Label>
                      <Input
                        id="signalPlanPrice"
                        name="price"
                        type="number"
                        value={signalPlanFormData.price}
                        onChange={handleSignalPlanInputChange}
                        placeholder="99.99"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signalPlanDuration" className="text-white">Duration *</Label>
                      <Select value={signalPlanFormData.duration} onValueChange={(value) => handleSignalPlanSelectChange('duration', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signalPlanMaxSubscribers" className="text-white">Max Subscribers (Optional)</Label>
                    <Input
                      id="signalPlanMaxSubscribers"
                      name="maxSubscribers"
                      type="number"
                      value={signalPlanFormData.maxSubscribers}
                      onChange={handleSignalPlanInputChange}
                      placeholder="Leave empty for unlimited"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="signalPlanIsPopular"
                      checked={signalPlanFormData.isPopular}
                      onChange={(e) => handleSignalPlanCheckboxChange('isPopular', e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                    />
                    <Label htmlFor="signalPlanIsPopular" className="text-white">Mark as Popular Plan</Label>
                  </div>
                </div>

                {/* Right Column - Features & Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Features *</Label>
                    <div className="space-y-2">
                      {signalPlanFormData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateSignalPlanFeature(index, e.target.value)}
                            placeholder="Enter feature..."
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          {signalPlanFormData.features.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSignalPlanFeature(index)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSignalPlanFeature}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signalPlanFrequency" className="text-white">Signal Frequency</Label>
                    <Select value={signalPlanFormData.signalFrequency} onValueChange={(value) => handleSignalPlanSelectChange('signalFrequency', value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Multiple Daily">Multiple Daily</SelectItem>
                        <SelectItem value="Real-time">Real-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Signal Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['forex', 'crypto', 'stocks', 'indices', 'commodities'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`signalType-${type}`}
                            checked={signalPlanFormData.signalTypes.includes(type)}
                            onChange={() => toggleSignalType(type)}
                            className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                          />
                          <Label htmlFor={`signalType-${type}`} className="text-white capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signalPlanRiskLevel" className="text-white">Risk Level</Label>
                      <Select value={signalPlanFormData.riskLevel} onValueChange={(value) => handleSignalPlanSelectChange('riskLevel', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="signalPlanSuccessRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="signalPlanSuccessRate"
                        name="successRate"
                        type="number"
                        min="0"
                        max="100"
                        value={signalPlanFormData.successRate}
                        onChange={handleSignalPlanInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateSignalPlanModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSignalPlan}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Create Signal Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Signal Plan Modal */}
      {isEditSignalPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Signal Plan</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditSignalPlanModalOpen(false);
                    setEditingSignalPlan(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editSignalPlanName" className="text-white">Plan Name *</Label>
                    <Input
                      id="editSignalPlanName"
                      name="name"
                      value={signalPlanFormData.name}
                      onChange={handleSignalPlanInputChange}
                      placeholder="e.g., Premium Trading Signals"
                      maxLength={200}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editSignalPlanDescription" className="text-white">Description *</Label>
                    <Textarea
                      id="editSignalPlanDescription"
                      name="description"
                      value={signalPlanFormData.description}
                      onChange={handleSignalPlanInputChange}
                      placeholder="Describe what this signal plan offers..."
                      maxLength={1000}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {signalPlanFormData.description.length}/1000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editSignalPlanOriginalPrice" className="text-white">Original Price ($)</Label>
                      <Input
                        id="editSignalPlanOriginalPrice"
                        name="originalPrice"
                        type="number"
                        value={signalPlanFormData.originalPrice}
                        onChange={handleSignalPlanInputChange}
                        placeholder="149.99"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editSignalPlanPrice" className="text-white">Current Price ($) *</Label>
                      <Input
                        id="editSignalPlanPrice"
                        name="price"
                        type="number"
                        value={signalPlanFormData.price}
                        onChange={handleSignalPlanInputChange}
                        placeholder="99.99"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editSignalPlanDuration" className="text-white">Duration *</Label>
                      <Select value={signalPlanFormData.duration} onValueChange={(value) => handleSignalPlanSelectChange('duration', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editSignalPlanMaxSubscribers" className="text-white">Max Subscribers (Optional)</Label>
                    <Input
                      id="editSignalPlanMaxSubscribers"
                      name="maxSubscribers"
                      type="number"
                      value={signalPlanFormData.maxSubscribers}
                      onChange={handleSignalPlanInputChange}
                      placeholder="Leave empty for unlimited"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editSignalPlanIsPopular"
                      checked={signalPlanFormData.isPopular}
                      onChange={(e) => handleSignalPlanCheckboxChange('isPopular', e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                    />
                    <Label htmlFor="editSignalPlanIsPopular" className="text-white">Mark as Popular Plan</Label>
                  </div>
                </div>

                {/* Right Column - Features & Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Features *</Label>
                    <div className="space-y-2">
                      {signalPlanFormData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateSignalPlanFeature(index, e.target.value)}
                            placeholder="Enter feature..."
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          {signalPlanFormData.features.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSignalPlanFeature(index)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSignalPlanFeature}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editSignalPlanFrequency" className="text-white">Signal Frequency</Label>
                    <Select value={signalPlanFormData.signalFrequency} onValueChange={(value) => handleSignalPlanSelectChange('signalFrequency', value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Multiple Daily">Multiple Daily</SelectItem>
                        <SelectItem value="Real-time">Real-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Signal Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['forex', 'crypto', 'stocks', 'indices', 'commodities'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`editSignalType-${type}`}
                            checked={signalPlanFormData.signalTypes.includes(type)}
                            onChange={() => toggleSignalType(type)}
                            className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                          />
                          <Label htmlFor={`editSignalType-${type}`} className="text-white capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editSignalPlanRiskLevel" className="text-white">Risk Level</Label>
                      <Select value={signalPlanFormData.riskLevel} onValueChange={(value) => handleSignalPlanSelectChange('riskLevel', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editSignalPlanSuccessRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="editSignalPlanSuccessRate"
                        name="successRate"
                        type="number"
                        min="0"
                        max="100"
                        value={signalPlanFormData.successRate}
                        onChange={handleSignalPlanInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditSignalPlanModalOpen(false);
                    setEditingSignalPlan(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSignalPlan}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Update Signal Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create YouTube Video Modal */}
      {isCreateYouTubeVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add YouTube Video</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateYouTubeVideoModalOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoTitle" className="text-white">Video Title *</Label>
                  <Input
                    id="videoTitle"
                    value={youtubeVideoFormData.title}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, title: e.target.value})}
                    placeholder="Enter video title"
                    maxLength={200}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl" className="text-white">YouTube URL *</Label>
                  <Input
                    id="videoUrl"
                    value={youtubeVideoFormData.url}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, url: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Paste the full YouTube URL. Thumbnail will be auto-generated.
                  </p>
                </div>

                <div>
                  <Label htmlFor="videoThumbnail" className="text-white">Custom Thumbnail (Optional)</Label>
                  <Input
                    id="videoThumbnail"
                    value={youtubeVideoFormData.thumbnail}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, thumbnail: e.target.value})}
                    placeholder="https://example.com/custom-thumbnail.jpg"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to use YouTube's auto-generated thumbnail.
                  </p>
                </div>

                <div>
                  <Label htmlFor="videoDescription" className="text-white">Description (Optional)</Label>
                  <Textarea
                    id="videoDescription"
                    value={youtubeVideoFormData.description}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, description: e.target.value})}
                    placeholder="Brief description of the video content..."
                    maxLength={500}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {youtubeVideoFormData.description.length}/500 characters
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="videoActive"
                    checked={youtubeVideoFormData.isActive}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, isActive: e.target.checked})}
                    className="rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500"
                  />
                  <Label htmlFor="videoActive" className="text-white">Active (show in carousel)</Label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setIsCreateYouTubeVideoModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateYouTubeVideo}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                >
                  Add Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit YouTube Video Modal */}
      {isEditYouTubeVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit YouTube Video</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditYouTubeVideoModalOpen(false);
                    setEditingYouTubeVideo(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="editVideoTitle" className="text-white">Video Title *</Label>
                  <Input
                    id="editVideoTitle"
                    value={youtubeVideoFormData.title}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, title: e.target.value})}
                    placeholder="Enter video title"
                    maxLength={200}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="editVideoUrl" className="text-white">YouTube URL *</Label>
                  <Input
                    id="editVideoUrl"
                    value={youtubeVideoFormData.url}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, url: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Paste the full YouTube URL. Thumbnail will be auto-generated.
                  </p>
                </div>

                <div>
                  <Label htmlFor="editVideoThumbnail" className="text-white">Custom Thumbnail (Optional)</Label>
                  <Input
                    id="editVideoThumbnail"
                    value={youtubeVideoFormData.thumbnail}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, thumbnail: e.target.value})}
                    placeholder="https://example.com/custom-thumbnail.jpg"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to use YouTube's auto-generated thumbnail.
                  </p>
                </div>

                <div>
                  <Label htmlFor="editVideoDescription" className="text-white">Description (Optional)</Label>
                  <Textarea
                    id="editVideoDescription"
                    value={youtubeVideoFormData.description}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, description: e.target.value})}
                    placeholder="Brief description of the video content..."
                    maxLength={500}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {youtubeVideoFormData.description.length}/500 characters
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editVideoActive"
                    checked={youtubeVideoFormData.isActive}
                    onChange={(e) => setYoutubeVideoFormData({...youtubeVideoFormData, isActive: e.target.checked})}
                    className="rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500"
                  />
                  <Label htmlFor="editVideoActive" className="text-white">Active (show in carousel)</Label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setIsEditYouTubeVideoModalOpen(false);
                    setEditingYouTubeVideo(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateYouTubeVideo}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                >
                  Update Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Prop Firm Package Modal */}
      {isCreatePropFirmPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Prop Firm Package</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatePropFirmPackageModalOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="propFirmPackageName" className="text-white">Package Name *</Label>
                    <Input
                      id="propFirmPackageName"
                      value={propFirmPackageFormData.name}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Elite Account Management"
                      maxLength={200}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="propFirmPackageDescription" className="text-white">Description</Label>
                    <Textarea
                      id="propFirmPackageDescription"
                      value={propFirmPackageFormData.description}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this package offers..."
                      maxLength={1000}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {propFirmPackageFormData.description.length}/1000 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propFirmPackageServiceFee" className="text-white">Service Fee ($) *</Label>
                    <Input
                      id="propFirmPackageServiceFee"
                      type="number"
                      value={propFirmPackageFormData.serviceFee}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, serviceFee: e.target.value }))}
                      placeholder="699"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="propFirmPackagePricingType" className="text-white">Pricing Type *</Label>
                    <Select value={propFirmPackageFormData.pricingType} onValueChange={(value) => setPropFirmPackageFormData(prev => ({ ...prev, pricingType: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="performance-based">Performance-based</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="propFirmPackageMaxClients" className="text-white">Max Clients (Optional)</Label>
                    <Input
                      id="propFirmPackageMaxClients"
                      type="number"
                      value={propFirmPackageFormData.maxClients}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, maxClients: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propFirmPackageSuccessRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="propFirmPackageSuccessRate"
                        type="number"
                        value={propFirmPackageFormData.successRate}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, successRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="85"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="propFirmPackageCoversAllPhaseFees"
                        checked={propFirmPackageFormData.coversAllPhaseFees}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, coversAllPhaseFees: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Label htmlFor="propFirmPackageCoversAllPhaseFees" className="text-white">Covers All Phase Fees</Label>
                    </div>
                  </div>


                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="propFirmPackageIsPopular"
                      checked={propFirmPackageFormData.isPopular}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500"
                    />
                    <Label htmlFor="propFirmPackageIsPopular" className="text-white">Mark as Popular Package</Label>
                  </div>
                </div>

                {/* Right Column - Requirements & Features */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Requirements</Label>
                    <div className="space-y-3 bg-white/5 rounded-lg p-4">
                      <div>
                        <Label htmlFor="propFirmPackageMinAccountSize" className="text-white text-sm">Min Account Size ($) *</Label>
                        <Input
                          id="propFirmPackageMinAccountSize"
                          type="number"
                          value={propFirmPackageFormData.requirements.minAccountSize}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, minAccountSize: e.target.value }
                          }))}
                          placeholder="10000"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="propFirmPackageMaxDrawdown" className="text-white text-sm">Max Drawdown (%) *</Label>
                        <Input
                          id="propFirmPackageMaxDrawdown"
                          type="number"
                          value={propFirmPackageFormData.requirements.maxDrawdown}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, maxDrawdown: e.target.value }
                          }))}
                          placeholder="10"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="propFirmPackageProfitTarget" className="text-white text-sm">Profit Target (%) *</Label>
                        <Input
                          id="propFirmPackageProfitTarget"
                          type="number"
                          value={propFirmPackageFormData.requirements.profitTarget}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, profitTarget: e.target.value }
                          }))}
                          placeholder="8"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="propFirmPackageMinTradingDays" className="text-white text-sm">Min Trading Days</Label>
                        <Input
                          id="propFirmPackageMinTradingDays"
                          type="number"
                          value={propFirmPackageFormData.requirements.minTradingDays}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, minTradingDays: e.target.value }
                          }))}
                          placeholder="5"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Supported Prop Firms *</Label>
                    <div className="space-y-2">
                      {propFirmPackageFormData.requirements.supportedPropFirms.map((firm, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={firm}
                            onChange={(e) => {
                              const newFirms = [...propFirmPackageFormData.requirements.supportedPropFirms];
                              newFirms[index] = e.target.value;
                              setPropFirmPackageFormData(prev => ({ 
                                ...prev, 
                                requirements: { ...prev.requirements, supportedPropFirms: newFirms }
                              }));
                            }}
                            placeholder="e.g., FTMO"
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFirms = propFirmPackageFormData.requirements.supportedPropFirms.filter((_, i) => i !== index);
                              setPropFirmPackageFormData(prev => ({ 
                                ...prev, 
                                requirements: { ...prev.requirements, supportedPropFirms: newFirms }
                              }));
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPropFirmPackageFormData(prev => ({ 
                          ...prev, 
                          requirements: { 
                            ...prev.requirements, 
                            supportedPropFirms: [...prev.requirements.supportedPropFirms, '']
                          }
                        }))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prop Firm
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Features *</Label>
                    <div className="space-y-2">
                      {propFirmPackageFormData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...propFirmPackageFormData.features];
                              newFeatures[index] = e.target.value;
                              setPropFirmPackageFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            placeholder="Enter feature..."
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFeatures = propFirmPackageFormData.features.filter((_, i) => i !== index);
                              setPropFirmPackageFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPropFirmPackageFormData(prev => ({ ...prev, features: [...prev.features, ''] }))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePropFirmPackageModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePropFirmPackage}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Create Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prop Firm Package Modal */}
      {isEditPropFirmPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Prop Firm Package</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditPropFirmPackageModalOpen(false);
                    setEditingPropFirmPackage(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editPropFirmPackageName" className="text-white">Package Name *</Label>
                    <Input
                      id="editPropFirmPackageName"
                      value={propFirmPackageFormData.name}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Elite Account Management"
                      maxLength={200}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editPropFirmPackageDescription" className="text-white">Description</Label>
                    <Textarea
                      id="editPropFirmPackageDescription"
                      value={propFirmPackageFormData.description}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this package offers..."
                      maxLength={1000}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {propFirmPackageFormData.description.length}/1000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="editPropFirmPackageServiceFee" className="text-white">Service Fee ($) *</Label>
                      <Input
                        id="editPropFirmPackageServiceFee"
                        type="number"
                        value={propFirmPackageFormData.serviceFee}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, serviceFee: e.target.value }))}
                        placeholder="699"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                        <Label htmlFor="editPropFirmPackageServiceFee" className="text-white">Service Fee ($) *</Label>
                      <Input
                        id="editPropFirmPackageServiceFee"
                        type="number"
                        value={propFirmPackageFormData.serviceFee}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, serviceFee: e.target.value }))}
                        placeholder="699"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editPropFirmPackagePricingType" className="text-white">Pricing Type *</Label>
                      <Select value={propFirmPackageFormData.pricingType} onValueChange={(value) => setPropFirmPackageFormData(prev => ({ ...prev, pricingType: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="performance-based">Performance-based</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editPropFirmPackageMaxClients" className="text-white">Max Clients (Optional)</Label>
                      <Input
                        id="editPropFirmPackageMaxClients"
                        type="number"
                        value={propFirmPackageFormData.maxClients}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, maxClients: e.target.value }))}
                        placeholder="Leave empty for unlimited"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editPropFirmPackageSuccessRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="editPropFirmPackageSuccessRate"
                        type="number"
                        value={propFirmPackageFormData.successRate}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, successRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="85"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="editPropFirmPackageCoversAllPhaseFees"
                        checked={propFirmPackageFormData.coversAllPhaseFees}
                        onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, coversAllPhaseFees: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Label htmlFor="editPropFirmPackageCoversAllPhaseFees" className="text-white">Covers All Phase Fees</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editPropFirmPackageIsPopular"
                      checked={propFirmPackageFormData.isPopular}
                      onChange={(e) => setPropFirmPackageFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500"
                    />
                    <Label htmlFor="editPropFirmPackageIsPopular" className="text-white">Mark as Popular Package</Label>
                  </div>
                </div>

                {/* Right Column - Requirements & Features */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Requirements</Label>
                    <div className="space-y-3 bg-white/5 rounded-lg p-4">
                      <div>
                        <Label htmlFor="editPropFirmPackageMinAccountSize" className="text-white text-sm">Min Account Size ($) *</Label>
                        <Input
                          id="editPropFirmPackageMinAccountSize"
                          type="number"
                          value={propFirmPackageFormData.requirements.minAccountSize}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, minAccountSize: e.target.value }
                          }))}
                          placeholder="10000"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editPropFirmPackageMaxDrawdown" className="text-white text-sm">Max Drawdown (%) *</Label>
                        <Input
                          id="editPropFirmPackageMaxDrawdown"
                          type="number"
                          value={propFirmPackageFormData.requirements.maxDrawdown}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, maxDrawdown: e.target.value }
                          }))}
                          placeholder="10"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editPropFirmPackageProfitTarget" className="text-white text-sm">Profit Target (%) *</Label>
                        <Input
                          id="editPropFirmPackageProfitTarget"
                          type="number"
                          value={propFirmPackageFormData.requirements.profitTarget}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, profitTarget: e.target.value }
                          }))}
                          placeholder="8"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editPropFirmPackageMinTradingDays" className="text-white text-sm">Min Trading Days</Label>
                        <Input
                          id="editPropFirmPackageMinTradingDays"
                          type="number"
                          value={propFirmPackageFormData.requirements.minTradingDays}
                          onChange={(e) => setPropFirmPackageFormData(prev => ({ 
                            ...prev, 
                            requirements: { ...prev.requirements, minTradingDays: e.target.value }
                          }))}
                          placeholder="5"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Supported Prop Firms *</Label>
                    <div className="space-y-2">
                      {propFirmPackageFormData.requirements.supportedPropFirms.map((firm, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={firm}
                            onChange={(e) => {
                              const newFirms = [...propFirmPackageFormData.requirements.supportedPropFirms];
                              newFirms[index] = e.target.value;
                              setPropFirmPackageFormData(prev => ({ 
                                ...prev, 
                                requirements: { ...prev.requirements, supportedPropFirms: newFirms }
                              }));
                            }}
                            placeholder="e.g., FTMO"
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFirms = propFirmPackageFormData.requirements.supportedPropFirms.filter((_, i) => i !== index);
                              setPropFirmPackageFormData(prev => ({ 
                                ...prev, 
                                requirements: { ...prev.requirements, supportedPropFirms: newFirms }
                              }));
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPropFirmPackageFormData(prev => ({ 
                          ...prev, 
                          requirements: { 
                            ...prev.requirements, 
                            supportedPropFirms: [...prev.requirements.supportedPropFirms, '']
                          }
                        }))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prop Firm
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Features *</Label>
                    <div className="space-y-2">
                      {propFirmPackageFormData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...propFirmPackageFormData.features];
                              newFeatures[index] = e.target.value;
                              setPropFirmPackageFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            placeholder="Enter feature..."
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFeatures = propFirmPackageFormData.features.filter((_, i) => i !== index);
                              setPropFirmPackageFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPropFirmPackageFormData(prev => ({ ...prev, features: [...prev.features, ''] }))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditPropFirmPackageModalOpen(false);
                    setEditingPropFirmPackage(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePropFirmPackage}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Update Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Settings Modal */}
      {isFooterSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Footer Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFooterSettingsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Layout className="h-5 w-5 mr-2 text-purple-400" />
                    Company Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
                      <Input
                        id="companyName"
                        value={footerSettingsFormData.companyName}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          companyName: e.target.value
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={footerSettingsFormData.email}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          email: e.target.value
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyDescription" className="text-gray-300">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      value={footerSettingsFormData.companyDescription}
                      onChange={(e) => setFooterSettingsFormData({
                        ...footerSettingsFormData,
                        companyDescription: e.target.value
                      })}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter company description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      <Input
                        id="phone"
                        value={footerSettingsFormData.phone}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          phone: e.target.value
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address" className="text-gray-300">Address</Label>
                      <Input
                        id="address"
                        value={footerSettingsFormData.address}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          address: e.target.value
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>

                {/* Support Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-purple-400" />
                    Support Links
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp Support URL</Label>
                      <Input
                        id="whatsapp"
                        value={footerSettingsFormData.supportLinks.whatsapp}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          supportLinks: {
                            ...footerSettingsFormData.supportLinks,
                            whatsapp: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://wa.me/1234567890"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telegram-support" className="text-gray-300">Telegram Support URL</Label>
                      <Input
                        id="telegram-support"
                        value={footerSettingsFormData.supportLinks.telegram}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          supportLinks: {
                            ...footerSettingsFormData.supportLinks,
                            telegram: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://t.me/yourusername"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-purple-400" />
                    Social Media Links
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook" className="text-gray-300">Facebook URL</Label>
                      <Input
                        id="facebook"
                        value={footerSettingsFormData.socialMedia.facebook}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            facebook: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twitter" className="text-gray-300">Twitter URL</Label>
                      <Input
                        id="twitter"
                        value={footerSettingsFormData.socialMedia.twitter}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            twitter: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://twitter.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instagram" className="text-gray-300">Instagram URL</Label>
                      <Input
                        id="instagram"
                        value={footerSettingsFormData.socialMedia.instagram}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            instagram: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="linkedin" className="text-gray-300">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={footerSettingsFormData.socialMedia.linkedin}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            linkedin: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://linkedin.com/company/yourpage"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="youtube" className="text-gray-300">YouTube URL</Label>
                      <Input
                        id="youtube"
                        value={footerSettingsFormData.socialMedia.youtube}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            youtube: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telegram" className="text-gray-300">Telegram URL</Label>
                      <Input
                        id="telegram"
                        value={footerSettingsFormData.socialMedia.telegram}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          socialMedia: {
                            ...footerSettingsFormData.socialMedia,
                            telegram: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="https://t.me/yourchannel or https://t.me/yourgroup"
                      />
                    </div>
                  </div>
                </div>

                {/* Newsletter Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-purple-400" />
                    Newsletter Settings
                  </h3>
                  
                  <div>
                    <Label htmlFor="newsletterTitle" className="text-gray-300">Newsletter Title</Label>
                    <Input
                      id="newsletterTitle"
                      value={footerSettingsFormData.newsletter.title}
                      onChange={(e) => setFooterSettingsFormData({
                        ...footerSettingsFormData,
                        newsletter: {
                          ...footerSettingsFormData.newsletter,
                          title: e.target.value
                        }
                      })}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter newsletter title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newsletterDescription" className="text-gray-300">Newsletter Description</Label>
                    <Textarea
                      id="newsletterDescription"
                      value={footerSettingsFormData.newsletter.description}
                      onChange={(e) => setFooterSettingsFormData({
                        ...footerSettingsFormData,
                        newsletter: {
                          ...footerSettingsFormData.newsletter,
                          description: e.target.value
                        }
                      })}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter newsletter description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Legal Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-400" />
                    Legal Links
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="privacyPolicy" className="text-gray-300">Privacy Policy URL</Label>
                      <Input
                        id="privacyPolicy"
                        value={footerSettingsFormData.legalLinks.privacyPolicy}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          legalLinks: {
                            ...footerSettingsFormData.legalLinks,
                            privacyPolicy: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="/privacy"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="termsOfService" className="text-gray-300">Terms of Service URL</Label>
                      <Input
                        id="termsOfService"
                        value={footerSettingsFormData.legalLinks.termsOfService}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          legalLinks: {
                            ...footerSettingsFormData.legalLinks,
                            termsOfService: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="/terms"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cookiePolicy" className="text-gray-300">Cookie Policy URL</Label>
                      <Input
                        id="cookiePolicy"
                        value={footerSettingsFormData.legalLinks.cookiePolicy}
                        onChange={(e) => setFooterSettingsFormData({
                          ...footerSettingsFormData,
                          legalLinks: {
                            ...footerSettingsFormData.legalLinks,
                            cookiePolicy: e.target.value
                          }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="/cookies"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setIsFooterSettingsModalOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateFooterSettings}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Mentorship Plan Modal */}
      {isCreateMentorshipPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Mentorship Plan</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateMentorshipPlanModalOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mentorshipPlanName" className="text-white">Plan Name *</Label>
                    <Input
                      id="mentorshipPlanName"
                      value={mentorshipPlanFormData.name}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Advanced Forex Mentorship"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentorshipPlanDescription" className="text-white">Description *</Label>
                    <Textarea
                      id="mentorshipPlanDescription"
                      value={mentorshipPlanFormData.description}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this mentorship program offers..."
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="mentorshipPlanPrice" className="text-white">Price ($) *</Label>
                      <Input
                        id="mentorshipPlanPrice"
                        type="number"
                        value={mentorshipPlanFormData.price}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="199"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mentorshipPlanDuration" className="text-white">Duration *</Label>
                      <Select value={mentorshipPlanFormData.duration} onValueChange={(value) => setMentorshipPlanFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mentorshipPlanPricingType" className="text-white">Pricing Type *</Label>
                      <Select value={mentorshipPlanFormData.pricingType} onValueChange={(value) => setMentorshipPlanFormData(prev => ({ ...prev, pricingType: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="one-time">One-Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mentorshipPlanMaxSubscribers" className="text-white">Max Subscribers</Label>
                    <Input
                      id="mentorshipPlanMaxSubscribers"
                      type="number"
                      value={mentorshipPlanFormData.maxSubscribers}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, maxSubscribers: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Right Column - Mentor Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mentorName" className="text-white">Mentor Name *</Label>
                    <Input
                      id="mentorName"
                      value={mentorshipPlanFormData.metadata.mentorName}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorName: e.target.value }
                      }))}
                      placeholder="John Doe"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentorExperience" className="text-white">Mentor Experience</Label>
                    <Input
                      id="mentorExperience"
                      value={mentorshipPlanFormData.metadata.mentorExperience}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorExperience: e.target.value }
                      }))}
                      placeholder="10+ years"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentorBio" className="text-white">Mentor Bio</Label>
                    <Textarea
                      id="mentorBio"
                      value={mentorshipPlanFormData.metadata.mentorBio}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorBio: e.target.value }
                      }))}
                      placeholder="Brief description of the mentor's background..."
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="courseDuration" className="text-white">Total Duration of Course</Label>
                      <Input
                        id="courseDuration"
                        type="text"
                        value={mentorshipPlanFormData.metadata.courseDuration}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, courseDuration: e.target.value }
                        }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="7 days, 6 months, 3 weeks, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxSessionsPerMonth" className="text-white">Max Sessions/Month</Label>
                      <Input
                        id="maxSessionsPerMonth"
                        type="number"
                        value={mentorshipPlanFormData.metadata.maxSessionsPerMonth}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, maxSessionsPerMonth: parseInt(e.target.value) }
                        }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="successRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="successRate"
                        type="number"
                        value={mentorshipPlanFormData.metadata.successRate}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, successRate: parseInt(e.target.value) }
                        }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="75"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={mentorshipPlanFormData.isPopular}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="rounded border-white/20 bg-white/10 text-purple-600"
                      />
                      <span className="text-white text-sm">Mark as Popular</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-6">
                <Label className="text-white">Features *</Label>
                <div className="space-y-2 mt-2">
                  {mentorshipPlanFormData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...mentorshipPlanFormData.features];
                          newFeatures[index] = e.target.value;
                          setMentorshipPlanFormData(prev => ({ ...prev, features: newFeatures }));
                        }}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFeatures = mentorshipPlanFormData.features.filter((_, i) => i !== index);
                          setMentorshipPlanFormData(prev => ({ ...prev, features: newFeatures }));
                        }}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        features: [...prev.features, ''] 
                      }));
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateMentorshipPlanModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateMentorshipPlan}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mentorship Plan Modal */}
      {isEditMentorshipPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Mentorship Plan</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditMentorshipPlanModalOpen(false);
                    setEditingMentorshipPlan(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editMentorshipPlanName" className="text-white">Plan Name *</Label>
                    <Input
                      id="editMentorshipPlanName"
                      value={mentorshipPlanFormData.name}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Advanced Forex Mentorship"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editMentorshipPlanDescription" className="text-white">Description *</Label>
                    <Textarea
                      id="editMentorshipPlanDescription"
                      value={mentorshipPlanFormData.description}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this mentorship program offers..."
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editMentorshipPlanPrice" className="text-white">Price ($) *</Label>
                      <Input
                        id="editMentorshipPlanPrice"
                        type="number"
                        value={mentorshipPlanFormData.price}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="199"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMentorshipPlanDuration" className="text-white">Duration *</Label>
                      <Select value={mentorshipPlanFormData.duration} onValueChange={(value) => setMentorshipPlanFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editMentorshipPlanPricingType" className="text-white">Pricing Type *</Label>
                      <Select value={mentorshipPlanFormData.pricingType} onValueChange={(value) => setMentorshipPlanFormData(prev => ({ ...prev, pricingType: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="one-time">One-Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Mentor Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editMentorName" className="text-white">Mentor Name *</Label>
                    <Input
                      id="editMentorName"
                      value={mentorshipPlanFormData.metadata.mentorName}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorName: e.target.value }
                      }))}
                      placeholder="John Doe"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editMentorExperience" className="text-white">Mentor Experience</Label>
                    <Input
                      id="editMentorExperience"
                      value={mentorshipPlanFormData.metadata.mentorExperience}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorExperience: e.target.value }
                      }))}
                      placeholder="10+ years"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editCourseDuration" className="text-white">Total Duration of Course</Label>
                    <Input
                      id="editCourseDuration"
                      type="text"
                      value={mentorshipPlanFormData.metadata.courseDuration}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, courseDuration: e.target.value }
                      }))}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="7 days, 6 months, 3 weeks, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="editMentorBio" className="text-white">Mentor Bio</Label>
                    <Textarea
                      id="editMentorBio"
                      value={mentorshipPlanFormData.metadata.mentorBio}
                      onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, mentorBio: e.target.value }
                      }))}
                      placeholder="Brief description of the mentor's background..."
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editMaxSessionsPerMonth" className="text-white">Max Sessions/Month</Label>
                      <Input
                        id="editMaxSessionsPerMonth"
                        type="number"
                        value={mentorshipPlanFormData.metadata.maxSessionsPerMonth}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, maxSessionsPerMonth: parseInt(e.target.value) }
                        }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editSuccessRate" className="text-white">Success Rate (%)</Label>
                      <Input
                        id="editSuccessRate"
                        type="number"
                        value={mentorshipPlanFormData.metadata.successRate}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, successRate: parseInt(e.target.value) }
                        }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMaxSubscribers" className="text-white">Max Subscribers</Label>
                      <Input
                        id="editMaxSubscribers"
                        type="number"
                        value={mentorshipPlanFormData.maxSubscribers}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, maxSubscribers: e.target.value }))}
                        placeholder="Leave empty for unlimited"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={mentorshipPlanFormData.isPopular}
                        onChange={(e) => setMentorshipPlanFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="rounded border-white/20 bg-white/10 text-purple-600"
                      />
                      <span className="text-white text-sm">Mark as Popular</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-6">
                <Label className="text-white">Features *</Label>
                <div className="space-y-2 mt-2">
                  {mentorshipPlanFormData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...mentorshipPlanFormData.features];
                          newFeatures[index] = e.target.value;
                          setMentorshipPlanFormData(prev => ({ ...prev, features: newFeatures }));
                        }}
                        placeholder="Feature description"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                      {mentorshipPlanFormData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = mentorshipPlanFormData.features.filter((_, i) => i !== index);
                            setMentorshipPlanFormData(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMentorshipPlanFormData(prev => ({ ...prev, features: [...prev.features, ''] }))}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMentorshipPlanModalOpen(false);
                    setEditingMentorshipPlan(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateMentorshipPlan}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prop Firm Service Details Modal */}
      <PropFirmServiceDetailsModal
        isOpen={isPropFirmServiceDetailsModalOpen}
        onClose={() => {
          setIsPropFirmServiceDetailsModalOpen(false);
          setSelectedPropFirmServiceId(null);
        }}
        serviceId={selectedPropFirmServiceId}
      />

      {/* Chat Modal */}
      {isChatModalOpen && selectedServiceForChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-semibold text-white">Chat with User</h2>
                <p className="text-gray-400 text-sm">
                  {selectedServiceForChat.user?.firstName} {selectedServiceForChat.user?.lastName} • {selectedServiceForChat.user?.email}
                </p>
                <p className="text-gray-400 text-sm">
                  Service: {selectedServiceForChat.package?.name || 'Unknown Package'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseChat}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto max-h-96">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!newChatMessage.trim() || sendingChatMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Chat Modal */}
      {isMentorshipChatModalOpen && selectedMentorshipSubscription && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">Chat with Student</h3>
                <p className="text-gray-400 text-sm">
                  {selectedMentorshipSubscription.user?.firstName || 'Unknown'} {selectedMentorshipSubscription.user?.lastName || 'User'} - {selectedMentorshipSubscription.mentorshipPlan?.name || 'Unknown Plan'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseMentorshipChat}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
              {mentorshipChatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                mentorshipChatMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg text-sm ${
                        message.sender === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'admin' ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={newMentorshipChatMessage}
                  onChange={(e) => setNewMentorshipChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && sendMentorshipChatMessage()}
                />
                <Button
                  onClick={sendMentorshipChatMessage}
                  disabled={!newMentorshipChatMessage.trim() || sendingMentorshipChatMessage}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Scheduling Modal */}
      {isSessionScheduleModalOpen && selectedMentorshipSubscription && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">Schedule Session</h3>
                <p className="text-gray-300 text-sm">
                  Schedule a session for {selectedMentorshipSubscription.user.firstName} {selectedMentorshipSubscription.user.lastName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSessionSchedule}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Date *</Label>
                  <Input
                    type="date"
                    value={sessionScheduleData.date}
                    onChange={(e) => setSessionScheduleData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Time *</Label>
                  <Input
                    type="time"
                    value={sessionScheduleData.time}
                    onChange={(e) => setSessionScheduleData(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Timezone</Label>
                  <Select
                    value={sessionScheduleData.timezone}
                    onValueChange={(value) => setSessionScheduleData(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Mumbai (IST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white mb-2 block">Duration (minutes)</Label>
                  <Select
                    value={sessionScheduleData.duration.toString()}
                    onValueChange={(value) => setSessionScheduleData(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Session Topic</Label>
                <Input
                  value={sessionScheduleData.topic}
                  onChange={(e) => setSessionScheduleData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Technical Analysis, Risk Management, Trading Psychology"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Notes (Optional)</Label>
                <Textarea
                  value={sessionScheduleData.notes}
                  onChange={(e) => setSessionScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or preparation instructions for the student..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseSessionSchedule}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSession}
                  disabled={schedulingSession || !sessionScheduleData.date || !sessionScheduleData.time}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {schedulingSession ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Management Modal */}
      {isSessionsModalOpen && selectedMentorshipSubscription && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Scheduled Sessions</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseSessionsModal}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {selectedMentorshipSubscription.mentorshipPlan?.name || 'Unknown Plan'}
                </h3>
                <p className="text-gray-300">
                  Student: {selectedMentorshipSubscription.user?.firstName || 'Unknown'} {selectedMentorshipSubscription.user?.lastName || 'User'}
                </p>
              </div>

              {/* Sessions List */}
              <div className="space-y-4">
                {selectedMentorshipSubscription.sessionHistory
                  ?.filter(session => session.status === 'scheduled')
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-medium">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-300 text-sm">
                            {new Date(session.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            <span className="text-gray-500 ml-1">({session.timezone || 'UTC'})</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenEditSession(session)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteSession(session)}
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            disabled={deletingSession}
                          >
                            {deletingSession ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white ml-2">{session.duration} minutes</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Topic:</span>
                          <span className="text-white ml-2">{session.topic || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-2">
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-gray-400 text-sm">Notes:</span>
                          <p className="text-white text-sm mt-1">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {(!selectedMentorshipSubscription.sessionHistory || 
                selectedMentorshipSubscription.sessionHistory.filter(s => s.status === 'scheduled').length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No scheduled sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {isEditSessionModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Session</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseEditSession}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">Date *</Label>
                    <Input
                      type="date"
                      value={editSessionData.date}
                      onChange={(e) => setEditSessionData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Time *</Label>
                    <Input
                      type="time"
                      value={editSessionData.time}
                      onChange={(e) => setEditSessionData(prev => ({ ...prev, time: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">Timezone *</Label>
                    <Select
                      value={editSessionData.timezone}
                      onValueChange={(value) => setEditSessionData(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="CST">CST</SelectItem>
                        <SelectItem value="MST">MST</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                        <SelectItem value="CET">CET</SelectItem>
                        <SelectItem value="IST">IST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Duration (minutes)</Label>
                    <Select
                      value={editSessionData.duration.toString()}
                      onValueChange={(value) => setEditSessionData(prev => ({ ...prev, duration: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Session Topic</Label>
                  <Input
                    value={editSessionData.topic}
                    onChange={(e) => setEditSessionData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Technical Analysis, Risk Management, Trading Psychology"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Notes (Optional)</Label>
                  <Textarea
                    value={editSessionData.notes}
                    onChange={(e) => setEditSessionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or preparation instructions for the student..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseEditSession}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSession}
                    disabled={updatingSession || !editSessionData.date || !editSessionData.time}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {updatingSession ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Leaderboard Entry Modal */}
      {isEditLeaderboardModalOpen && editingLeaderboardEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Edit Leaderboard Entry</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditLeaderboardModalOpen(false);
                    setEditingLeaderboardEntry(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">User</Label>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white">
                    {editingLeaderboardEntry.firstName} {editingLeaderboardEntry.lastName} (@{editingLeaderboardEntry.username})
                  </div>
                </div>

                {/* MT5 Account Credentials */}
                {editingLeaderboardEntry.mt5Account && (
                  <div>
                    <Label className="text-white mb-2 block text-sm sm:text-base">MT5 Account Credentials</Label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm sm:text-base">
                      <div className="space-y-1">
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Account ID:</span> {editingLeaderboardEntry.mt5Account.id || 'Not set'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Server:</span> {editingLeaderboardEntry.mt5Account.server || 'Not set'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Password:</span> {editingLeaderboardEntry.mt5Account.password || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-white mb-2 block">Account ID</Label>
                  <Input
                    value={editingLeaderboardEntry.accountId || ''}
                    onChange={(e) => setEditingLeaderboardEntry(prev => ({ ...prev, accountId: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Balance ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.balance || ''}
                    onChange={(e) => {
                      const newBalance = parseFloat(e.target.value) || 0;
                      const currentProfit = editingLeaderboardEntry.profit || 0;
                      const newProfitPercent = newBalance > 0 ? (currentProfit / newBalance) * 100 : 0;
                      setEditingLeaderboardEntry(prev => ({ 
                        ...prev, 
                        balance: newBalance,
                        profitPercent: newProfitPercent
                      }));
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Equity ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.equity || ''}
                    onChange={(e) => setEditingLeaderboardEntry(prev => ({ ...prev, equity: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Profit ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.profit || ''}
                    onChange={(e) => {
                      const newProfit = parseFloat(e.target.value) || 0;
                      const currentBalance = editingLeaderboardEntry.balance || 0;
                      const newProfitPercent = currentBalance > 0 ? (newProfit / currentBalance) * 100 : 0;
                      setEditingLeaderboardEntry(prev => ({ 
                        ...prev, 
                        profit: newProfit,
                        profitPercent: newProfitPercent
                      }));
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Profit Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.profitPercent || ''}
                    readOnly
                    className="bg-white/5 border-white/10 text-white cursor-not-allowed"
                  />
                  <p className="text-gray-400 text-xs mt-1">Automatically calculated from profit and balance</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Margin ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.margin || ''}
                    onChange={(e) => setEditingLeaderboardEntry(prev => ({ ...prev, margin: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Free Margin ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.freeMargin || ''}
                    onChange={(e) => setEditingLeaderboardEntry(prev => ({ ...prev, freeMargin: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Margin Level (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLeaderboardEntry.marginLevel || ''}
                    onChange={(e) => setEditingLeaderboardEntry(prev => ({ ...prev, marginLevel: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditLeaderboardModalOpen(false);
                    setEditingLeaderboardEntry(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateLeaderboardEntry(editingLeaderboardEntry._id, editingLeaderboardEntry)}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {isUserManagementModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Manage User</h3>
                  {selectedUser.competitionName && (
                    <p className="text-gray-400 text-xs sm:text-sm truncate">Competition: {selectedUser.competitionName}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsUserManagementModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">User Information</Label>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm sm:text-base">
                    <div className="font-semibold">{selectedUser.user?.firstName} {selectedUser.user?.lastName}</div>
                    <div className="text-gray-300">@{selectedUser.user?.username}</div>
                    <div className="text-gray-400 text-xs">{selectedUser.user?.email}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">Competition Details</Label>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm sm:text-base">
                    <div className="font-semibold">{selectedUser.competitionName}</div>
                    <div className="text-gray-300">Account Size: ${selectedUser.competitionId ? competitions.find(c => c._id === selectedUser.competitionId)?.accountSize?.toLocaleString() || '0' : '0'}</div>
                  </div>
                </div>

                {/* MT5 Credentials Display */}
                {selectedUser.mt5Account && (
                  <div>
                    <Label className="text-white mb-2 block text-sm sm:text-base">MT5 Account Credentials</Label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm sm:text-base">
                      <div className="space-y-1">
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Account ID:</span> {selectedUser.mt5Account.id || 'Not set'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Server:</span> {selectedUser.mt5Account.server || 'Not set'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Password:</span> {selectedUser.mt5Account.password || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">Current Balance ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedUser.currentBalance || ''}
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, currentBalance: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                    placeholder="Enter current account balance"
                  />
                  <p className="text-gray-400 text-xs mt-1">Default: Competition account size</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">Profit/Loss ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedUser.profit || ''}
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, profit: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                    placeholder="Enter profit or loss amount"
                  />
                  <p className="text-gray-400 text-xs mt-1">Positive for profit, negative for loss</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">Participation Status</Label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) => setSelectedUser(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_setup">Pending Setup - User hasn't set up MT5</SelectItem>
                      <SelectItem value="active">Active - Currently trading</SelectItem>
                      <SelectItem value="completed">Completed - Challenge finished</SelectItem>
                      <SelectItem value="failed">Failed - Challenge failed</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn - User left challenge</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-gray-400 text-xs mt-1">Track the user's participation status</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">MT5 Account ID</Label>
                  <Input
                    value={selectedUser.mt5Account?.id || ''}
                    onChange={(e) => setSelectedUser(prev => ({ 
                      ...prev, 
                      mt5Account: { ...prev.mt5Account, id: e.target.value }
                    }))}
                    placeholder="e.g., 12345678"
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                  />
                  <p className="text-gray-400 text-xs mt-1">User's MetaTrader 5 account number</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">MT5 Server</Label>
                  <Input
                    value={selectedUser.mt5Account?.server || ''}
                    onChange={(e) => setSelectedUser(prev => ({ 
                      ...prev, 
                      mt5Account: { ...prev.mt5Account, server: e.target.value }
                    }))}
                    placeholder="e.g., Demo-Server"
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                  />
                  <p className="text-gray-400 text-xs mt-1">MetaTrader 5 server name</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">MT5 Password</Label>
                  <Input
                    type="password"
                    value={selectedUser.mt5Account?.password || ''}
                    onChange={(e) => setSelectedUser(prev => ({ 
                      ...prev, 
                      mt5Account: { ...prev.mt5Account, password: e.target.value }
                    }))}
                    placeholder="Enter MT5 password"
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                  />
                  <p className="text-gray-400 text-xs mt-1">MetaTrader 5 account password</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm sm:text-base">Profit Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedUser.profitPercent || ''}
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white text-sm sm:text-base"
                  />
                  <p className="text-gray-400 text-xs mt-1">Calculated automatically from profit/balance</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUserManagementModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await authenticatedApiCall(`/challenges/${selectedUser.competitionId || selectedCompetition}/participants/${selectedUser._id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                          currentBalance: selectedUser.currentBalance,
                          profit: selectedUser.profit,
                          status: selectedUser.status,
                          mt5Account: selectedUser.mt5Account,
                          profitPercent: selectedUser.profitPercent
                        })
                      });

                      if (response.ok) {
                        toast.success('User updated successfully');
                        setIsUserManagementModalOpen(false);
                        setSelectedUser(null);
                        // Refresh all data
                        await fetchCompetitions();
                        await fetchLeaderboard();
                        if (selectedCompetition !== 'all') {
                          await fetchCompetitionParticipants(selectedCompetition);
                        }
                      } else {
                        toast.error('Failed to update user');
                      }
                    } catch (error) {
                      // Error:Error updating user:', error);
                      toast.error('Error updating user');
                    }
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
};

export default AdminPanel;
// End of AdminPanel component
