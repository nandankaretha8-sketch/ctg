import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Star, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
interface MentorshipPlan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  pricingType: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxSubscribers: number | null;
  currentSubscribers: number;
  metadata: {
    sessionFrequency: string;
    courseDuration: string;
    maxSessionsPerMonth: number;
    mentorExperience: string;
    specialization: string[];
    successRate: number;
    languages: string[];
    mentorName: string;
    mentorBio: string;
  };
}

const MentorshipsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<MentorshipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  // Add custom styles for radial gradient
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .bg-gradient-radial {
        background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchFeaturedMentorships();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      // Silent error handling for settings
    }
  };

  const fetchFeaturedMentorships = async () => {
    try {
      const response = await fetch(`${API_URL}/mentorship-plans`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Get up to 3 featured plans (prioritize popular ones)
        const featuredPlans = data.data
          .filter((plan: MentorshipPlan) => plan.isActive)
          .sort((a: MentorshipPlan, b: MentorshipPlan) => {
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            return 0;
          })
          .slice(0, 3);
        setPlans(featuredPlans);
      }
    } catch (error) {
      // Silent error handling for mentorship plans
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDurationLabel = (duration: string, pricingType: string) => {
    // If it's a one-time payment, show validity period instead of payment frequency
    if (pricingType === 'one-time') {
      switch (duration) {
        case 'monthly': return 'valid for 1 month';
        case 'quarterly': return 'valid for 3 months';
        case 'semi-annual': return 'valid for 6 months';
        case 'annual': return 'valid for 1 year';
        default: return 'valid for 1 month';
      }
    }
    
    // For recurring payments, show payment frequency
    switch (pricingType) {
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      case 'semi-annual': return 'per 6 months';
      case 'annual': return 'per year';
      default: return 'per month';
    }
  };

  const handleViewAll = () => {
    navigate('/mentorships');
  };

  const handlePlanClick = (plan: MentorshipPlan) => {
    navigate(`/mentorships/${plan._id}`);
  };

  // Don't show section if no plans available
  if (loading) {
    return null;
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300">
              Learn from
            </span><br />
            <span className="text-white cursor-pointer hover:text-purple-300 transition-colors duration-300">
              Expert Mentor
            </span>
          </h2>
        </div>

        {/* Mentor Photo Section */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Mentor Photo with Vignette Effect */}
            <div className="relative h-96 md:h-[500px]">
              <img
                src="/mentor-photo.JPEG"
                alt="Expert Mentor"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="text-center">
                  <User className="h-24 w-24 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">Mentor Photo</p>
                </div>
              </div>
              
              {/* Vignette Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
              
              {/* Spotlight Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"></div>
            </div>
            
            {/* Glowing Explore Programs Button */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={handleViewAll}
                className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-2 border-white/20 backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3), 0 0 90px rgba(168, 85, 247, 0.1)'
                }}
              >
                Explore Programs
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorshipsSection;