import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Index from "./pages/Index";
import PlaneAnimation from "./components/PlaneAnimation";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Purchase from "./pages/Purchase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent copy and cut
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Prevent specific keyboard shortcuts (like PrintScreen, Ctrl+C, Cmd+C, Cmd+Shift+3/4/5)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        // We can't actually stop the OS action, but we can copy empty text to clipboard to try and override it if they try to paste
        navigator.clipboard.writeText("");
      }

      // Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
      }

      // Mac screenshot shortcuts (Cmd+Shift+3/4/5)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "3" || e.key === "4" || e.key === "5")
      ) {
        navigator.clipboard.writeText("");
      }

      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
      }
    };

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibilityChange = () => setIsBlurred(document.hidden);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      {isBlurred && (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Xavfsizlik tizimi
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Avtorlik huquqlarini himoya qilish maqsadida, ilovadan nusxa olish
            va skrinshot qilish cheklangan.
          </p>
        </div>
      )}
      <div
        className={
          isBlurred ? "blur-md pointer-events-none select-none opacity-50" : ""
        }
      >
        <PlaneAnimation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
