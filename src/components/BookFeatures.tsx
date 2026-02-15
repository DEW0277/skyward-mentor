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
    title: "Aviakompaniyalar",
    desc: "Qayerlarda ishlash mumkin, qaysi kompaniyalar real imkoniyat beradi va nimaga e’tibor berish kerak.",
  },
  {
    icon: MessageSquare,
    title: "Talablar",
    desc: "Sizdan nimalar talab qilinadi, qaysi joylarda mos kelasiz va qayerini yaxshilash mumkinligi haqida.",
  },
  {
    icon: Briefcase,
    title: "Hujjatlarni tayyorlash",
    desc: "Kerakli hujjatlarni qanday tayyorlash va aviakompaniyalarga to‘g‘ri topshirish bo‘yicha aniq yo‘l.",
  },
  {
    icon: Star,
    title: "CV tayyorlash sirlari",
    desc: "Aviakompaniyalarga mos professional CV qanday bo‘lishi va uni qanday yozish kerakligi.",
  },
  {
    icon: Plane,
    title: "Grooming standartlari",
    desc: "Tashqi ko‘rinish, kiyinish va mayda detallar — birinchi taassurot qanday shakllanadi.",
  },
  {
    icon: Heart,
    title: "Ingliz tili tayyorgarligi",
    desc: "Imtihon va intervyu uchun kerak bo‘ladigan ingliz tili, aviation English va foydali maslahatlar.",
  },
  {
    icon: Shield,
    title: "Imtihon kuni",
    desc: "Assessment Day qanday o‘tadi, qaysi bosqichlar bo‘ladi va ularga qanday tayyorlanish kerak.",
  },
  {
    icon: BookOpen,
    title: "Intervyu savollari",
    desc: "Eng ko‘p beriladigan savollar va ularga ideal javoblar.",
  },
  {
    icon: Camera,
    title: "Muvaffaqiyat strategiyasi",
    desc: "Birinchi urinishdayoq muvaffaqiyatli bo‘lish uchun fikrlash, harakat va yondashuvlar.",
  },
  {
    icon: Award,
    title: "Savol-javob va foydali ma’lumotlar",
    desc: "Eng ko‘p keladigan savollar, kerakli saytlar, YouTube kanallar va asqotadigan so‘zlar ro‘yxati.",
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
            Kitob haqida
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Kitobda nimalar bor?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 ta muhim bo‘lim — orzuyingizga olib boradigan aniq qadamlar
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
