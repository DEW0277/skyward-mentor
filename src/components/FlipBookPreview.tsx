import { useRef, useState, useCallback, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, BookOpen } from "lucide-react";
import bookCover from "@/assets/book-cover.jpg";

// Page component MUST use forwardRef for react-pageflip to work
const Page = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = "" }, ref) => (
  <div ref={ref} className={`bg-background ${className}`}>
    {children}
  </div>
));
Page.displayName = "Page";

const tocItems = [
  { chapter: 1, title: "CV tayyorlash sirlari", page: 8 },
  { chapter: 2, title: "Intervyu savollari va javoblar", page: 24 },
  { chapter: 3, title: "Open Day tayyorgarlik", page: 42 },
  { chapter: 4, title: "Grooming standartlari", page: 58 },
  { chapter: 5, title: "Parvoz tajribasi", page: 72 },
  { chapter: 6, title: "Sog'liq talablari", page: 88 },
  { chapter: 7, title: "Xavfsizlik bilimi", page: 102 },
  { chapter: 8, title: "Ingliz tili tayyorligi", page: 118 },
  { chapter: 9, title: "Portfolio yaratish", page: 134 },
  { chapter: 10, title: "Muvaffaqiyat strategiyasi", page: 148 },
];

interface FlipEvent {
  data: number;
}

interface IPageFlip {
  flipNext: () => void;
  flipPrev: () => void;
}

interface IFlipBook {
  pageFlip: () => IPageFlip | null;
}

