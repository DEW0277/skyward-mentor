import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LeadCapture from "@/components/LeadCapture";
import ExpertStory from "@/components/ExpertStory";
import BookFeatures from "@/components/BookFeatures";
import FlipBookPreview from "@/components/FlipBookPreview";
import BonusSection from "@/components/BonusSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      {/* <LeadCapture />Da */}
      <ExpertStory />
      <BookFeatures />
      <FlipBookPreview />
      <BonusSection />
      <Footer />
    </main>
  );
};

export default Index;
