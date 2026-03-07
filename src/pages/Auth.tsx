import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Lock, User, AlertCircle } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  username: z
    .string()
    .min(3, "Foydalanuvchi nomi kamida 3 ta belgi bo'lishi kerak")
    .max(50),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = authSchema.safeParse({ username, password });
      if (!result.success) {
        setError(result.error.errors[0].message);
        setLoading(false);
        return;
      }

      const dummyEmail = `${username}@skyward.local`;

      // Try login first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          // Fallback to signup
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: dummyEmail,
              password: password,
              options: {
                data: {
                  full_name: username,
                },
              },
            });

          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
              setError("Parol noto'g'ri");
            } else {
              setError(signUpError.message);
            }
            setLoading(false);
            return;
          }
        } else {
          setError(authError.message);
          setLoading(false);
          return;
        }
      }

      navigate("/dashboard");
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
              Tizimga kirish
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Foydalanuvchilarni boshqarish uchun kiring
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
            <div>
              <Label htmlFor="username">Foydalanuvchi nomi</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 lowercase"
                  maxLength={50}
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
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>

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
