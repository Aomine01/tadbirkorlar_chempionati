import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Container from "../components/Container";

const forms: Record<string, { title: string; src: string }> = {
  ideas: {
    title: "G'oya yo'nalishi",
    src: "https://docs.google.com/forms/d/e/1FAIpQLSfltjeAwHPaZow6K8dk2NPbhlFA15MD1fVq8fl_fjQERocrMg/viewform?embedded=true",
  },
  startup: {
    title: "Startap yo'nalishi",
    src: "https://docs.google.com/forms/d/e/1FAIpQLScGrCEEEW3JSa8gbGhZI4siNOcEAn7v2Fx50dpXEMl2uFshGA/viewform?embedded=true",
  },
  business: {
    title: "An'anaviy biznes yo'nalishi",
    src: "https://docs.google.com/forms/d/e/1FAIpQLSeEO4pjZU3ISzCrZ7bkdgmACs-WtjOAPDrIp1LVNeWi-r38RA/viewform?embedded=true",
  },
};

const FormPage = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const form = type ? forms[type] : null;

  if (!form) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div className="text-center">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-swiss)" }}
          >
            Sahifa topilmadi
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-[#00A8FF] hover:underline text-sm"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div
        className="border-b border-white/10"
        style={{ background: "#111111" }}
      >
        <Container>
          <div className="py-4 sm:py-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">{form.title}</h1>
              <p
                className="text-white/50 text-xs sm:text-sm"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Ariza formasini to'ldiring
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Form */}
      <div>
        <div className="w-full h-[calc(100vh - 120px)] border border-white/10 bg-white">
          <iframe
            src={form.src}
            width="100%"
            frameBorder="0"
            title={form.title}
            className="w-full"
            style={{ border: "none", minHeight: "100vh", height: "auto" }}
          >
            Yuklanmoqda...
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
