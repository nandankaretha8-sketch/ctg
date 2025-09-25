import Header from "@/components/Header";
import ServiceGrid from "@/components/ServiceGrid";
import MentorshipsSection from "@/components/MentorshipsSection";
import YouTubeVideosSection from "@/components/YouTubeVideosSection";
import NotificationsSection from "@/components/NotificationsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)' }}>
      <Header />
      <ServiceGrid />
      {/* <MentorshipsSection /> - Hidden since mentorships are now shown in service grid */}
      <YouTubeVideosSection />
      <NotificationsSection />
      <Footer />
    </div>
  );
};

export default Index;
