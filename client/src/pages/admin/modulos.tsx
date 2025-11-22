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
import type { Module, Course } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Cursos", icon: BookOpen, url: "/admin/cursos" },
  { title: "Módulos", icon: FolderOpen, url: "/admin/modulos" },
  { title: "Aulas", icon: GraduationCap, url: "/admin/aulas" },
  { title: "Usuários", icon: Users, url: "/admin/usuarios" },
];

export default function AdminModulos() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({ courseId: "", title: "", description: "", order: 0 });

  const { data: modules } = useQuery<Module[]>({ queryKey: ["/api/admin/modules"] });
  const { data: courses } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/modules", data),
    onSuccess: () => {
      toast({ title: "Módulo criado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/admin/modules/${id}`, data),
    onSuccess: () => {
      toast({ title: "Módulo atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/modules/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Módulo excluído!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
    },
  });

  const resetForm = () => {
    setFormData({ courseId: "", title: "", description: "", order: 0 });
    setEditingModule(null);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({ courseId: module.courseId, title: module.title, description: module.description || "", order: module.order });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      updateMutation.mutate({ id: editingModule.id, data: formData });
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
              <h1 className="text-4xl font-bold font-display">Módulos</h1>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Novo Módulo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingModule ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Curso *</Label>
                      <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
                        <SelectContent>
                          {courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
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
                  <TableHead>Curso</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules?.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.title}</TableCell>
                    <TableCell>{courses?.find(c => c.id === module.courseId)?.title}</TableCell>
                    <TableCell>{module.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(module)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(module.id)}><Trash className="h-4 w-4" /></Button>
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
