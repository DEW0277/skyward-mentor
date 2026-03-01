import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, FileCheck, Sparkles, Users, Lock } from "lucide-react";

const DEADLINE = new Date();
DEADLINE.setDate(5);
DEADLINE.setHours(23, 59, 59, 999);
if (DEADLINE.getTime() < Date.now()) {
  DEADLINE.setMonth(DEADLINE.getMonth() + 1);
}

const BonusSection = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, DEADLINE.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: "Kun" },
    { value: timeLeft.hours, label: "Soat" },
    { value: timeLeft.minutes, label: "Daqiqa" },
    { value: timeLeft.seconds, label: "Soniya" },
  ];

  return (
    <section
      id="bonuses"
      className="py-24 bg-gradient-hero relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-gold/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">
              Har oyning 1-5 sanalarida!
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Maxsus <span className="text-gradient-gold italic">bonuslar</span>
          </h2>

          {/* Bonuses */}
          <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4 mb-12">
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-6 text-left">
              <FileCheck className="w-8 h-8 text-gold mb-3" />
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">
                Shaxsiy CV tekshiruvi
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                O'z CV'ingizni to'liq tekshirtirib olish imkoniyatiga ega
                bo'lasiz
              </p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-6 text-left">
              <Users className="w-8 h-8 text-gold mb-3" />
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">
                Online Savol-Javob
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                Oyning 14-16 sanalarida umumiy maxsus online darslar (batafsil
                Telegram'da)
              </p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-6 text-left">
              <Lock className="w-8 h-8 text-gold mb-3" />
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">
                Yopiq Telegram Kanal
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                Yopiq kanalga kirish huquqi. U yerda doimiy ravishda yangiliklar
                qo'yib boriladi
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gold" />
              <span className="text-primary-foreground/80 text-sm">
                Aksiya tugashiga qolgan vaqt
              </span>
            </div>
            <div className="flex justify-center gap-3">
              {timeUnits.map((unit) => (
                <div key={unit.label} className="text-center">
                  <div className="w-16 h-16 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl flex items-center justify-center mb-1">
                    <span className="font-display text-2xl font-bold text-gold">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-primary-foreground/60 text-xs">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/purchase")}
          >
            Hozir sotib olish — Bonuslar bilan
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BonusSection;
