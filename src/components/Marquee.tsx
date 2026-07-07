import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface MarqueeProps {
  children: ReactNode[];
  gap?: number;
}

const Marquee = ({ children, gap = 48 }: MarqueeProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [setWidth, setSetWidth] = useState(0);
  const dragStart = useRef(0);
  const dragOffset = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animRef = useRef<number>(0);

  const autoSpeed = 0.5;

  // Measure the width of one full set of children
  useEffect(() => {
    if (measureRef.current) {
      setSetWidth(measureRef.current.scrollWidth);
    }
  }, [children]);

  const totalWidth = setWidth || 1;

  const animate = useCallback(() => {
    if (!isDragging && totalWidth > 1) {
      if (Math.abs(velocity.current) > 0.1) {
        setOffset((prev) => {
          let next = prev - velocity.current;
          if (next <= -totalWidth) next += totalWidth;
          if (next > 0) next -= totalWidth;
          return next;
        });
        velocity.current *= 0.95;
      } else {
        velocity.current = 0;
        setOffset((prev) => {
          let next = prev - autoSpeed;
          if (next <= -totalWidth) next += totalWidth;
          return next;
        });
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }, [isDragging, totalWidth]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = e.clientX;
    dragOffset.current = offset;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocity.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (-(e.clientX - lastX.current) / dt) * 16;
    }
    lastX.current = e.clientX;
    lastTime.current = now;

    let next = dragOffset.current + dx;
    if (next <= -totalWidth) next += totalWidth;
    if (next > 0) next -= totalWidth;
    setOffset(next);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const gapStyle = { gap };

  const renderItems = (copyIndex: number) =>
    children.map((child, i) => (
      <div key={`${copyIndex}-${i}`} className="shrink-0 flex items-center justify-center select-none">
        {child}
      </div>
    ));

  return (
    <div
      className="relative overflow-hidden cursor-grab active:cursor-grabbing mx-auto"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Hidden measure element */}
      <div ref={measureRef} className="flex shrink-0 items-center absolute invisible" style={gapStyle}>
        {children.map((child, i) => (
          <div key={i} className="shrink-0 flex items-center justify-center select-none">
            {child}
          </div>
        ))}
      </div>

      <div
        ref={trackRef}
        className="flex will-change-transform items-center"
        style={{ transform: `translateX(${offset}px)`, gap }}
      >
        {renderItems(0)}
        {renderItems(1)}
        {renderItems(2)}
      </div>
    </div>
  );
};

export default Marquee;
