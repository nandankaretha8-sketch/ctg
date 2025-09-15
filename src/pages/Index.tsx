import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StepsSection from "@/components/StepsSection";
import MentorshipsSection from "@/components/MentorshipsSection";
import YouTubeVideosSection from "@/components/YouTubeVideosSection";
import NotificationsSection from "@/components/NotificationsSection";
import AdminTrustSection from "@/components/AdminTrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      <Header />
      <HeroSection />
      <StepsSection />
      <MentorshipsSection />
      <YouTubeVideosSection />
      <NotificationsSection />
      <AdminTrustSection />
      <Footer />
    </div>
  );
};

export default Index;
