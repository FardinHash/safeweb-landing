import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import BrowserSection from "./components/BrowserSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BrowserSection />
      <Footer />
    </div>
  );
}

export default App;
