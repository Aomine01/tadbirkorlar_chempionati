import { useEffect, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
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
  const { user, profile } = useAuth();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const offset = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    []
  );

  const handleApply = () => {
    setMobileOpen(false);
    navigate(user ? "/dashboard" : "/auth/login");
  };

  return (
    <div className="fixed top-4 left-0 w-full z-50">
      <Container className="flex justify-between items-center">
        {/* Logo */}
        <nav className="flex items-center bg-[#111111] border border-white/10 rounded-[10px] overflow-hidden">
          <button
            className="px-3 py-2.5 rounded-[10px] transition-all cursor-pointer duration-200 bg-[#111111] hover:bg-white/5 text-white flex items-center justify-center"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
          </button>
        </nav>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center bg-[#111111] border border-white/10 rounded-[10px] overflow-hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className={`px-4 lg:px-6 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === link.href
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
            className="px-4 lg:px-6 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap text-[#00A8FF] hover:text-white hover:bg-white/5"
          >
            Ishtirokchilar
          </Link>
        </nav>

        {/* Desktop CTA */}
        <nav className="hidden md:flex items-center gap-2 bg-[#111111] border border-white/10 rounded-[10px] overflow-hidden">
          {user ? (
            <>
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2.5 text-sm font-medium text-[#00A8FF] hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/dashboard"
                className="px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <button
              onClick={handleApply}
              className="px-6 py-2.5 text-sm font-medium rounded-[10px] transition-all cursor-pointer duration-200 bg-[#111111] hover:bg-white/5 text-white whitespace-nowrap"
            >
              Ariza topshirish
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden gap-2 flex items-center justify-center px-3 py-2 bg-[#111111] border border-white/10 rounded-[10px] text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />} Menu
        </button>
      </Container>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container>
          <div className="mt-3 bg-[#111111] border border-white/10 rounded-[10px] p-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`block px-4 py-3 text-sm font-medium rounded-[8px] transition-all duration-200 ${
                  activeSection === link.href
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
              className="block px-4 py-3 text-sm font-medium rounded-[8px] text-[#00A8FF] hover:bg-white/5 transition-all duration-200"
            >
              Ishtirokchilar
            </Link>
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-[8px] text-[#00A8FF] hover:bg-white/5 transition-all duration-200"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-[8px] text-white/80 hover:bg-white/5 transition-all duration-200"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <button
                onClick={handleApply}
                className="w-full mt-2 px-4 py-3 text-sm font-medium rounded-[8px] transition-all cursor-pointer duration-200 bg-white/5 hover:bg-white/10 text-white"
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
