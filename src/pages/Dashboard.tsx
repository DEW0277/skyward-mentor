import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  User,
  FileText,
  LogOut,
  AlertTriangle,
  Shield,
  Home,
} from "lucide-react";
import FullBookReader from "@/components/FullBookReader";
import CVSubmission from "@/components/CVSubmission";
import AccessCountdown from "@/components/AccessCountdown";
import DashboardBookList from "@/components/DashboardBookList";
import { useToast } from "@/hooks/use-toast";

interface LeadData {
  id: string;
  full_name: string;
  age: number;
  status: "pending" | "approved" | "blocked";
  access_until: string | null;
  has_cv_submitted: boolean;
}

const Dashboard = () => {
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("book");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);

      // Get profile first
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) {
        toast({
          title: "Xatolik",
          description: "Profil topilmadi",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has a lead with approved status
      const { data: leads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "approved")
        .limit(1);

      if (error) throw error;

      if (!leads || leads.length === 0) {
        setLead(null);
      } else {
        setLead(leads[0] as LeadData);
      }
    } catch (error: unknown) {
      let errorMessage = "Xatolik yuz berdi";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast({
        title: "Xatolik",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCVSubmitted = () => {
    if (lead) {
      setLead({ ...lead, has_cv_submitted: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Check if access is still valid
  const isAccessExpired = lead?.access_until
    ? new Date(lead.access_until) < new Date()
    : true;

  if (!lead || lead.status !== "approved" || isAccessExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-amber-500/30">
          <CardContent className="pt-6"> 
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Kirish imkoni yo'q
              </h2>
              <p className="text-muted-foreground text-sm">
                {isAccessExpired
                  ? "Sizning 6 oylik kirish muddatingiz tugagan. Iltimos, qayta sotib oling."
                  : "Sizning hisobingiz hali tasdiqlanmagan yoki ruxsat berilmagan."}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Bosh sahifaga
                </Button>
                <Button variant="hero" onClick={handleLogout}>
                  Chiqish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✈️</div>
            <div>
              <h1 className="font-display font-bold text-foreground">
                Skyward Mentor
              </h1>
              <p className="text-muted-foreground text-xs">
                Xush kelibsiz, {lead.full_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Bosh sahifa
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Status */}
          <div className="space-y-6">
            {/* Access Countdown */}
            {lead.access_until && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AccessCountdown accessUntil={lead.access_until} />
              </motion.div>
            )}

            {/* CV Submission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CVSubmission
                leadId={lead.id}
                hasCvSubmitted={lead.has_cv_submitted}
                onSubmitted={handleCVSubmitted}
              />
            </motion.div>

            {/* Additional Files */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <DashboardBookList />
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="w-4 h-4 text-gold" />
                    Sizning ma'lumotlaringiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ism:</span>
                    <span className="text-foreground font-medium">
                      {lead.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yosh:</span>
                    <span className="text-foreground font-medium">
                      {lead.age}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500 font-medium">
                      ✓ Tasdiqlangan
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content - Book Reader */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold" />
                    Kitobni o'qish
                  </CardTitle>
                  <CardDescription>
                    Sahifalarni bosing yoki suring. Telefoningizda ham qulay
                    ishlaydi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FullBookReader />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
