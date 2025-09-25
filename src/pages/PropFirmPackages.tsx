import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, TrendingUp, Shield, Clock, Users, Target, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { API_URL } from '@/lib/api';
interface PropFirmPackage {
  _id: string;
  name: string;
  description: string;
  serviceFee: number;
  pricingType: string;
  features: string[];
  requirements: {
    minAccountSize: number;
    supportedPropFirms: string[];
    maxDrawdown: number;
    profitTarget: number;
  };
  isPopular: boolean;
  successRate: number;
  coversAllPhaseFees: boolean;
  currentClients: number;
  maxClients?: number;
}

interface UserService {
  _id: string;
  status: string;
  package: {
    _id: string;
    name: string;
  };
}

const PropFirmPackages = () => {
  const [packages, setPackages] = useState<PropFirmPackage[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    
    fetchPackages();
    if (user) {
      fetchUserServices();
    } else {
    }
  }, [user]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
        const response = await fetch(`${API_URL}/prop-firm-packages`);
      
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data.data || []);
      } else {
        throw new Error(`Failed to fetch packages: ${response.status}`);
      }
    } catch (error) {
      setError((error as Error).message);
      toast.error('Failed to load prop firm packages: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/prop-firm-services/my-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {
        const data = await response.json();
        setUserServices(data.data || []);
      }
    } catch (error) {
      // Silent error handling for user services
    }
  };

  const getDurationLabel = (pricingType: string) => {
    switch (pricingType) {
      case 'one-time':
        return 'One-time';
      case 'monthly':
        return 'Monthly';
      case 'performance-based':
        return 'Performance-based';
      case 'hybrid':
        return 'Hybrid';
      default:
        return pricingType;
    }
  };

  const hasActiveService = (packageId: string) => {
    
    const result = userServices.some(service => {
      
      return service.package && service.package._id === packageId && 
        ['pending', 'active'].includes(service.status);
    });
    
    return result;
  };

  const getUserService = (packageId: string) => {
    return userServices.find(service => service.package && service.package._id === packageId);
  };

  const handleApplyNow = (packageId: string) => {
    navigate(`/prop-firm-services/${packageId}/apply`);
  };

  const handleViewDetails = (packageId: string) => {
    const userService = getUserService(packageId);
    if (userService) {
      navigate(`/prop-firm-services/${userService._id}/status`);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading prop firm packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error Loading Packages</div>
          <div className="text-gray-400 mb-6">{error}</div>
          <Button 
            onClick={() => {
              setError(null);
              fetchPackages();
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white px-6 py-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prop Firm Account Management
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Let our experts manage your prop firm accounts with professional trading strategies
          </p>
        </div>

        {packages.length === 0 ? (
          <Card className="glass-card border-glass-border/30">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Packages Available</h3>
              <p className="text-gray-400">Check back later for new prop firm management packages</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {packages.map((pkg) => (
                <Card key={pkg._id} className="glass-card border-glass-border/30 relative">
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="p-6 text-center">
                    <CardTitle className="text-white text-xl mb-2">{pkg.name}</CardTitle>
                    <CardDescription className="text-gray-300 text-sm">
                      {getDurationLabel(pkg.pricingType)} Service
                    </CardDescription>
                    
                    <div className="mt-4">
                      <span className="text-white text-3xl font-bold">${pkg.serviceFee}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    <p className="text-gray-300 text-sm mb-6 text-center">
                      {pkg.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {pkg.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                      {pkg.features.length > 4 && (
                        <div className="text-gray-400 text-xs text-center">
                          +{pkg.features.length - 4} more features
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                      <h4 className="text-white font-semibold mb-3 text-sm">Requirements</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Account Size:</span>
                          <span className="text-white">${pkg.requirements.minAccountSize.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Drawdown:</span>
                          <span className="text-white">{pkg.requirements.maxDrawdown}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Target:</span>
                          <span className="text-white">{pkg.requirements.profitTarget}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                      <div>
                        <div className="text-white font-semibold">{pkg.successRate}%</div>
                        <div className="text-gray-400 text-xs">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{pkg.coversAllPhaseFees ? 'Yes' : 'No'}</div>
                        <div className="text-gray-400 text-xs">Covers All Fees</div>
                      </div>
                    </div>

                    {(() => {
                      const hasActive = hasActiveService(pkg._id);
                      return hasActive ? (
                        <Button
                          onClick={() => handleViewDetails(pkg._id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApplyNow(pkg._id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white"
                        >
                          Apply Now
                        </Button>
                      );
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why Choose Our Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Why Choose Our Prop Firm Management?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Proven Results</h3>
                  <p className="text-gray-400 text-sm">High success rates with detailed market analysis</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Risk Management</h3>
                  <p className="text-gray-400 text-sm">Advanced risk management strategies</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">24/7 Monitoring</h3>
                  <p className="text-gray-400 text-sm">Round-the-clock account monitoring</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Expert Team</h3>
                  <p className="text-gray-400 text-sm">Professional traders with years of experience</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropFirmPackages;
