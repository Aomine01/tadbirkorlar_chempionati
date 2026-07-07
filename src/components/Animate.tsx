import { useEffect, useState, type ReactNode, type CSSProperties } from "react";

type AnimationType = "scale" | "fade-up" | "fade" | "scale-fade";

interface AnimateProps {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

const animations: Record<
  AnimationType,
  { from: CSSProperties; to: CSSProperties }
> = {
  scale: {
    from: { transform: "scale(1.5)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
  "fade-up": {
    from: { transform: "translateY(30px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "scale-fade": {
    from: { transform: "scale(1.5)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
};

const Animate = ({
  children,
  type = "fade-up",
  delay = 0,
  duration = 1.8,
  className = "",
  style = {},
}: AnimateProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const anim = animations[type];
  const currentStyle = visible ? anim.to : anim.from;

  return (
    <div
      className={`will-change-transform ${className}`}
      style={{
        ...currentStyle,
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration * 0.7}s ease-out`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Animate;