const FlipBookPreview = () => {
  const bookRef = useRef<IFlipBook>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 6;
  const navigate = useNavigate();

  const nextPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const prevPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e: FlipEvent) => {
    setCurrentPage(e.data);
  }, []);

  return (
    <section id="flipbook-preview" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold font-body text-sm tracking-[0.2em] uppercase">
            Bepul ko'rish
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Kitobni <span className="text-gradient-gold italic">varoqlang</span>
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Book Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Skyward Mentor:{" "}
                <span className="text-gold">Shohruh Mirzayev</span>
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Emirates bort kuzatuvchisi Shohruhning 3 yillik tajribasidan
                yozilgan to'liq qo'llanma. CV tayyorlashdan tortib, final
                intervyugacha — barcha sirlar bir kitobda.
              </p>
            </div>

            {/* Book Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">160+</div>
                <div className="text-muted-foreground text-sm">Sahifalar</div>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">10</div>
                <div className="text-muted-foreground text-sm">Boblar</div>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">50+</div>
                <div className="text-muted-foreground text-sm">
                  Intervyu savollari
                </div>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">6 oy</div>
                <div className="text-muted-foreground text-sm">
                  Kirish muddati
                </div>
              </div>
            </div>

            {/* TOC Preview */}
            <div className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold" />
                Mundarija
              </h4>
              <div className="space-y-2">
                {tocItems.slice(0, 5).map((item) => (
                  <div
                    key={item.chapter}
                    className="flex items-center justify-between text-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">
                        {item.chapter}
                      </span>
                      <span className="text-foreground/80 group-hover:text-gold transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {item.page}-bet
                    </span>
                  </div>
                ))}
                <div className="text-muted-foreground text-sm pt-2 border-t border-border mt-3">
                  ... va yana 5 ta bob
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - 3D Book */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center order-1 lg:order-2"
          >
            {/* 3D Book Container with perspective */}
            <div className="relative mb-8" style={{ perspective: "2000px" }}>
              {/* Book Shadow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[260px] h-[40px] bg-black/40 blur-2xl rounded-full" />

              {/* 3D Wrapper - slight tilt for 3D effect */}
              <div
                className="relative"
                style={{
                  transform: "rotateY(-8deg) rotateX(2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Book spine effect */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-900 via-amber-800 to-transparent rounded-l-sm"
                  style={{ transform: "translateZ(-2px)" }}
                />

                <HTMLFlipBook
                  ref={bookRef}
                  width={280}
                  height={400}
                  size="fixed"
                  minWidth={280}
                  maxWidth={280}
                  minHeight={400}
                  maxHeight={400}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={onFlip}
                  className="rounded-r-lg overflow-hidden"
                  style={{
                    boxShadow: `
                      0 30px 60px -20px rgba(0, 0, 0, 0.6),
                      -5px 0 15px -5px rgba(0, 0, 0, 0.3),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                    `,
                  }}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={800}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={false}
                  maxShadowOpacity={0.6}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  swipeDistance={30}
                  clickEventForward={true}
                  useMouseEvents={true}
                >
                  {/* Cover */}
                  <Page className="overflow-hidden">
                    <img
                      src={bookCover}
                      alt="Skyward Mentor Book Cover"
                      className="w-full h-full object-cover"
                    />
                  </Page>

                  {/* Title Page */}
                  <Page className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="text-gold text-4xl mb-3">✈️</div>
                    <h1 className="font-display text-xl font-bold text-foreground mb-1">
                      Skyward Mentor
                    </h1>
                    <p className="text-muted-foreground text-xs mb-4">
                      Osmonni zabt eting
                    </p>
                    <div className="w-12 h-px bg-gold/50 mb-4" />
                    <p className="text-foreground/80 text-xs italic">
                      Muallif: Shohruh
                    </p>
                    <p className="text-muted-foreground text-[10px] mt-2">
                      © 2025 Skyward Mentor
                    </p>
                  </Page>

                  {/* TOC Page 1 */}
                  <Page className="p-5 bg-amber-50/50">
                    <div className="border-b-2 border-gold/30 pb-2 mb-3">
                      <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gold" />
                        Mundarija
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {tocItems.slice(0, 5).map((item) => (
                        <div
                          key={item.chapter}
                          className="flex items-center justify-between text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                              {item.chapter}
                            </span>
                            <span className="text-foreground/80">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-[10px]">
                            {item.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Page>

                  {/* TOC Page 2 */}
                  <Page className="p-5 bg-amber-50/50">
                    <div className="border-b-2 border-gold/30 pb-2 mb-3">
                      <h2 className="font-display text-base font-bold text-foreground">
                        Mundarija (davomi)
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {tocItems.slice(5).map((item) => (
                        <div
                          key={item.chapter}
                          className="flex items-center justify-between text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                              {item.chapter}
                            </span>
                            <span className="text-foreground/80">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-[10px]">
                            {item.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Page>

                  {/* Intro Page */}
                  <Page className="p-5 bg-amber-50/50">
                    <h2 className="font-display text-base font-bold text-foreground mb-3 border-b border-gold/30 pb-2">
                      Kirish
                    </h2>
                    <p className="text-foreground/80 text-xs leading-relaxed mb-3">
                      Assalomu alaykum, aziz o'quvchi!
                    </p>
                    <p className="text-foreground/80 text-xs leading-relaxed mb-3">
                      Mening ismim Shohruh. Men 3 yildan ortiq vaqt davomida
                      Emirates aviakompaniyasida bort kuzatuvchisi sifatida
                      ishlayman.
                    </p>
                    <p className="text-foreground/80 text-xs leading-relaxed">
                      Bu kitobni yozishdan maqsadim — o'z tajribamni siz bilan
                      bo'lishish va sizga bort kuzatuvchisi bo'lish yo'lida
                      yordam berishdir...
                    </p>
                  </Page>

                  {/* Locked Page */}
                  <Page className="relative overflow-hidden bg-amber-50/50">
                    <div className="absolute inset-0 p-5">
                      <p className="text-foreground/30 text-xs leading-relaxed blur-[2px] select-none">
                        ...men har bir savolga qanday javob berish kerakligini
                        batafsil tushuntiraman. Emirates intervyusi odatda 3
                        bosqichdan iborat: Open Day, Assessment Day va Final
                        Interview. Har bir bosqichda nimalar kutilishini bilish
                        juda muhim...
                      </p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5 backdrop-blur-[1px]">
                      <div className="bg-background/95 rounded-lg p-4 text-center shadow-lg border border-border">
                        <Lock className="w-8 h-8 text-gold mx-auto mb-2" />
                        <h3 className="font-display font-bold text-foreground text-sm mb-1">
                          Qolgan 90% qism
                        </h3>
                        <p className="text-muted-foreground text-[10px] mb-3">
                          To'liq kitobni o'qish uchun sotib oling
                        </p>
                        <Button
                          variant="hero"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => navigate("/purchase")}
                        >
                          Sotib olish
                        </Button>
                      </div>
                    </div>
                  </Page>
                </HTMLFlipBook>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="rounded-full h-10 w-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <span className="text-sm text-muted-foreground min-w-[80px] text-center font-medium">
                {currentPage + 1} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className="rounded-full h-10 w-10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-muted-foreground/60 text-xs mt-4">
              💡 Sahifani bosing yoki suring
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FlipBookPreview;
