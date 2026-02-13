import { motion } from "framer-motion";
import expertImage from "@/assets/expert-portrait.jpg";
import { Award, MapPin, Users } from "lucide-react";

const stats = [
  { icon: Award, value: "3+", label: "Yillik tajriba" },
  { icon: MapPin, value: "Dubay", label: "Yashash joyi" },
  { icon: Users, value: "50+", label: "Muvaffaqiyatli shogirdlar" },
];

const ExpertStory = () => {
  return (
    <section id="mentor" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-burgundy">
              <img
                src={expertImage}
                alt="Shohruh - Cabin Crew Expert"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -bottom-4 -right-4 bg-gradient-gold rounded-xl p-4 shadow-gold"
            >
              <span className="font-display text-lg font-bold text-gold-foreground">
                Emirates ✦
              </span>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold font-body text-sm tracking-[0.2em] uppercase">
              Sizning mentoringiz
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              Shohruh <span className="text-gradient-gold italic">bilan</span>{" "}
              tanishing
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Men 3 yildan ortiq vaqt davomida Emirates aviakompaniyasida bort
              kuzatuvchisi sifatida ishlayman. Dubayda yashab, dunyoning 50 dan
              ortiq mamlakatlarini ko'rdim. Endi o'z tajribamni siz bilan
              bo'lishmoqchiman — bu kitob orqali.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-card border border-border"
                >
                  <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExpertStory;
