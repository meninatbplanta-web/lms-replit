import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CourseCard } from "@/components/course-card";
import type { Course } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Treinamentos() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const user = JSON.parse(localStorage.getItem("lms-user") || '{"name":"Usuário"}');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={user.name} />

      <main className="flex-1 container px-4 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-3 font-display" data-testid="text-page-title">
            Treinamentos
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha um curso para começar sua jornada de aprendizado
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!isLoading && courses?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              Nenhum curso disponível no momento
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
