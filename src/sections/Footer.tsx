import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import logoWhite from "../assets/logos/white full.png";
import logoBlue from "../assets/logos/blue-full.png";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const Footer = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  const navLinks: { labelKey: TranslationKey; href: string }[] = [
    { labelKey: "nav.home", href: "#home" },
    { labelKey: "nav.about", href: "#about" },
    { labelKey: "nav.roadmap", href: "#roadmap" },
    { labelKey: "nav.experts", href: "#experts" },
    { labelKey: "nav.faq", href: "#faq" },
  ];

  const applyLinks: { labelKey: TranslationKey; key: string }[] = [
    { labelKey: "footer.startup", key: "startup" },
    { labelKey: "footer.business", key: "business" },
  ];

  return (
    <footer
      className="transition-colors duration-300 border-t"
      style={{
        background: isLight ? "#f1f5f9" : "#11121A",
        borderColor: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(255, 255, 255, 0.05)",
      }}
    >
      <Container>
        <div className="py-12 sm:py-16 flex flex-col sm:flex-row items-start justify-between gap-10">
          {/* Logo + Admin Telegram link */}
          <div>
            <img
              src={isLight ? logoBlue : logoWhite}
              alt="Yosh Tadbirkorlar Chempionati"
              className="h-10 w-auto object-contain mb-4"
            />
            <p className={`text-xs sm:text-sm mb-3 ${isLight ? "text-slate-600" : "text-white/60"}`}>
              {t("footer.contact")}
            </p>
            <a
              href="https://t.me/ytrj_admin"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram Admin (@ytrj_admin)"
              aria-label="Telegram Admin"
              className="inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white transition-all duration-300 shadow-md hover:scale-105 hover:shadow-lg cursor-pointer"
              style={{ background: "linear-gradient(135deg, #00A8FF 0%, #0077FF 100%)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.198 2.433a2.242 2.242 0 00-1.022.215l-16.5 6.498c-1.356.527-1.347 1.467-.243 1.812l4.232 1.322 1.64 5.04c.196.604.757.83 1.27.53l2.35-1.517 4.604 3.394c.848.468 1.458.228 1.668-.786l3.01-14.18c.291-1.175-.45-1.708-1.009-1.328zM9.5 15.5l-.4 3.9-1.5-4.6 9-5.4-7.1 6.1z" />
              </svg>
            </a>
          </div>

          {/* Nav section */}
          <div>
            <h4
              className={`text-sm font-bold uppercase mb-4 tracking-widest ${
                isLight ? "text-slate-500" : "text-white/50"
              }`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              {t("footer.sections")}
            </h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map(({ labelKey, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`text-sm transition-colors duration-200 ${
                      isLight ? "text-slate-700 hover:text-slate-950 font-medium" : "text-white/60 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {t(labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ariza section */}
          <div>
            <h4
              className={`text-sm font-bold uppercase mb-4 tracking-widest ${
                isLight ? "text-slate-500" : "text-white/50"
              }`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              {t("footer.apply")}
            </h4>
            <ul className="flex flex-col gap-3">
              {applyLinks.map(({ labelKey, key }) => (
                <li key={key}>
                  <button
                    onClick={() => navigate(`/forms/${key}`)}
                    className={`text-sm transition-colors duration-200 cursor-pointer ${
                      isLight ? "text-slate-700 hover:text-slate-950 font-medium" : "text-white/60 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <p
            className={`text-sm sm:self-end ${isLight ? "text-slate-500" : "text-white/50"}`}
            style={{ fontFamily: "var(--font-button)" }}
          >
            © {new Date().getFullYear()} {t("footer.copyright")}{" "}
            <a href="#" className="text-[#00A8FF] hover:underline font-semibold">
              {t("footer.poweredby")}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
