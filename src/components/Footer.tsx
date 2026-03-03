import { motion } from "framer-motion";
import { Plane, Instagram, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-gold" />
            <span className="font-display text-lg font-bold text-primary-foreground">
              Skyward Mentor
            </span>
          </div>

          <p className="text-primary-foreground/50 text-sm text-center">
            © 2025 Skyward Mentor. Barcha huquqlar himoyalangan.
          </p>

          <div className="flex items-center gap-4">
            <a
              target="_blank"
              href="https://www.instagram.com/shohruh_abdulazizov_"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
            >
              <Instagram className="w-5 h-5 text-primary-foreground/70" />
            </a>
            <a
              target="_blank"
              href="https://t.me/shohruh_mentor"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
            >
              <Send className="w-5 h-5 text-primary-foreground/70" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
