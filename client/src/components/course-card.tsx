import { Card } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course & { progress?: number };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/curso/${course.slug}`}>
      <a data-testid={`link-course-${course.slug}`}>
        <Card className="group relative overflow-hidden border-0 bg-card hover-elevate transition-all duration-300 h-72">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale"
            style={{
              backgroundImage: `url(${course.coverImage})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
          </div>

          <div className="relative h-full flex flex-col justify-between p-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/20 p-4 backdrop-blur-sm">
                <PlayCircle className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Treinamento
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight font-display leading-tight">
                {course.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2">
                {course.description}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent transition-all duration-300 group-hover:h-1.5" />
        </Card>
      </a>
    </Link>
  );
}
