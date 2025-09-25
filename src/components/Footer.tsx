import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight, MessageCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

import { API_URL } from '@/lib/api';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch footer settings
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/footer-settings`);
        const data = await response.json();
        
        if (data.success) {
          setFooterSettings(data.data);
        }
      } catch (error) {
        // Silent error handling for footer settings
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
    { name: "Telegram", icon: MessageCircle, href: settings.socialMedia.telegram || "#" },
  ].filter(link => link.href !== "#"); // Only show social links that have URLs

  return (
    <footer className="bg-gradient-to-b from-transparent to-black/20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="text-center mb-12">
          {/* Company Info */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center mr-3">
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
              
              {/* Support Links */}
              {settings.supportLinks?.whatsapp && (
                <a 
                  href={settings.supportLinks.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-green-400" />
                  <span>WhatsApp Support</span>
                </a>
              )}
              
              {settings.supportLinks?.telegram && (
                <a 
                  href={settings.supportLinks.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-3 text-blue-400" />
                  <span>Telegram Support</span>
                </a>
              )}
              
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3 text-purple-400" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
        </div>


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
