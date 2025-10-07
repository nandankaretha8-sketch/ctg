import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Eye, EyeOff, CheckCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(formData.password)) {
      toast({
        title: "Validation Error",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one symbol",
        variant: "destructive",
      });
      return false;
    }
    if (formData.username.length < 3) {
      toast({
        title: "Validation Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await sendRegistrationOTP({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      toast({
        title: "Verification Code Sent! 📧",
        description: `We've sent a 6-digit verification code to ${formData.email}. Please check your email and enter the code below.`,
        variant: "default",
      });
      
      setOtpSent(true);
      setStep('otp');
      startCountdown();
    } catch (err: any) {
      toast({
        title: "Failed to Send Verification Code",
        description: err.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await verifyRegistrationOTP({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        otp: otp,
      });
      
      toast({
        title: "Registration Successful! 🎉",
        description: "Your account has been created successfully. Welcome to CTG Trading!",
        variant: "default",
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);

    try {
      await resendRegistrationOTP({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      toast({
        title: "New Code Sent! 📧",
        description: "A new verification code has been sent to your email.",
        variant: "default",
      });
      
      startCountdown();
    } catch (err: any) {
      toast({
        title: "Failed to Resend Code",
        description: err.message || "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtpSent(false);
    setOtp("");
    setCountdown(0);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
        {/* Header */}
        <div className="w-full p-6">
          <div className="flex items-center justify-between">
            {/* Left side - Logo + Brand */}
            <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/icon.jpeg" 
                alt="CTG" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #6b7280)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CTG
              </span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="glass-card border-glass-border/30 shadow-2xl hover:shadow-glass transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold gradient-text mb-2">Registration Complete!</h2>
                  <p className="text-gray-300">
                    Your account has been created successfully. Redirecting to dashboard...
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
        {/* Header */}
        <div className="w-full p-6">
          <div className="flex items-center justify-between">
            {/* Left side - Logo + Brand */}
            <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/icon.jpeg" 
                alt="CTG" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #6b7280)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CTG
              </span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="glass-card border-glass-border/30 shadow-2xl hover:shadow-glass transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold gradient-text mb-2 animate-fade-in-up">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  We've sent a 6-digit verification code to
                </CardDescription>
                <div className="font-semibold text-primary mt-2">{formData.email}</div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-foreground">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit code"
                      className="text-center text-2xl font-mono tracking-widest bg-glass/20 border-glass-border/30 focus:border-primary/50"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify & Complete Registration
                      </div>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-400 text-center">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className="w-full"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToForm}
                    className="w-full text-gray-400 hover:text-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Registration Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      {/* Header */}
      <div className="w-full p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Logo + Brand */}
          <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold gradient-text">CTG</span>
          </Link>

          {/* Right side - Login Link */}
          <Link to="/login">
            <Button
              variant="hero"
              size="sm"
              className="text-sm px-4 py-2"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass-card border-glass-border/30 shadow-2xl hover:shadow-glass transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold gradient-text mb-2 animate-fade-in-up">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Join CTG Trading and start your trading journey
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    required
                    className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="bg-glass/20 border-glass-border/30 focus:border-primary/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="bg-glass/20 border-glass-border/30 focus:border-primary/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Verification Code...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Verification Code
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;