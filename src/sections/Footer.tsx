import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import logoFull from "../assets/logos/white full.png";

const socials = [
  {
    name: "Telegram",
    href: "https://t.me/+UfcZ4T-OmPs1NDEy",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.198 2.433a2.242 2.242 0 00-1.022.215l-16.5 6.498c-1.356.527-1.347 1.467-.243 1.812l4.232 1.322 1.64 5.04c.196.604.757.83 1.27.53l2.35-1.517 4.604 3.394c.848.468 1.458.228 1.668-.786l3.01-14.18c.291-1.175-.45-1.708-1.009-1.328zM9.5 15.5l-.4 3.9-1.5-4.6 9-5.4-7.1 6.1z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ytch.uz/",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/yosh-tadbirkorlar-chempionati/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ background: "#11121A" }}>
      <Container>
        <div className="py-12 sm:py-16 flex flex-col sm:flex-row items-start justify-between gap-10">
          {/* Logo + socials */}
          <div>
            <img
              src={logoFull}
              alt="Yosh Tadbirkorlar Chempionati"
              className="h-10 w-auto object-contain mb-4"
            />
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav section */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-4 text-white/50 tracking-widest"
              style={{ fontFamily: "var(--font-button)" }}
            >
              Bo'limlar
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Bosh sahifa", href: "#home" },
                { label: "Chempionat", href: "#about" },
                { label: "Bosqichlar", href: "#roadmap" },
                { label: "Ekspertlar", href: "#experts" },
                { label: "FAQ", href: "#faq" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ariza section */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-4 text-white/50 tracking-widest"
              style={{ fontFamily: "var(--font-button)" }}
            >
              Ariza
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Startap uchun", key: "startup" },
                { label: "G'oya uchun", key: "ideas" },
                { label: "Biznes uchun", key: "business" },
              ].map(({ label, key }) => (
                <li key={key}>
                  <button
                    onClick={() => navigate(`/forms/${key}`)}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <p
            className="text-sm text-white/50 sm:self-end"
            style={{ fontFamily: "var(--font-button)" }}
          >
            © {new Date().getFullYear()} Powered by{" "}
            <a href="#" className="text-[#00A8FF] hover:underline">
              Yoshlar ishlari agentligi
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
