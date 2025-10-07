import Header from "@/components/Header";
import ServiceGrid from "@/components/ServiceGrid";
import MentorshipsSection from "@/components/MentorshipsSection";
import YouTubeVideosSection from "@/components/YouTubeVideosSection";
import AboutUsSection from "@/components/AboutUsSection";
import TradingPsychologySection from "@/components/TradingPsychologySection";
import NotificationsSection from "@/components/NotificationsSection";
import BottomCTASection from "@/components/BottomCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Unified Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/90" />
      
      {/* Ribbon Gradient Background */}
      <div className="ribbon-background">
        <div className="ribbon ribbon-1"></div>
        <div className="ribbon ribbon-2"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <ServiceGrid />
        {/* <MentorshipsSection /> - Hidden since mentorships are now shown in service grid */}
        <YouTubeVideosSection />
        <AboutUsSection />
        <TradingPsychologySection />
        <NotificationsSection />
        <BottomCTASection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;