import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Check, Download } from "lucide-react";
import type { Lesson, CommentWithUser, Note } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Aula() {
  const [, params] = useRoute("/curso/:slug/aula/:lessonId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { slug, lessonId } = params || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");

  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", lessonId],
    enabled: !!lessonId,
  });

  const { data: comments } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/comments", lessonId],
    enabled: !!lessonId,
  });

  const { data: noteData } = useQuery<Note | null>({
    queryKey: ["/api/notes", lessonId],
    enabled: !!lessonId,
  });

  // Update note when data changes
  useEffect(() => {
    if (noteData) setNote(noteData.content);
  }, [noteData]);

  const completeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/progress/complete", { lessonId }),
    onSuccess: () => {
      toast({ title: "Aula marcada como concluída!" });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", slug] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: (stars: number) =>
      apiRequest("POST", "/api/progress/rate", { lessonId, rating: stars }),
    onSuccess: () => {
      toast({ title: "Avaliação enviada!" });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", lessonId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/comments", { lessonId, content }),
    onSuccess: () => {
      toast({ title: "Comentário adicionado!" });
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", lessonId] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/notes", { lessonId, content }),
    onSuccess: () => {
      toast({ title: "Anotação salva!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notes", lessonId] });
    },
  });

  const user = JSON.parse(localStorage.getItem("lms-user") || '{"name":"Usuário"}');

  const handleRating = (stars: number) => {
    setRating(stars);
    rateMutation.mutate(stars);
  };

  const handleSaveNote = () => {
    if (note.trim()) {
      noteMutation.mutate(note);
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={user.name} />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={user.name} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Aula não encontrada</p>
        </main>
        <Footer />
      </div>
    );
  }

  const attachments = lesson.attachments || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={user.name} showSearch={false} />

      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video and Details */}
          <div className="lg:col-span-2 space-y-8">
            <VideoPlayer url={lesson.videoUrl} title={lesson.title} />

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation(`/curso/${slug}`)}
                    data-testid="button-back-course"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao curso
                  </Button>
                  <Button
                    variant="ghost"
                    data-testid="button-next-lesson"
                  >
                    Próxima aula
                  </Button>
                </div>

                <h1 className="text-4xl font-bold mb-2 font-display" data-testid="text-lesson-title">
                  {lesson.title}
                </h1>
              </div>

              <Tabs defaultValue="descricao" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="descricao">Descrição</TabsTrigger>
                  {attachments.length > 0 && (
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="descricao" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Descrição</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {lesson.description || "Sem descrição disponível."}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {attachments.length > 0 && (
                  <TabsContent value="anexos" className="mt-6">
                    <Card>
                      <CardContent className="p-6 space-y-3">
                        {attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-md hover-elevate"
                          >
                            <Download className="h-4 w-4 text-primary" />
                            <span className="text-sm">Anexo {idx + 1}</span>
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>

              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="w-full bg-success hover:bg-success text-success-foreground"
                size="lg"
                data-testid="button-complete"
              >
                <Check className="h-5 w-5 mr-2" />
                {completeMutation.isPending ? "Salvando..." : "Concluído"}
              </Button>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Avaliação</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        disabled={rateMutation.isPending}
                        data-testid={`button-star-${star}`}
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-all",
                            star <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Comentários</h3>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Digite aqui o seu comentário"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      data-testid="input-comment"
                    />
                    <Button
                      onClick={() => comment.trim() && commentMutation.mutate(comment)}
                      disabled={commentMutation.isPending || !comment.trim()}
                      data-testid="button-submit-comment"
                    >
                      Enviar comentário
                    </Button>
                  </div>

                  <div className="space-y-4 mt-6">
                    {comments && comments.length > 0 ? (
                      comments.map((c) => (
                        <div key={c.id} className="p-4 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{c.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(c.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Ainda nenhum comentário foi registrado.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Notes */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Caderno de Anotações</h3>
                <Textarea
                  placeholder="Adicionar uma anotação..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={10}
                  data-testid="textarea-note"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={noteMutation.isPending}
                  className="w-full"
                  data-testid="button-save-note"
                >
                  {noteMutation.isPending ? "Salvando..." : "Salvar anotação"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
