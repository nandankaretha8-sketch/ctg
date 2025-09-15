import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch footer settings
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/footer-settings');
        const data = await response.json();
        
        if (data.success) {
          setFooterSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterSettings();
  }, []);

  // Default values
  const defaultSettings = {
    companyName: 'CTG',
    companyDescription: 'Empowering traders worldwide with cutting-edge competition platforms, signal services, and prop firm solutions. Join thousands of successful traders.',
    email: 'support@ctgtrading.com',
    phone: '+1 (555) 123-4567',
    address: 'New York, NY 10001',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    newsletter: {
      title: 'Stay Updated',
      description: 'Get the latest trading insights, competition updates, and exclusive offers delivered to your inbox.',
      isActive: true
    },
    legalLinks: {
      privacyPolicy: '/privacy',
      termsOfService: '/terms',
      cookiePolicy: '/cookies'
    }
  };

  const settings = footerSettings || defaultSettings;

  const legalLinks = [
    { name: "Privacy Policy", href: settings.legalLinks.privacyPolicy },
    { name: "Terms of Service", href: settings.legalLinks.termsOfService },
    { name: "Cookie Policy", href: settings.legalLinks.cookiePolicy },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: settings.socialMedia.facebook || "#" },
    { name: "Twitter", icon: Twitter, href: settings.socialMedia.twitter || "#" },
    { name: "Instagram", icon: Instagram, href: settings.socialMedia.instagram || "#" },
    { name: "LinkedIn", icon: Linkedin, href: settings.socialMedia.linkedin || "#" },
    { name: "YouTube", icon: Youtube, href: settings.socialMedia.youtube || "#" },
  ].filter(link => link.href !== "#"); // Only show social links that have URLs

  return (
    <footer className="bg-gradient-to-b from-transparent to-black/20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="text-center mb-12">
          {/* Company Info */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-white">{settings.companyName}</span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {settings.companyDescription}
            </p>
            
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3 text-purple-400" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-3 text-purple-400" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3 text-purple-400" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        {settings.newsletter.isActive && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {settings.newsletter.title}
              </h3>
              <p className="text-gray-300 mb-6">
                {settings.newsletter.description}
              </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          {/* Copyright */}
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} {settings.companyName} Trading. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
