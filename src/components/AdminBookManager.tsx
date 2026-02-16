import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Trash2,
  Edit2,
  Star,
  FileText,
  Plus,
  X,
  Save,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

const AdminBookManager = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("display_order", { ascending: true });
    if (!error && data) setBooks(data as Book[]);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !newTitle.trim()) {
      toast({
        title: "Xatolik",
        description: "Sarlavha va fayllarni tanlang",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // Sanitize filename: remove special chars, keep only alphanumeric, dots, dashes, underscores
        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.\-_]/g, "")
          .toLowerCase();
        const filePath = `${session.user.id}/${Date.now()}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from("books")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || "application/pdf",
          });

        if (uploadError) throw uploadError;

        const title =
          selectedFiles.length === 1 ? newTitle : `${newTitle} (${i + 1})`;

        const { error: insertError } = await supabase.from("books").insert({
          title,
          description: newDescription || null,
          file_path: filePath,
          file_name: sanitizedName,
          file_size: file.size,
          is_primary: books.length === 0 && i === 0,
          display_order: books.length + i,
          created_by: session.user.id,
        });

        if (insertError) throw insertError;
      }

      toast({ title: "Muvaffaqiyat", description: "Fayllar yuklandi" });
      setNewTitle("");
      setNewDescription("");
      setSelectedFiles(null);
      setShowAddForm(false);
      fetchBooks();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (book: Book) => {
    const { error: storageError } = await supabase.storage
      .from("books")
      .remove([book.file_path]);

    if (storageError) {
      toast({
        title: "Xatolik",
        description: storageError.message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (!error) {
      setBooks(books.filter((b) => b.id !== book.id));
      toast({ title: "O'chirildi" });
    }
  };

  const handleSetPrimary = async (bookId: string) => {
    // Unset all primary first
    await supabase.from("books").update({ is_primary: false }).neq("id", "");
    // Set this one as primary
    const { error } = await supabase
      .from("books")
      .update({ is_primary: true })
      .eq("id", bookId);
    if (!error) {
      setBooks(books.map((b) => ({ ...b, is_primary: b.id === bookId })));
      toast({ title: "Asosiy kitob o'rnatildi" });
    }
  };

  const handleUpdate = async (bookId: string) => {
    const { error } = await supabase
      .from("books")
      .update({ title: editTitle, description: editDescription || null })
      .eq("id", bookId);

    if (!error) {
      setBooks(
        books.map((b) =>
          b.id === bookId
            ? { ...b, title: editTitle, description: editDescription || null }
            : b,
        ),
      );
      setEditingId(null);
      toast({ title: "Yangilandi" });
    }
  };

  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditDescription(book.description || "");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <div className="animate-pulse p-4">Yuklanmoqda...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold" />
          Kitob va fayllar boshqaruvi
        </CardTitle>
        <Button
          variant={showAddForm ? "outline" : "premium"}
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <X className="w-4 h-4 mr-1" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          {showAddForm ? "Bekor qilish" : "Yangi qo'shish"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <Input
              placeholder="Sarlavha *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Tavsif (ixtiyoriy)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
            />
            <div>
              <Input
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                accept=".pdf,.doc,.docx,.epub,.txt"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bir nechta fayl tanlash mumkin (PDF, DOC, EPUB, TXT)
              </p>
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Yuklanmoqda..." : "Yuklash"}
            </Button>
          </div>
        )}

        {/* Book List */}
        {books.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Hali kitob qo'shilmagan
          </p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="border border-border rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  {editingId === book.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(book.id)}>
                          <Save className="w-3 h-3 mr-1" /> Saqlash
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Bekor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">
                          {book.title}
                        </span>
                        {book.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Asosiy
                          </Badge>
                        )}
                      </div>
                      {book.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {book.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {book.file_name} • {formatSize(book.file_size)}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== book.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!book.is_primary && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetPrimary(book.id)}
                        title="Asosiy qilish"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(book)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(book)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBookManager;
