import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Treinamentos from "@/pages/treinamentos";
import Curso from "@/pages/curso";
import Aula from "@/pages/aula";
import AdminDashboard from "@/pages/admin/index";
import AdminCursos from "@/pages/admin/cursos";
import AdminModulos from "@/pages/admin/modulos";
import AdminAulas from "@/pages/admin/aulas";
import AdminUsuarios from "@/pages/admin/usuarios";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/treinamentos" component={Treinamentos} />
      <Route path="/curso/:slug" component={Curso} />
      <Route path="/curso/:slug/aula/:lessonId" component={Aula} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cursos" component={AdminCursos} />
      <Route path="/admin/modulos" component={AdminModulos} />
      <Route path="/admin/aulas" component={AdminAulas} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
