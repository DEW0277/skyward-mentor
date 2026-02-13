import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Plane, Menu, X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane
            className={`w-5 h-5 ${scrolled ? "text-primary" : "text-gold"}`}
          />
          <span
            className={`font-display text-lg font-bold ${
              scrolled ? "text-foreground" : "text-primary-foreground"
            }`}
          >
            Skyward Mentor
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { name: "Kitob haqida", href: "#features" },
            { name: "Bonuslar", href: "#bonuses" },
            { name: "Mentor", href: "#mentor" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {item.name}
            </a>
          ))}
          <Button
            variant="hero"
            size="sm"
            onClick={() => navigate("/purchase")}
          >
            Sotib olish
          </Button>
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="transition-colors"
            >
              <UserCircle
                className={`w-7 h-7 ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
              />
            </button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Kirish
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  navigate("/auth");
                }}
              >
                Ro'yxatdan o'tish
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? (
            <X
              className={
                scrolled ? "text-foreground" : "text-primary-foreground"
              }
            />
          ) : (
            <Menu
              className={
                scrolled ? "text-foreground" : "text-primary-foreground"
              }
            />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-background border-b border-border"
        >
          <div className="container mx-auto px-6 py-4 space-y-3">
            {[
              { name: "Kitob haqida", href: "#features" },
              { name: "Bonuslar", href: "#bonuses" },
              { name: "Mentor", href: "#mentor" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <Button
              variant="hero"
              size="sm"
              className="w-full"
              onClick={() => navigate("/purchase")}
            >
              Sotib olish
            </Button>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Kirish
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
