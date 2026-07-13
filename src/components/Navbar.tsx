import { useEffect, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Container from "./Container";
import { useAuth } from "../contexts/AuthContext";

import logo from "../assets/logos/white full.png";

const navLinks = [
  { label: "Bosh sahifa", href: "#home" },
  { label: "Chempionat", href: "#about" },
  { label: "Bosqichlar", href: "#roadmap" },
  { label: "Ekspertlar", href: "#experts" },
  { label: "FAQ", href: "#faq" },
];

interface NavbarProps {
  onApply?: () => void;
}

const Navbar = ({ onApply: _onApply }: NavbarProps) => {
  const [activeSection, setActiveSection] = useState("#home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const isHomePage = location.pathname === "/";

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
  }, [isHomePage]);

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
        <div className="bg-[#111111]/90 backdrop-blur-md border-b md:border border-white/10 md:rounded-[12px] px-4 py-3 flex items-center justify-between shadow-lg">
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
            <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
          </Link>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isHomePage && activeSection === link.href
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
            {/* Public participants page */}
            <Link
              to="/ishtirokchilar"
              className={`px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                location.pathname === "/ishtirokchilar"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-[#00A8FF] hover:text-white hover:bg-white/5"
              }`}
            >
              Ishtirokchilar
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-[#00A8FF] hover:bg-white/5 rounded-lg transition-all duration-200 whitespace-nowrap"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 whitespace-nowrap"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <button
                onClick={handleApply}
                className="px-5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer duration-200 bg-white/5 hover:bg-white/10 border border-white/10 text-white whitespace-nowrap"
              >
                Ariza topshirish
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden gap-2 flex items-center justify-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />} Menu
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container>
          <div className="mt-2 bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-xl">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isHomePage && activeSection === link.href
                    ? "bg-white/10 text-white"
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
                  ? "bg-white/10 text-white font-semibold"
                  : "text-[#00A8FF] hover:bg-white/5"
              }`}
            >
              Ishtirokchilar
            </Link>
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-lg text-[#00A8FF] hover:bg-white/5 transition-all duration-200"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-lg text-white/80 hover:bg-white/5 transition-all duration-200"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <button
                onClick={handleApply}
                className="w-full mt-2 px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer duration-200 bg-white/5 hover:bg-white/10 text-white"
              >
                Ariza topshirish
              </button>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Navbar;
