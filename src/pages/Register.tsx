import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully. Redirecting to login...",
        variant: "success",
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          <Card className="glass-card border-glass-border/30 max-w-md shadow-2xl hover:shadow-glass transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold gradient-text mb-2">Registration Successful!</h2>
              <p className="text-gray-300 mb-4">
                Your account has been created successfully. Redirecting to login...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
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
                Join CTG Trading
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Create your account and start your trading journey
              </CardDescription>
            </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-glass/20 border-glass-border/30 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-2">{formData.password.length >= 8 ? '✓' : '○'}</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-2">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-2">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-2">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}</span>
                      One symbol
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
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
