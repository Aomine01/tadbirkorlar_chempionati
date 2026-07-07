import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lightbulb, Building2, Rocket } from "lucide-react";

const categories = [
  {
    key: "ideas",
    title: "G'oya",
    description:
      "Sizda hali amalga oshirilmagan, lekin kuchli potensialga ega g'oya bor.",
    icon: Lightbulb,
  },
  {
    key: "business",
    title: "An'anaviy biznes",
    description:
      "Sizda allaqachon ishlayotgan biznes bor. Uni kengaytiring va yangi darajaga olib chiqing.",
    icon: Building2,
  },
  {
    key: "startup",
    title: "Startap",
    description:
      "Siz muammoga aniq va kuchli yechim topgansiz. Endi uni tezroq o'stiring.",
    icon: Rocket,
  },
];

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

const ApplicationModal = ({ open, onClose }: ApplicationModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 sm:p-8 animate-modal-in"
        style={{ background: "#0a0a0a" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <h2
          className="text-xl sm:text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          YO'NALISHNI TANLANG
        </h2>
        <p
          className="text-white/50 text-sm mb-6"
          style={{ fontFamily: "var(--font-button)" }}
        >
          Qaysi yo'nalishda qatnashmoqchisiz?
        </p>

        {/* Category cards */}
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  onClose();
                  navigate(`/forms/${cat.key}`);
                }}
                className="group w-full text-left flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00A8FF]/10 hover:border-[#00A8FF]/30 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/10 group-hover:bg-[#00A8FF]/20 transition-colors duration-300">
                  <Icon
                    size={22}
                    className="text-white/70 group-hover:text-[#00A8FF] transition-colors duration-300"
                  />
                </div>
                <div>
                  <h3
                    className="text-base font-bold mb-0.5"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat.title}
                  </h3>
                  <p
                    className="text-white/40 text-xs leading-relaxed"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ApplicationModal;
