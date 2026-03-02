import { useRef, useState, useCallback, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

// Page component MUST use forwardRef for react-pageflip to work
const Page = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = "" }, ref) => (
  <div ref={ref} className={`bg-background shadow-lg ${className}`}>
    {children}
  </div>
));
Page.displayName = "Page";

interface FlipEvent {
  data: number;
}

interface IPageFlip {
  flipNext: () => void;
  flipPrev: () => void;
  getPageCount: () => number;
}

interface IFlipBook {
  pageFlip: () => IPageFlip | null;
}

const FlipBookPreview = () => {
  const bookRef = useRef<IFlipBook>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrimaryBook();
  }, []);

  const loadPrimaryBook = async () => {
    try {
      setLoading(true);
      // Fetch primary book metadata
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("is_primary", true)
        .maybeSingle();

      if (bookError) throw bookError;
      if (!book) {
        console.error("No primary book found");
        setError("Kitob topilmadi");
        setLoading(false);
        return;
      }

      // Download PDF from storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from("books")
        .download(book.file_path);

      if (fileError || !fileData) {
        throw new Error("PDF faylni yuklab bo'lmadi");
      }

      // Convert to ArrayBuffer and render pages
      const arrayBuffer = await fileData.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Limit to 3 pages for preview
      const previewPageCount = Math.min(pdf.numPages, 3);
      const renderedPages: string[] = [];

      for (let i = 1; i <= previewPageCount; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5; // Adjusted scale for preview
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;
        renderedPages.push(canvas.toDataURL("image/jpeg", 0.85));
      }

      setPages(renderedPages);
    } catch (err: unknown) {
      console.error("Error loading book:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Xatolik yuz berdi";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const prevPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e: FlipEvent) => {
    setCurrentPage(e.data);
  }, []);

  // Total pages = rendered pages + 1 locked page
  const totalDisplayPages = pages.length > 0 ? pages.length + 1 : 0;

  if (loading) {
    return (
      <section
        id="flipbook-preview"
        className="py-24 bg-muted/50 min-h-[600px] flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
          <p className="text-muted-foreground text-sm">Kitob yuklanmoqda...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="flipbook-preview"
        className="py-24 bg-muted/50 min-h-[400px] flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={() => loadPrimaryBook()} variant="outline">
            Qayta urinish
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="flipbook-preview"
      className="py-24 bg-muted/50 overflow-hidden"
    >
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
                <span className="text-gold">Shohruh Abdulazizov</span>
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
                <div className="text-3xl font-bold text-gold mb-1">45+</div>
                <div className="text-muted-foreground text-sm">Sahifalar</div>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">13</div>
                <div className="text-muted-foreground text-sm">Boblar</div>
              </div>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">6+</div>
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

            {/* CTA for full book */}
            <div className="bg-card/30 border border-border rounded-xl p-6 text-center lg:text-left">
              <h4 className="font-display font-bold text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2">
                <BookOpen className="w-5 h-5 text-gold" />
                To'liq kitobni o'qishni istaysizmi?
              </h4>
              <p className="text-muted-foreground text-sm mb-4">
                Hoziroq xarid qiling va muvaffaqiyat sari qadam tashlang!
              </p>
              <Button
                onClick={() => navigate("/purchase")}
                className="w-full lg:w-auto"
                variant="hero"
              >
                Sotib olish
              </Button>
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
                  {/* Dynamic Pages */}
                  {pages.map((src, index) => (
                    <Page key={index} className="overflow-hidden bg-white">
                      <img
                        src={src}
                        alt={`Sahifa ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </Page>
                  ))}

                  {/* Locked Page (The 4th page) */}
                  <Page className="relative overflow-hidden bg-amber-50/50">
                    <div className="absolute inset-0 p-5">
                      {/* Blurry text background */}
                      <p className="text-foreground/30 text-xs leading-relaxed blur-[2px] select-none break-words">
                        ...davomi uchun to'lov qiling. Ushbu kitobda siz
                        Emirates va boshqa nufuzli aviakompaniyalarga ishga
                        kirish sirlarini o'rganasiz. Intervyu jarayonlari,
                        psixologik testlar, va grooming standartlari haqida
                        batafsil ma'lumotlar... Kelajagingiz uchun sarmoya
                        kiriting va orzuingizdagi kasb eganiga aylaning. Lorem
                        ipsum dolor sit amet, consectetur adipiscing elit. Sed
                        do eiusmod tempor incididunt ut labore et dolore magna
                        aliqua.
                      </p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5 backdrop-blur-[1px]">
                      <div className="bg-background/95 rounded-lg p-4 text-center shadow-lg border border-border mx-4">
                        <Lock className="w-8 h-8 text-gold mx-auto mb-2" />
                        <h3 className="font-display font-bold text-foreground text-sm mb-1">
                          Davomini o'qish uchun
                        </h3>
                        <p className="text-muted-foreground text-[10px] mb-3">
                          To'liq kitobni xarid qiling
                        </p>
                        <Button
                          variant="hero"
                          size="sm"
                          className="text-xs h-8 w-full"
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
                {currentPage + 1} / {totalDisplayPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage >= totalDisplayPages - 1}
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
