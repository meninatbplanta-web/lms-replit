import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LessonTimeline } from "@/components/lesson-timeline";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import type { CourseWithModules } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Curso() {
  const [, params] = useRoute("/curso/:slug");
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const slug = params?.slug;

  const { data: course, isLoading } = useQuery<CourseWithModules>({
    queryKey: ["/api/courses", slug],
    enabled: !!slug,
  });

  const user = JSON.parse(localStorage.getItem("lms-user") || '{"name":"Usuário"}');

  const handleContinue = () => {
    if (!course?.modules) return;

    for (const module of course.modules) {
      const firstIncomplete = module.lessons.find(
        (lesson) => !lesson.completed && !lesson.isLocked
      );
      if (firstIncomplete) {
        setLocation(`/curso/${slug}/aula/${firstIncomplete.id}`);
        return;
      }
    }
  };

  const filterLessons = (lessons: any[]) => {
    if (!searchQuery) return lessons;
    return lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (isLoading) {
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

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={user.name} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Curso não encontrado</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={user.name} showSearch={false} />

      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Course Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-48 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${course.coverImage})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white font-display">
                    {course.title}
                  </h2>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/treinamentos")}
                  className="w-full justify-start"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-primary">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <Progress value={course.progress || 0} className="h-2" />
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por título da aula"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-lesson"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-accent hover:bg-accent text-accent-foreground"
                  size="lg"
                  data-testid="button-continue"
                >
                  Continuar de onde parei
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Modules and Lessons */}
          <div className="lg:col-span-3 space-y-6">
            {course.modules.map((module) => {
              const filteredLessons = filterLessons(module.lessons);
              if (filteredLessons.length === 0 && searchQuery) return null;

              return (
                <Collapsible key={module.id} defaultOpen>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-6 hover-elevate">
                        <h3 className="text-xl font-bold font-display" data-testid={`text-module-title`}>
                          {module.title}
                        </h3>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6">
                        {module.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {module.description}
                          </p>
                        )}
                        <LessonTimeline
                          lessons={filteredLessons}
                          courseSlug={slug!}
                          moduleId={module.id}
                        />
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
