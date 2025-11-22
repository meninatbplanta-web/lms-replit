import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonWithProgress } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

interface LessonTimelineProps {
  lessons: LessonWithProgress[];
  courseSlug: string;
  moduleId: string;
}

export function LessonTimeline({ lessons, courseSlug, moduleId }: LessonTimelineProps) {
  return (
    <div className="space-y-1">
      {lessons.map((lesson, index) => {
        const isLocked = lesson.isLocked;
        const isCompleted = lesson.completed;

        return isLocked ? (
          <div key={lesson.id}>
            <div
              className={cn(
                "flex items-start gap-4 p-4 rounded-md transition-all",
                !isLocked && "hover-elevate cursor-pointer",
                isLocked && "cursor-not-allowed opacity-60"
              )}
              data-testid={`lesson-item-${index + 1}`}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    !isCompleted && !isLocked && "border-muted bg-background",
                    isLocked && "border-muted-foreground/30 bg-muted/20"
                  )}
                >
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-bold text-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>
                {index < lessons.length - 1 && (
                  <div className="h-8 w-0.5 bg-border my-1" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h4
                  className={cn(
                    "font-semibold text-base",
                    !isLocked && "text-foreground",
                    isLocked && "text-muted-foreground"
                  )}
                  data-testid={`text-lesson-title-${index + 1}`}
                >
                  {lesson.title}
                </h4>
                {isLocked && lesson.releaseAt && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Disponível em{" "}
                    {format(new Date(lesson.releaseAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}
                {lesson.duration && !isLocked && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {lesson.duration}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/curso/${courseSlug}/aula/${lesson.id}`} key={lesson.id}>
            <a>
              <div
                className={cn(
                  "flex items-start gap-4 p-4 rounded-md transition-all hover-elevate cursor-pointer"
                )}
                data-testid={`lesson-item-${index + 1}`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted &&
                        "bg-primary border-primary text-primary-foreground",
                      !isCompleted && "border-muted bg-background"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-bold text-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  {index < lessons.length - 1 && (
                    <div className="h-8 w-0.5 bg-border my-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h4
                    className="font-semibold text-base text-foreground"
                    data-testid={`text-lesson-title-${index + 1}`}
                  >
                    {lesson.title}
                  </h4>
                  {lesson.duration && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lesson.duration}
                    </p>
                  )}
                </div>
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
