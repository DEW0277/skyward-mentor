import { motion } from "framer-motion";
import heroImage from "@/assets/hero-aviation.jpg";
import { Button } from "@/components/ui/button";
import { Plane, ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Cabin crew professional at airport"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-6"
          >
            <Plane className="w-5 h-5 text-gold" />
            <span className="text-gold font-body text-sm tracking-[0.2em] uppercase">
              Skyward Mentor
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6">
            Osmonni zabt etishni{" "}
            <span className="text-gradient-gold italic">mutaxassisdan</span>{" "}
            o'rganing
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 font-body font-light mb-8 max-w-lg">
            Bort kuzatuvchisi bo'lishning barcha sirlari — CV tayyorlashdan
            tortib, Emirates intervyusigacha. Shohruhning 3 yillik tajribasidan
            foydalaning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl">
              Kitobni sotib olish
            </Button>
            <Button variant="heroOutline" size="xl">
              Bepul sahifalarni ko'rish
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-8 h-8 text-gold/60" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
