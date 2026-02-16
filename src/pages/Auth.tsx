import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Mail, Lock, User, AlertCircle } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Ism kamida 2 ta belgi bo'lishi kerak").max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          setError(result.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Email yoki parol noto'g'ri");
          } else if (error.message.includes("Email not confirmed")) {
            setError(
              "Email manzilingiz tasdiqlanmagan. Iltimos, emailingizni tekshiring.",
            );
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }

        // Check if user has admin role - this will be handled by the protected route/dashboard logic
        navigate("/dashboard");
      } else {
        const result = signupSchema.safeParse({ email, password, fullName });
        if (!result.success) {
          setError(result.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            setError("Bu email allaqachon ro'yxatdan o'tgan");
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }

        // Immediate redirect to dashboard - assuming email confirmation is disabled in Supabase
        if (data.session) {
          navigate("/dashboard");
        } else {
          // Fallback just in case confirmation is still on, but we want to try to let them in or show message
          // But per requirement "Disable Email Confirmation", we expect session to be present.
          // If not, we still redirect to dashboard where they might hit a protection wall or we can just redirect.
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-background rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-gold" />
              <span className="font-display text-xl font-bold text-foreground">
                Skyward Mentor
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isLogin ? "Admin panelga kirish" : "Ro'yxatdan o'tish"}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin
                ? "Foydalanuvchilarni boshqarish uchun kiring"
                : "Yangi admin hisob yarating"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName">To'liq ism</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ismingiz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  maxLength={255}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Parol</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              variant="premium"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Yuklanmoqda..."
                : isLogin
                  ? "Kirish"
                  : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Hisob yo'qmi? Ro'yxatdan o'ting"
                : "Hisobingiz bormi? Kiring"}
            </button>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              ← Bosh sahifaga qaytish
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
