import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plane,
  User,
  Calendar,
  ArrowLeft,
  Send,
  Lock,
  Upload,
} from "lucide-react";
import { z } from "zod";
import qrCodeImg from "@/assets/payment-qr.png";
import { useToast } from "@/hooks/use-toast";

const purchaseSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ism kamida 2 ta belgi bo'lishi kerak")
    .max(100),
  username: z
    .string()
    .min(3, "Foydalanuvchi nomi kamida 3 ta belgi bo'lishi kerak")
    .max(50),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
  age: z
    .number()
    .min(16, "Yosh kamida 16 bo'lishi kerak")
    .max(65, "Yosh 65 dan oshmasligi kerak"),
});

const Purchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [price, setPrice] = useState("95000");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = purchaseSchema.safeParse({
      fullName,
      username,
      password,
      age: parseInt(age),
    });

    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    if (!receipt) {
      setError("Iltimos, to'lov chekini yuklang");
      setLoading(false);
      return;
    }

    const dummyEmail = `${username}@skyward.local`;

    try {
      // Step 1: Try to login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          // User doesn't exist or wrong password. Try sign up
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: dummyEmail,
              password: password,
              options: {
                data: {
                  full_name: fullName,
                },
              },
            });

          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
              setError("Parol noto'g'ri"); // Username exists but wrong password triggered Invalid login credentials earlier
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

      // Step 2: Save as lead
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error: insertError } = await supabase.from("leads").insert({
        full_name: result.data.fullName,
        age: result.data.age,
        user_id: session?.user.id,
      });

      if (insertError) {
        console.log("Lead insert error:", insertError.message);
      }
    } catch (err) {
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      setLoading(false);
      return;
    }

    // Yuklangan chek bilan Telegram bot orqali guruhga yuborish
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram bot token yoki chat id topilmadi.");
      // Iltimos .env faylida VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID ni sozlang
    }

    try {
      const caption = `<b>Yangi xarid so'rovi:</b>\n👤 Ism: ${result.data.fullName}\n🔗 Username: ${username}\n🔑 Parol: ${password}\n📅 Yosh: ${result.data.age}\n💰 Ta'rif: ${price} so'm`;

      const formData = new FormData();
      if (chatId) formData.append("chat_id", chatId);
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");
      formData.append("photo", receipt);

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!telegramResponse.ok) {
        throw new Error("Telegramga yuborishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Telegramga yuborishda xatolik o'z berdi. Iltimos keyinroq urinib ko'ring yoki bot sozlamalarini tekshiring.",
      );
      setLoading(false);
      return;
    }

    toast({
      title: "Muvaffaqiyatli!",
      description:
        "So'rovingiz qabul qilindi va chek yuborildi. Biz siz bilan tez orada bog'lanamiz.",
    });

    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

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
                Skyward Mentor
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Kitobni sotib olish
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Ma'lumotlaringizni kiriting va Telegram orqali bog'laning
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 flex items-center gap-2">
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Ism va familiya</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ismingiz va familiyangiz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

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

            <div>
              <Label htmlFor="age">Yoshingiz</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Yoshingizni kiriting"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="pl-10"
                  min={16}
                  max={65}
                />
              </div>
            </div>

            <div className="pt-2">
              <Label className="mb-3 block">Ta'rifni tanlang</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPrice("95000")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    price === "95000"
                      ? "border-gold bg-gold/10 text-foreground"
                      : "border-border hover:border-gold/50 text-muted-foreground"
                  }`}
                >
                  <span className="font-display font-bold text-xl">95,000</span>
                  <span className="text-xs uppercase tracking-wider">so'm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrice("195000")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    price === "195000"
                      ? "border-gold bg-gold/10 text-foreground"
                      : "border-border hover:border-gold/50 text-muted-foreground"
                  }`}
                >
                  <span className="font-display font-bold text-xl">
                    195,000
                  </span>
                  <span className="text-xs uppercase tracking-wider">so'm</span>
                </button>
              </div>
            </div>

            <div className="bg-primary-foreground/5 p-4 rounded-xl border border-border text-center space-y-4 my-2">
              <p className="text-sm text-muted-foreground">
                Iltimos, tanlagan tarfingiz bo'yicha quyidagi QR kod orqali
                to'lovni amalga oshiring
              </p>
              <div className="flex justify-center">
                <img
                  src={qrCodeImg}
                  alt="Paynet QR Code"
                  className="max-w-[200px] w-full rounded-lg shadow-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground/80">
                To'lov qilganingizdan so'ng chekni rasm tarzida yuklang
              </p>

              <div className="relative mt-4">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceipt(e.target.files[0]);
                      setError(null);
                    }
                  }}
                  className="hidden"
                />
                <Label
                  htmlFor="receipt"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold/50 transition-colors bg-background px-4"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground break-all line-clamp-2">
                      {receipt ? receipt.name : "Chekni yuklash uchun bosing"}
                    </p>
                  </div>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-[#5B172D] hover:bg-[#4A1224] text-white rounded-[16px] h-14 text-lg font-medium transition-colors shadow-none border-none"
              disabled={loading}
            >
              <Send className="w-5 h-5 mr-1" />
              {loading ? "Yuklanmoqda..." : "Yuborish"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gold hover:text-gold/80 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Purchase;
