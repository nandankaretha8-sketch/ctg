import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      <Header />
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">Contact Us</h1>
            <p className="text-foreground text-lg">
              Have questions? We're here to help. Get in touch with our support team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="text-white">Send us a Message</CardTitle>
                <CardDescription className="text-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="First Name" 
                    className="bg-glass-border/20 border-glass-border text-foreground placeholder:text-foreground/60"
                  />
                  <Input 
                    placeholder="Last Name" 
                    className="bg-glass-border/20 border-glass-border text-foreground placeholder:text-foreground/60"
                  />
                </div>
                <Input 
                  placeholder="Email Address" 
                  type="email"
                  className="bg-glass-border/20 border-glass-border text-foreground placeholder:text-foreground/60"
                />
                <Input 
                  placeholder="Subject" 
                  className="bg-glass-border/20 border-glass-border text-foreground placeholder:text-foreground/60"
                />
                <Textarea 
                  placeholder="Your Message" 
                  rows={5}
                  className="bg-glass-border/20 border-glass-border text-foreground placeholder:text-foreground/60"
                />
                <button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold px-8 py-2 rounded-lg shadow-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
                  style={{ 
                    color: 'white !important'
                  }}
                >
                  <span style={{ color: 'white !important', opacity: '1 !important' }}>Send Message</span>
                </button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-white">Get in Touch</CardTitle>
                  <CardDescription className="text-foreground">
                    We're here to help with any questions or concerns you may have.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-foreground">support@ctg.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Phone</p>
                      <p className="text-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Address</p>
                      <p className="text-foreground">123 Trading Street<br />Financial District, NY 10004</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Business Hours</p>
                      <p className="text-foreground">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-white">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="/faq" className="block text-foreground hover:text-primary transition-colors">
                    → Frequently Asked Questions
                  </a>
                  <a href="/privacy-policy" className="block text-foreground hover:text-primary transition-colors">
                    → Privacy Policy
                  </a>
                  <a href="/refund-policy" className="block text-foreground hover:text-primary transition-colors">
                    → Refund Policy
                  </a>
                  <a href="/terms-of-service" className="block text-foreground hover:text-primary transition-colors">
                    → Terms of Service
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
