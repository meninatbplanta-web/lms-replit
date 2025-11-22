import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BookOpen, GraduationCap, Users, FolderOpen, Plus, Pencil, Trash } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Lesson, Module, Course } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const menuItems = [
  { title: "Cursos", icon: BookOpen, url: "/admin/cursos" },
  { title: "Módulos", icon: FolderOpen, url: "/admin/modulos" },
  { title: "Aulas", icon: GraduationCap, url: "/admin/aulas" },
  { title: "Usuários", icon: Users, url: "/admin/usuarios" },
];

export default function AdminAulas() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    moduleId: "",
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    releaseAt: "",
    attachments: "",
    order: 0,
  });

  const { data: lessons } = useQuery<Lesson[]>({ queryKey: ["/api/admin/lessons"] });
  const { data: modules } = useQuery<Module[]>({ queryKey: ["/api/admin/modules"] });
  const { data: courses } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data, attachments: data.attachments ? data.attachments.split(",").map((s: string) => s.trim()) : [] };
      return apiRequest("POST", "/api/admin/lessons", payload);
    },
    onSuccess: () => {
      toast({ title: "Aula criada!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const payload = { ...data, attachments: data.attachments ? data.attachments.split(",").map((s: string) => s.trim()) : [] };
      return apiRequest("PUT", `/api/admin/lessons/${id}`, payload);
    },
    onSuccess: () => {
      toast({ title: "Aula atualizada!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/lessons/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Aula excluída!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
    },
  });

  const resetForm = () => {
    setFormData({ moduleId: "", title: "", description: "", videoUrl: "", duration: "", releaseAt: "", attachments: "", order: 0 });
    setEditingLesson(null);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl,
      duration: lesson.duration || "",
      releaseAt: lesson.releaseAt ? format(new Date(lesson.releaseAt), "yyyy-MM-dd'T'HH:mm") : "",
      attachments: lesson.attachments?.join(", ") || "",
      order: lesson.order,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const user = JSON.parse(localStorage.getItem("lms-user") || '{"name":"Admin"}');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location.startsWith(item.url)}>
                        <Link href={item.url}><a className="flex items-center gap-2"><item.icon className="h-4 w-4" /><span>{item.title}</span></a></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userName={user.name} showSearch={false} />
          <main className="flex-1 overflow-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold font-display">Aulas</h1>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Nova Aula</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Módulo *</Label>
                      <Select value={formData.moduleId} onValueChange={(value) => setFormData({ ...formData, moduleId: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione um módulo" /></SelectTrigger>
                        <SelectContent>
                          {modules?.map((m) => <SelectItem key={m.id} value={m.id}>{m.title} ({courses?.find(c => c.id === m.courseId)?.title})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Vídeo *</Label>
                      <Input value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duração (ex: 5:23)</Label>
                        <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Ordem</Label>
                        <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Data e Hora de Liberação *</Label>
                      <Input type="datetime-local" value={formData.releaseAt} onChange={(e) => setFormData({ ...formData, releaseAt: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Anexos (URLs separadas por vírgula)</Label>
                      <Textarea value={formData.attachments} onChange={(e) => setFormData({ ...formData, attachments: e.target.value })} placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf" />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                      <Button type="submit">Salvar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Liberação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons?.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{modules?.find(m => m.id === lesson.moduleId)?.title}</TableCell>
                    <TableCell>{lesson.releaseAt ? format(new Date(lesson.releaseAt), "dd/MM/yyyy HH:mm") : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(lesson.id)}><Trash className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
