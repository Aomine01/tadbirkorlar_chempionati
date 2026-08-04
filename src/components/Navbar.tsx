import { useEffect, useState, useCallback } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Container from "./Container";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

import logoWhite from "../assets/logos/white full.png";
import logoBlue from "../assets/logos/blue-full.png";

interface NavbarProps {
  onApply?: () => void;
}

const Navbar = ({ onApply: _onApply }: NavbarProps) => {
  const [activeSection, setActiveSection] = useState("#home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const isHomePage = location.pathname === "/";
  const isLight = theme === "light";

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.roadmap"), href: "#roadmap" },
    { label: t("nav.experts"), href: "#experts" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = navLinks.map((link) => link.href.slice(1));
      let current = "#home";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = `#${section}`;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHomePage, lang]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen to navigation state when coming from other pages to scroll to section
  useEffect(() => {
    if (isHomePage && location.state && (location.state as any).scrollToSection) {
      const href = (location.state as any).scrollToSection;
      
      // Clear navigation state
      window.history.replaceState({}, document.title);

      setTimeout(() => {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          const offset = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      }, 150);
    }
  }, [isHomePage, location.state]);

  const scrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      if (isHomePage) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          const offset = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      } else {
        navigate("/", { state: { scrollToSection: href } });
      }
      setMobileOpen(false);
    },
    [isHomePage, navigate]
  );

  const handleApply = () => {
    setMobileOpen(false);
    navigate(user ? "/dashboard" : "/auth/login");
  };

  return (
    <div className="fixed top-0 md:top-4 left-0 w-full z-50 px-0 md:px-4">
      <Container size="xl">
        <div
          className={`backdrop-blur-md border-b md:border md:rounded-[12px] px-4 py-3 flex items-center justify-between shadow-lg transition-colors duration-300 ${
            isLight
              ? "bg-white/85 border-slate-200/80 text-slate-900 shadow-slate-200/50"
              : "bg-[#111111]/90 border-white/10 text-white"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
            onClick={() => {
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img
              src={isLight ? logoBlue : logoWhite}
              alt="Logo"
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isHomePage && activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? isLight
                        ? "bg-slate-200/80 text-slate-900 font-semibold"
                        : "bg-white/10 text-white font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            {/* Public participants page */}
            <Link
              to="/ishtirokchilar"
              className={`px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                location.pathname === "/ishtirokchilar"
                  ? isLight
                    ? "bg-slate-200/80 text-slate-900 font-semibold"
                    : "bg-white/10 text-white font-semibold"
                  : "text-[#00A8FF] hover:text-[#0088cc] hover:bg-blue-500/10"
              }`}
            >
              {t("nav.participants")}
            </Link>
          </nav>

          {/* Desktop Right CTA + Theme Toggle + Lang Segmented Toggle */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Segmented Toggle Switcher */}
            <div
              className={`p-1 rounded-xl border flex items-center gap-0.5 transition-all ${
                isLight
                  ? "bg-slate-100/90 border-slate-200/80"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {(["uz", "ru", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    aria-label={`Switch to ${l.toUpperCase()}`}
                    className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer uppercase ${
                      active
                        ? "bg-[#00A8FF] text-white shadow-sm shadow-blue-500/30"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isLight ? t("theme.toDark") : t("theme.toLight")}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10"
              }`}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-[#00A8FF] hover:bg-blue-500/10 rounded-lg transition-all duration-200 whitespace-nowrap"
                  >
                    {t("nav.adminPanel")}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isLight
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t("nav.dashboard")}
                </Link>
              </>
            ) : (
              <button
                onClick={handleApply}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer duration-200 border whitespace-nowrap ${
                  isLight
                    ? "bg-[#00A8FF] text-white border-[#00A8FF] hover:bg-[#0088cc] shadow-md shadow-blue-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                }`}
              >
                {t("nav.apply")}
              </button>
            )}
          </div>

          {/* Mobile buttons: Lang Toggle + Theme Toggle + Hamburger */}
          <div className="lg:hidden flex items-center gap-1.5">
            {/* Mobile Language Segmented Toggle */}
            <div
              className={`p-0.5 rounded-lg border flex items-center gap-0.5 transition-all ${
                isLight
                  ? "bg-slate-100/90 border-slate-200/80"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {(["uz", "ru", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    aria-label={`Switch to ${l.toUpperCase()}`}
                    className={`px-1.5 py-1 text-[11px] font-bold tracking-wide rounded-md transition-all cursor-pointer uppercase ${
                      active
                        ? "bg-[#00A8FF] text-white shadow-sm"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-amber-600"
                  : "bg-white/5 border-white/10 text-amber-400"
              }`}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              className={`gap-2 flex items-center justify-center px-3 py-2 border rounded-lg transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />} Menu
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container>
          <div
            className={`mt-2 backdrop-blur-md border rounded-xl p-2 shadow-xl ${
              isLight
                ? "bg-white/95 border-slate-200 text-slate-900"
                : "bg-[#111111]/95 border-white/10 text-white"
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isHomePage && activeSection === link.href
                    ? isLight
                      ? "bg-slate-200 text-slate-900 font-semibold"
                      : "bg-white/10 text-white"
                    : isLight
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/ishtirokchilar"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname === "/ishtirokchilar"
                  ? isLight
                    ? "bg-slate-200 text-slate-900 font-semibold"
                    : "bg-white/10 text-white font-semibold"
                  : "text-[#00A8FF] hover:bg-blue-500/10"
              }`}
            >
              {t("nav.participants")}
            </Link>
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-lg text-[#00A8FF] hover:bg-blue-500/10 transition-all duration-200"
                  >
                    {t("nav.adminPanel")}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isLight
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  {t("nav.dashboard")}
                </Link>
              </>
            ) : (
              <button
                onClick={handleApply}
                className={`w-full mt-2 px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer duration-200 ${
                  isLight
                    ? "bg-[#00A8FF] text-white hover:bg-[#0088cc]"
                    : "bg-white/5 hover:bg-white/10 text-white"
                }`}
              >
                {t("nav.apply")}
              </button>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Navbar;
