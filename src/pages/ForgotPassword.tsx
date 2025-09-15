import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailSent(true);
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Resent!",
          description: "A new verification code has been sent to your email.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
        {/* Header */}
        <div className="w-full p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold gradient-text">CTG</span>
            </Link>

            <Link to="/login">
              <Button variant="hero" size="sm" className="text-sm px-4 py-2">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="glass-card border-glass-border/30 shadow-2xl hover:shadow-glass transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-bold gradient-text mb-2">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  We've sent a verification code to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
            
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-gray-400">
                    Please check your email and enter the 6-digit code to continue with password reset.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> The code will expire in 5 minutes. If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/verify-otp', { state: { email } })}
                    variant="hero"
                    className="w-full"
                  >
                    Enter Verification Code
                  </Button>

                  <Button
                    onClick={handleResendOTP}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setIsEmailSent(false)}
                  >
                    Use a different email address
                  </Link>
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
          <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold gradient-text">CTG</span>
          </Link>

          <Link to="/login">
            <Button variant="hero" size="sm" className="text-sm px-4 py-2">
              Back to Login
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
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                No worries! Enter your email and we'll send you a verification code
              </CardDescription>
            </CardHeader>
          
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Code...
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
                  Remember your password?{" "}
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

export default ForgotPassword;
