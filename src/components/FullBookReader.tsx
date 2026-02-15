import { useRef, useState, useCallback, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrimaryBook();
  }, []);

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
        const scale = 2;
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

  const nextPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const prevPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e: FlipEvent) => {
    setCurrentPage(e.data);
  }, []);

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
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <HTMLFlipBook
          ref={bookRef}
          width={320}
          height={450}
          size="stretch"
          minWidth={300}
          maxWidth={450}
          minHeight={420}
          maxHeight={600}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
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
            <div key={index} className="bg-background shadow-lg">
              <img
                src={src}
                alt={`Sahifa ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </HTMLFlipBook>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevPage}
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
          onClick={nextPage}
          disabled={currentPage >= pages.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-muted-foreground/60 text-xs mt-4">
        💡 Sahifani bosib yoki suring
      </p>
    </div>
  );
};

export default FullBookReader;
