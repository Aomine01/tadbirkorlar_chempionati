import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Tanlang...",
  error,
  className = "",
  size = "md",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isSmall = size === "sm";

  return (
    <div ref={containerRef} className={`relative ${isSmall ? "w-fit" : "w-full"} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white/5 border rounded-xl text-white text-left outline-none transition-all duration-200 focus:border-[#00A8FF]/60 cursor-pointer ${
          isSmall ? "px-3 py-1.5 text-xs gap-2" : "px-4 py-3 text-sm gap-3"
        } ${error ? "border-red-500/50" : "border-white/10"}`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        <span className={selectedOption ? "text-white" : "text-white/30"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={isSmall ? 13 : 16} className={`text-white/40 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0a0a0b] border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl max-h-60 overflow-y-auto min-w-[200px]">
          {normalizedOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left transition-colors cursor-pointer ${
                isSmall ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
              } ${
                opt.value === value
                  ? "bg-[#00A8FF]/20 text-[#00A8FF] font-medium"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
