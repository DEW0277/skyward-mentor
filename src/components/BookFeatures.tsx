import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Briefcase,
  Star,
  Plane,
  Heart,
  Shield,
  BookOpen,
  Camera,
  Award,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "CV tayyorlash sirlari",
    desc: "Emirates standartlariga mos professional CV yaratish",
  },
  {
    icon: MessageSquare,
    title: "Intervyu savollari",
    desc: "Eng ko'p beriladigan savollar va ideal javoblar",
  },
  {
    icon: Briefcase,
    title: "Open Day tayyorgarlik",
    desc: "Open Day va Assessment Day uchun to'liq qo'llanma",
  },
  {
    icon: Star,
    title: "Grooming standartlari",
    desc: "Tashqi ko'rinish va kiyinish qoidalari",
  },
  {
    icon: Plane,
    title: "Parvoz tajribasi",
    desc: "Real parvozlardagi vaziyatlar va yechimlar",
  },
  {
    icon: Heart,
    title: "Sog'liq talablari",
    desc: "Tibbiy ko'rik va sog'liq standartlari haqida",
  },
  {
    icon: Shield,
    title: "Xavfsizlik bilimi",
    desc: "Bort xavfsizligi bo'yicha asosiy bilimlar",
  },
  {
    icon: BookOpen,
    title: "Ingliz tili tayyorligi",
    desc: "TOEIC/IELTS va aviation English bo'yicha maslahatlar",
  },
  {
    icon: Camera,
    title: "Portfolio yaratish",
    desc: "Professional rasm va video portfolio qo'llanmasi",
  },
  {
    icon: Award,
    title: "Muvaffaqiyat strategiyasi",
    desc: "Birinchi urinishda muvaffaq bo'lish uchun reja",
  },
];

const BookFeatures = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold font-body text-sm tracking-[0.2em] uppercase">
            Kitob tarkibi
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Bu kitob sizga{" "}
            <span className="text-gradient-gold italic">nima</span> beradi?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 ta muhim bo'lim — har biri sizni orzuingizdagi kasbga bir qadam
            yaqinlashtiradi
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-xl bg-background border border-border hover:border-gold/40 hover:shadow-gold transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary group-hover:text-gold transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookFeatures;
