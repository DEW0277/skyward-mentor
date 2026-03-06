import { useRef, useState, useCallback, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

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

const FullBookReader = () => {
  const bookRef = useRef<IFlipBook>(null);
  const fullscreenBookRef = useRef<IFlipBook>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadPrimaryBook();
  }, []);

  // Update body overflow when fullscreen state changes
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  const loadPrimaryBook = async () => {
    try {
      // Fetch primary book metadata
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("is_primary", true)
        .maybeSingle();

      if (bookError) throw bookError;
      if (!book) {
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
      const totalPages = pdf.numPages;
      const renderedPages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2; // Keep high resolution for zoom/fullscreen
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Xatolik yuz berdi";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = useCallback((isFull = false) => {
    const ref = isFull ? fullscreenBookRef : bookRef;
    ref.current?.pageFlip()?.flipNext();
  }, []);

  const prevPage = useCallback((isFull = false) => {
    const ref = isFull ? fullscreenBookRef : bookRef;
    ref.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e: FlipEvent) => {
    setCurrentPage(e.data);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
        <p className="text-muted-foreground text-sm">Kitob yuklanmoqda...</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">
          {error || "Kitob topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center relative w-full"
    >
      {/* Top right fullscreen toggle for regular view */}
      {!isFullscreen && (
        <div className="absolute top-0 right-0 z-10 p-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
            title="To'liq ekranda o'qish"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Regular View */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8 w-full flex justify-center mt-8"
      >
        <HTMLFlipBook
          ref={bookRef}
          width={window.innerWidth < 640 ? 300 : 350}
          height={window.innerWidth < 640 ? 420 : 500}
          size="stretch"
          minWidth={280}
          maxWidth={450}
          minHeight={400}
          maxHeight={650}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl mx-auto"
          style={{}}
          startPage={currentPage}
          drawShadow={true}
          flippingTime={600}
          usePortrait={window.innerWidth < 768}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          swipeDistance={30}
          clickEventForward={true}
          useMouseEvents={true}
        >
          {pages.map((src, index) => (
            <div
              key={index}
              className="bg-white shadow-lg h-full overflow-hidden flex items-center justify-center"
            >
              <img
                src={src}
                alt={`Sahifa ${index + 1}`}
                className="w-full h-full object-contain bg-white"
                draggable={false}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </motion.div>

      {/* Regular Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => prevPage(false)}
          disabled={currentPage === 0}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          {currentPage + 1} / {pages.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => nextPage(false)}
          disabled={currentPage >= pages.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-muted-foreground/60 text-xs mt-4">
        💡 Sahifani bosib yoki suring
      </p>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          >
            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white/80 text-sm font-medium px-4 py-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                {currentPage + 1} / {pages.length} - Sahifa
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                  title="Kichraytirish"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="rounded-full bg-red-500/80 hover:bg-red-600 border-none text-white backdrop-blur-md"
                  title="Yopish"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Centered book area */}
            <div className="flex-1 w-full h-full flex items-center justify-center p-2 md:p-12 mt-12 md:mt-0 relative max-w-7xl mx-auto overflow-hidden">
              {/* Left Nav Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPage(true);
                }}
                disabled={currentPage === 0}
                className="absolute left-2 md:left-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <div className="w-full h-full flex items-center justify-center pt-8 pb-20 md:py-0">
                <HTMLFlipBook
                  ref={fullscreenBookRef}
                  width={
                    window.innerWidth < 768
                      ? window.innerWidth
                      : window.innerWidth / 2 - 100
                  }
                  height={
                    window.innerHeight < 768
                      ? window.innerHeight - 150
                      : window.innerHeight - 120
                  }
                  size="stretch"
                  minWidth={280}
                  maxWidth={800}
                  minHeight={350}
                  maxHeight={1200}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={onFlip}
                  className="shadow-2xl"
                  style={{}}
                  startPage={currentPage}
                  drawShadow={true}
                  flippingTime={600}
                  usePortrait={window.innerWidth < 768}
                  startZIndex={0}
                  autoSize={true}
                  maxShadowOpacity={0.8}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  swipeDistance={30}
                  clickEventForward={true}
                  useMouseEvents={true}
                >
                  {pages.map((src, index) => (
                    <div
                      key={index}
                      className="bg-white shadow-2xl h-full flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={src}
                        alt={`Sahifa ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                        draggable={false}
                      />
                    </div>
                  ))}
                </HTMLFlipBook>
              </div>

              {/* Right Nav Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPage(true);
                }}
                disabled={currentPage >= pages.length - 1}
                className="absolute right-2 md:right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-50 md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPage(true);
                }}
                disabled={currentPage === 0}
                className="rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPage(true);
                }}
                disabled={currentPage >= pages.length - 1}
                className="rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullBookReader;
