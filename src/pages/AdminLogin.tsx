import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Lock, Mail, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      setError("Email yoki parol noto'g'ri");
      setLoading(false);
      return;
    }

    try {
      // Admin might not exist in Supabase auth yet, so we try signing in, 
      // if it fails with Invalid login credentials, we sign them up.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
           const { error: signUpError } = await supabase.auth.signUp({
             email: adminEmail,
             password: adminPassword,
           });
           if (signUpError) {
             setError(signUpError.message);
             setLoading(false);
             return;
           }
        } else {
           setError(authError.message);
           setLoading(false);
           return;
        }
      }

      navigate("/admin-dashboard");
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-gold" />
              <span className="font-display text-xl font-bold text-foreground">
                Skyward Admin
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin panelga kirish
            </h1>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
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
                  required
                />
              </div>
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full bg-gold hover:bg-gold/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
