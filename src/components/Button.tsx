import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outlined";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  icon?: ReactNode;
}

const Button = ({
  variant = "primary",
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center gap-3 rounded-[14px] px-6 py-3 text-base font-semibold tracking-wide transition-all duration-300 cursor-pointer";

  const fontStyle = { fontFamily: "var(--font-button)" };

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-white text-[#0a0f2c] hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] active:scale-[0.97]",
    outlined:
      "bg-black/40 text-white border border-white/40 hover:border-white/80 active:scale-[0.97] backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={fontStyle}
      {...props}
    >
      {children}
      {icon && <span className="text-lg">{icon}</span>}
    </button>
  );
};

export default Button;
