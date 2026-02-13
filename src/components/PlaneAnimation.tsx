import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Plane } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrailDot {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

interface SectionTarget {
  id: string;
  tooltip: string;
  rotation: number;
}

const SECTION_TARGETS: SectionTarget[] = [
  {
    id: "hero",
    tooltip: "🔥 Orzuingizdagi kasbga birinchi qadam!",
    rotation: 130,
  },
  {
    id: "lead-capture",
    tooltip: "📝 30 soniyada ro'yxatdan o'ting — bepul!",
    rotation: 45,
  },
  {
    id: "expert-story",
    tooltip: "👨‍✈️ 3 yillik Emirates tajribasi siz uchun!",
    rotation: -20,
  },
  {
    id: "book-features",
    tooltip: "📖 10 ta bob — har biri sizni yaqinlashtiradi!",
    rotation: 30,
  },
  {
    id: "flipbook-preview",
    tooltip: "👀 Bepul sahifalarni hoziroq varaqlab ko'ring!",
    rotation: 50,
  },
  {
    id: "bonus-section",
    tooltip: "🎁 Faqat bugun — maxsus bonuslar!",
    rotation: -30,
  },
];

const PlaneCursor = () => {
  const isMobile = useIsMobile();
  const [planePos, setPlanePos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const location = useLocation();
  const trailId = useRef(0);
  const mouseX = useRef(-100);
  const mouseY = useRef(-100);
  const currentX = useRef(-100);
  const currentY = useRef(-100);
  const animFrame = useRef<number>(0);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTrailTime = useRef(0);

  // Hide default cursor globally
  useEffect(() => {
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.id = "plane-cursor-style";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = "";
      style.remove();
    };
  }, []);

  // Track mouse
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Detect active section
  useEffect(() => {
    const sectionIds = SECTION_TARGETS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1) {
              setActiveSection(idx);
              // Show tooltip briefly on section change
              setShowTooltip(true);
              if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
              tooltipTimer.current = setTimeout(
                () => setShowTooltip(false),
                3000,
              );
            }
          }
        });
      },
      { threshold: 0.3 },
    );

    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  // Smooth follow animation
  useEffect(() => {
    const animate = () => {
      const lerp = 0.15;
      currentX.current += (mouseX.current - currentX.current) * lerp;
      currentY.current += (mouseY.current - currentY.current) * lerp;

      setPlanePos({ x: currentX.current, y: currentY.current });

      // Trail - throttled
      const now = Date.now();
      if (now - lastTrailTime.current > 40 && mouseX.current > 0) {
        lastTrailTime.current = now;
        const dot: TrailDot = {
          id: ++trailId.current,
          x: currentX.current,
          y: currentY.current,
          createdAt: now,
        };
        setTrail((prev) => [...prev.slice(-40), dot]);
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  // Clean old trail
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTrail((prev) => prev.filter((d) => now - d.createdAt < 1500));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Show tooltip on scroll into new section
  const handleScroll = useCallback(() => {
    setShowTooltip(true);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 3000);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastY);
      if (delta > 100) {
        handleScroll();
        lastY = window.scrollY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const currentTooltip = SECTION_TARGETS[activeSection]?.tooltip || "";

  if (isMobile) return null;

  // Calculate rotation based on movement direction
  const dx = mouseX.current - currentX.current;
  const dy = mouseY.current - currentY.current;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 0;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Trail */}
      {trail.map((dot) => {
        const age = (Date.now() - dot.createdAt) / 1500;
        const opacity = Math.max(0, 1 - age);
        return (
          <div
            key={dot.id}
            className="absolute rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              width: `${3 + (1 - opacity) * 3}px`,
              height: `${3 + (1 - opacity) * 3}px`,
              opacity: opacity * 0.5,
              background: `radial-gradient(circle, hsl(var(--gold) / ${opacity}), hsl(var(--gold) / ${opacity * 0.2}))`,
              boxShadow: `0 0 ${4 + (1 - opacity) * 4}px hsl(var(--gold) / ${opacity * 0.3})`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Plane cursor */}
      <div
        className="absolute"
        style={{
          left: planePos.x,
          top: planePos.y,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      >
        <Plane
          className="w-7 h-7 text-gold"
          style={{
            filter: "drop-shadow(0 0 8px hsl(var(--gold) / 0.6))",
          }}
        />
      </div>

      {/* Tooltip */}
      {currentTooltip && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: planePos.x + 22,
            top: planePos.y - 38,
            opacity: showTooltip ? 1 : 0,
            transform: showTooltip
              ? "scale(1) translateY(0)"
              : "scale(0.7) translateY(8px)",
            transformOrigin: "bottom left",
            transition:
              "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="bg-foreground/90 text-primary-foreground text-xs font-body px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm border border-gold/20">
            {currentTooltip}
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-foreground/90 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};

const PlaneAnimation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only show on home page and desktop
  if (isMobile || location.pathname !== "/") return null;

  return <PlaneCursor />;
};

export default PlaneAnimation;
