import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plane,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Download,
  BookOpen,
  Home,
} from "lucide-react";
import AdminBookManager from "@/components/AdminBookManager";
import { User, Session } from "@supabase/supabase-js";

interface Lead {
  id: string;
  full_name: string;
  age: number;
  status: "pending" | "approved" | "blocked";
  access_until: string | null;
  has_cv_submitted: boolean;
  cv_file_path: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "blocked"
  >("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchLeads();
    }
  }, [session]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
  };

  const updateLeadStatus = async (
    leadId: string,
    newStatus: "approved" | "blocked",
  ) => {
    setUpdating(leadId);

    const accessUntil =
      newStatus === "approved"
        ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString() // +6 months
        : null;

    const { error } = await supabase
      .from("leads")
      .update({
        status: newStatus,
        access_until: accessUntil,
      })
      .eq("id", leadId);

    if (!error) {
      setLeads(
        leads.map((lead) =>
          lead.id === leadId
            ? { ...lead, status: newStatus, access_until: accessUntil }
            : lead,
        ),
      );
    }

    setUpdating(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDownloadCV = async (cvFilePath: string, fullName: string) => {
    const { data, error } = await supabase.storage
      .from("cvs")
      .download(cvFilePath);

    if (error || !data) return;

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${fullName.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads =
    filter === "all" ? leads : leads.filter((lead) => lead.status === filter);

  const stats = {
    total: leads.length,
    pending: leads.filter((l) => l.status === "pending").length,
    approved: leads.filter((l) => l.status === "approved").length,
    blocked: leads.filter((l) => l.status === "blocked").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-gold" />
            <span className="font-display text-lg font-bold text-foreground"></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Bosh sahifa
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Jami",
              value: stats.total,
              icon: Users,
              color: "text-foreground",
            },
            {
              label: "Kutilmoqda",
              value: stats.pending,
              icon: Clock,
              color: "text-yellow-600",
            },
            {
              label: "Tasdiqlangan",
              value: stats.approved,
              icon: CheckCircle,
              color: "text-green-600",
            },
            {
              label: "Bloklangan",
              value: stats.blocked,
              icon: XCircle,
              color: "text-red-600",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            {(["all", "pending", "approved", "blocked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {f === "all"
                  ? "Barchasi"
                  : f === "pending"
                    ? "Kutilmoqda"
                    : f === "approved"
                      ? "Tasdiqlangan"
                      : "Bloklangan"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yangilash
          </Button>
        </div>

        {/* Book Manager */}
        <div className="mb-8">
          <AdminBookManager />
        </div>

        {/* Table */}
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism</TableHead>
                <TableHead>Yosh</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CV</TableHead>
                <TableHead>Kirish muddati</TableHead>
                <TableHead>Ro'yxatdan o'tgan</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Hech qanday foydalanuvchi topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.full_name}
                    </TableCell>
                    <TableCell>{lead.age} yosh</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          lead.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                            : lead.status === "blocked"
                              ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                        }`}
                      >
                        {lead.status === "pending"
                          ? "Kutilmoqda"
                          : lead.status === "approved"
                            ? "Tasdiqlangan"
                            : "Bloklangan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.has_cv_submitted && lead.cv_file_path ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadCV(lead.cv_file_path!, lead.full_name)
                          }
                          className="gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Yuklab olish
                        </Button>
                      ) : lead.has_cv_submitted ? (
                        <Badge variant="secondary">
                          <FileText className="w-3 h-3 mr-1" />
                          Yuborilgan
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.access_until
                        ? new Date(lead.access_until).toLocaleDateString(
                            "uz-UZ",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString("uz-UZ")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status !== "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateLeadStatus(lead.id, "approved")
                            }
                            disabled={updating === lead.id}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {lead.status !== "blocked" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, "blocked")}
                            disabled={updating === lead.id}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
