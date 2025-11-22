import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BookOpen, GraduationCap, Users, FolderOpen, Plus, Trash } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { User } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Cursos", icon: BookOpen, url: "/admin/cursos" },
  { title: "Módulos", icon: FolderOpen, url: "/admin/modulos" },
  { title: "Aulas", icon: GraduationCap, url: "/admin/aulas" },
  { title: "Usuários", icon: Users, url: "/admin/usuarios" },
];

export default function AdminUsuarios() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", isAdmin: false });

  const { data: users } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      toast({ title: "Usuário criado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Usuário excluído!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", isAdmin: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
              <h1 className="text-4xl font-bold font-display">Usuários</h1>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail *</Label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha *</Label>
                      <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isAdmin" checked={formData.isAdmin} onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked as boolean })} />
                      <Label htmlFor="isAdmin" className="cursor-pointer">Administrador</Label>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.isAdmin ? "Administrador" : "Aluno"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(u.id)}><Trash className="h-4 w-4" /></Button>
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
