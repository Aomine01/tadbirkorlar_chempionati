import { ArrowRight } from "lucide-react";
import Container from "../components/Container";
import bgVideo from "../assets/video/10mln.mp4";

interface CTAProps {
  onApply?: () => void;
}

const CTA = ({ onApply }: CTAProps) => {
  return (
    <section className="relative overflow-hidden py-10">
      {/* Full background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Content */}
      <Container className="relative z-10">
        <div className="flex justify-center">
          <div
            className="rounded-2xl px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full max-w-4xl backdrop-blur-[50px] border border-white/15"
            style={{
              background: "rgba(0,0,0,0.1)",
            }}
          >
            {/* Left - Text */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                YOSH TADBIRKORLAR
                <br />
                <span style={{ color: "#00A8FF" }}>CHEMPIONATI</span>
              </h2>
            </div>

            {/* Right - Button */}
            <button
              onClick={onApply}
              className="flex items-stretch shrink-0 cursor-pointer group"
            >
              <div
                className="px-6 sm:px-8 flex items-center rounded-l-xl border-2 border-r-0 border-white/30 text-sm font-medium transition-all duration-300 group-hover:bg-[#00A8FF] group-hover:border-white/50"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Ariza topshirish
              </div>
              <div className="w-12 aspect-square rounded-r-xl border-2 border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#00A8FF] group-hover:border-white/50">
                <ArrowRight
                  size={20}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </div>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
