import { useNavigate } from "react-router-dom";
import Hero from "../sections/Hero";
import Stats from "../sections/Stats";
import About from "../sections/About";
import Categories from "../sections/Categories";
import PositiveSides from "../sections/PositiveSides";
import Roadmap from "../sections/Roadmap";
import Experts from "../sections/Experts";
import FAQ from "../sections/FAQ";
import CTA from "../sections/CTA";
import Footer from "../sections/Footer";

const HomePage = () => {
  const navigate = useNavigate();

  // Primary CTA now routes to auth portal instead of modal
  const openApply = () => navigate("/auth/login");

  return (
    <div>
      <Hero onApply={openApply} />
      <Stats />
      <About />
      <Categories />
      <PositiveSides />
      <Roadmap />
      <Experts />
      <FAQ />
      <CTA onApply={openApply} />
      <Footer />
    </div>
  );
};

export default HomePage;
