import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Plane, Menu, X, UserCircle, BadgeCheck, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface LeadData {
  id: string;
  full_name: string;
  status: "pending" | "approved" | "blocked";
  tariff?: "standart" | "pro" | null;
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lead, setLead] = useState<LeadData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const fetchLeadData = async (userId: string) => {
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "approved")
        .limit(1);
      
      if (leads && leads.length > 0) {
        setLead(leads[0]);
      } else {
        setLead(null);
      }
    };

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchLeadData(session.user.id);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLeadData(session.user.id);
      } else {
        setLead(null);
      }
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
            Shohruh Mentor
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
          {user && (
            <button
              onClick={() => navigate("/dashboard")}
              className="transition-colors group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-transparent group-hover:bg-muted/10 transition-colors">
                <UserCircle
                  className={`w-7 h-7 ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
                />
                {lead && lead.status === "approved" && (
                  <>
                    <span 
                      title="Tasdiqlangan foydalanuvchi"
                      className="absolute -top-1 -right-1 bg-background rounded-full pointer-events-none p-[1px]"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                    </span>
                    <span 
                      title={lead.tariff === "pro" ? "Pro Tarif" : "Standart Tarif"}
                      className="absolute -bottom-1 -right-1 bg-background rounded-full p-[1px] pointer-events-none shadow-sm border border-border/50"
                    >
                      {lead.tariff === "pro" ? (
                        <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ) : (
                        <Star className="w-3 h-3 text-slate-400 fill-slate-400" />
                      )}
                    </span>
                  </>
                )}
              </div>
            </button>
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
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <div className="relative flex items-center">
                  <UserCircle className="w-4 h-4" />
                  {lead && lead.status === "approved" && (
                    <span className="absolute -top-1.5 -right-1.5 bg-background rounded-full p-[1px]">
                      <BadgeCheck className="w-2.5 h-2.5 text-blue-500 fill-blue-500 text-white" />
                    </span>
                  )}
                </div>
                <span>Dashboard</span>
                {lead && lead.status === "approved" && (
                  <span 
                    title={lead.tariff === "pro" ? "Pro Tarif" : "Standart Tarif"} 
                    className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted w-max px-2 py-0.5 rounded-full"
                  >
                    {lead.tariff === "pro" ? (
                      <><Crown className="w-3 h-3 text-amber-500 fill-amber-500" /> Pro</>
                    ) : (
                      <><Star className="w-3 h-3 text-slate-400 fill-slate-400" /> Standart</>
                    )}
                  </span>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
