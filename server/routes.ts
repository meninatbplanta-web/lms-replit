import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to get current user from session (simplified - no real session management)
  const getCurrentUser = (req: any) => {
    return { id: "current-user-id", name: "Luis", email: "aluno@lms.com", isAdmin: false };
  };

  // ============= Authentication =============
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      res.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // ============= Courses (Public/Student) =============
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      const activeCourses = courses.filter((c) => c.status === "active");

      // Calculate progress for each course
      const user = getCurrentUser(req);
      const userProgress = await storage.getAllUserProgress(user.id);

      const coursesWithProgress = await Promise.all(
        activeCourses.map(async (course) => {
          const modules = await storage.getModulesByCourse(course.id);
          let totalLessons = 0;
          let completedLessons = 0;

          for (const module of modules) {
            const lessons = await storage.getLessonsByModule(module.id);
            totalLessons += lessons.length;

            for (const lesson of lessons) {
              const progress = userProgress.find((p) => p.lessonId === lesson.id);
              if (progress?.completed) completedLessons++;
            }
          }

          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          return { ...course, progress };
        })
      );

      res.json(coursesWithProgress);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar cursos" });
    }
  });

  app.get("/api/courses/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const course = await storage.getCourseBySlug(slug);

      if (!course) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      // Add progress and locked status to lessons
      const user = getCurrentUser(req);
      const userProgress = await storage.getAllUserProgress(user.id);
      const now = new Date();

      let totalLessons = 0;
      let completedLessons = 0;

      const courseData = course.modules.map((module) => {
        const lessonsWithProgress = module.lessons.map((lesson) => {
          const progress = userProgress.find((p) => p.lessonId === lesson.id);
          const isLocked = new Date(lesson.releaseAt) > now;
          totalLessons++;
          if (progress?.completed) completedLessons++;

          return {
            ...lesson,
            completed: progress?.completed || false,
            rating: progress?.rating || null,
            isLocked,
          };
        });

        return { ...module, lessons: lessonsWithProgress };
      });

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      res.json({ ...course, modules: courseData, progress: progressPercent });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar curso" });
    }
  });

  // ============= Lessons =============
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const lesson = await storage.getLesson(id);

      if (!lesson) {
        return res.status(404).json({ error: "Aula não encontrada" });
      }

      const user = getCurrentUser(req);
      const progress = await storage.getUserProgress(user.id, id);

      res.json({
        ...lesson,
        completed: progress?.completed || false,
        rating: progress?.rating || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aula" });
    }
  });

  // ============= Progress =============
  app.post("/api/progress/complete", async (req, res) => {
    try {
      const { lessonId } = req.body;
      const user = getCurrentUser(req);

      const progress = await storage.upsertProgress({
        userId: user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });

      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Erro ao marcar aula como concluída" });
    }
  });

  app.post("/api/progress/rate", async (req, res) => {
    try {
      const { lessonId, rating } = req.body;
      const user = getCurrentUser(req);

      const progress = await storage.upsertProgress({
        userId: user.id,
        lessonId,
        completed: true,
        rating,
      });

      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Erro ao avaliar aula" });
    }
  });

  // ============= Comments =============
  app.get("/api/comments/:lessonId", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const comments = await storage.getCommentsByLesson(lessonId);

      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return { ...comment, userName: user?.name || "Usuário" };
        })
      );

      res.json(commentsWithUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar comentários" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const { lessonId, content } = req.body;
      const user = getCurrentUser(req);

      const comment = await storage.createComment({
        lessonId,
        userId: user.id,
        content,
      });

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar comentário" });
    }
  });

  // ============= Notes =============
  app.get("/api/notes/:lessonId", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const user = getCurrentUser(req);

      const note = await storage.getUserNote(user.id, lessonId);
      res.json(note || null);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar anotação" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const { lessonId, content } = req.body;
      const user = getCurrentUser(req);

      const note = await storage.upsertNote({
        lessonId,
        userId: user.id,
        content,
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar anotação" });
    }
  });

  // ============= Admin Stats =============
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      const modules = await storage.getAllModules();
      const lessons = await storage.getAllLessons();
      const users = await storage.getAllUsers();

      res.json({
        totalCourses: courses.length,
        totalModules: modules.length,
        totalLessons: lessons.length,
        totalUsers: users.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // ============= Admin Courses =============
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar cursos" });
    }
  });

  app.post("/api/admin/courses", async (req, res) => {
    try {
      const course = await storage.createCourse(req.body);
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar curso" });
    }
  });

  app.put("/api/admin/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const course = await storage.updateCourse(id, req.body);
      if (!course) return res.status(404).json({ error: "Curso não encontrado" });
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar curso" });
    }
  });

  app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCourse(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar curso" });
    }
  });

  // ============= Admin Modules =============
  app.get("/api/admin/modules", async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar módulos" });
    }
  });

  app.post("/api/admin/modules", async (req, res) => {
    try {
      const module = await storage.createModule(req.body);
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar módulo" });
    }
  });

  app.put("/api/admin/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const module = await storage.updateModule(id, req.body);
      if (!module) return res.status(404).json({ error: "Módulo não encontrado" });
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar módulo" });
    }
  });

  app.delete("/api/admin/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteModule(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar módulo" });
    }
  });

  // ============= Admin Lessons =============
  app.get("/api/admin/lessons", async (req, res) => {
    try {
      const lessons = await storage.getAllLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aulas" });
    }
  });

  app.post("/api/admin/lessons", async (req, res) => {
    try {
      const lessonData = {
        ...req.body,
        releaseAt: new Date(req.body.releaseAt),
      };
      const lesson = await storage.createLesson(lessonData);
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar aula" });
    }
  });

  app.put("/api/admin/lessons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const lessonData = {
        ...req.body,
        releaseAt: new Date(req.body.releaseAt),
      };
      const lesson = await storage.updateLesson(id, lessonData);
      if (!lesson) return res.status(404).json({ error: "Aula não encontrada" });
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar aula" });
    }
  });

  app.delete("/api/admin/lessons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLesson(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar aula" });
    }
  });

  // ============= Admin Users =============
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
