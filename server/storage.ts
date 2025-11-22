import {
  type User,
  type InsertUser,
  type Course,
  type InsertCourse,
  type Module,
  type InsertModule,
  type Lesson,
  type InsertLesson,
  type UserLessonProgress,
  type InsertUserLessonProgress,
  type Comment,
  type InsertComment,
  type Note,
  type InsertNote,
  type CourseWithModules,
  type ModuleWithLessons,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  // Courses
  getAllCourses(): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<CourseWithModules | undefined>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;

  // Modules
  getAllModules(): Promise<Module[]>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, module: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<void>;

  // Lessons
  getAllLessons(): Promise<Lesson[]>;
  getLessonsByModule(moduleId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<void>;

  // Progress
  getUserProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserLessonProgress[]>;
  upsertProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress>;

  // Comments
  getCommentsByLesson(lessonId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Notes
  getUserNote(userId: string, lessonId: string): Promise<Note | undefined>;
  upsertNote(note: InsertNote): Promise<Note>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private modules: Map<string, Module>;
  private lessons: Map<string, Lesson>;
  private progress: Map<string, UserLessonProgress>;
  private comments: Map<string, Comment>;
  private notes: Map<string, Note>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.lessons = new Map();
    this.progress = new Map();
    this.comments = new Map();
    this.notes = new Map();

    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      name: "Administrador",
      email: "admin@lms.com",
      password: "admin123",
      isAdmin: true,
    });

    // Create student user
    const studentId = randomUUID();
    this.users.set(studentId, {
      id: studentId,
      name: "Luis",
      email: "aluno@lms.com",
      password: "aluno123",
      isAdmin: false,
    });

    // Create courses
    const course1Id = randomUUID();
    const course1: Course = {
      id: course1Id,
      title: "Minicurso Terapeuta Analista Corporal",
      description: "Introdução aos fundamentos da Terapia Analista Corporal",
      coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop",
      slug: "minicurso-terapeuta",
      status: "active",
      order: 1,
    };
    this.courses.set(course1Id, course1);

    const course2Id = randomUUID();
    const course2: Course = {
      id: course2Id,
      title: "Formação Terapeuta Analista Corporal",
      description: "Formação completa em Terapia Analista Corporal com certificação",
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
      slug: "formacao-terapeuta",
      status: "active",
      order: 2,
    };
    this.courses.set(course2Id, course2);

    // Create modules for course 1
    const module1Id = randomUUID();
    const module1: Module = {
      id: module1Id,
      courseId: course1Id,
      title: "Primeiros passos",
      description: "Comece sua jornada aqui",
      order: 1,
    };
    this.modules.set(module1Id, module1);

    // Create lessons for module 1
    const now = new Date();
    const lessons1 = [
      {
        title: "Comece por aqui",
        description: "Link para Primeiros Passos detalhados:\n\nhttps://kibbble.so/collections/primeiros-passos-amdyegathmohxjf8u96",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "5:47",
        releaseAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        attachments: [],
        order: 1,
      },
      {
        title: "Primeiro Acesso ao SendFlow",
        description: "Como fazer seu primeiro acesso à plataforma",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "8:23",
        releaseAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        attachments: [],
        order: 2,
      },
      {
        title: "Como não ser banido 1x1",
        description: "Boas práticas para interações individuais",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "12:15",
        releaseAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        attachments: [],
        order: 3,
      },
      {
        title: "Como não ser banido Grupos",
        description: "Boas práticas para grupos",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "10:30",
        releaseAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        attachments: [],
        order: 4,
      },
      {
        title: "Conectando o WhatsApp",
        description: "Passo a passo para conectar sua conta do WhatsApp",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "6:45",
        releaseAt: now, // Available now
        attachments: [],
        order: 5,
      },
      {
        title: "Campanha",
        description: "Como criar e gerenciar campanhas efetivas",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "15:20",
        releaseAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        attachments: [],
        order: 6,
      },
      {
        title: "Criando Grupos",
        description: "Aprenda a criar e organizar grupos",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "9:10",
        releaseAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        attachments: [],
        order: 7,
      },
      {
        title: "Autenticação de 2 Fatores",
        description: "Proteja sua conta com 2FA",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "7:30",
        releaseAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        attachments: [],
        order: 8,
      },
      {
        title: "Importando Grupos",
        description: "Como importar grupos existentes",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "11:00",
        releaseAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        attachments: [],
        order: 9,
      },
      {
        title: "Desafio para Bots",
        description: "Configuração de desafios de verificação",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "8:45",
        releaseAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        attachments: [],
        order: 10,
      },
      {
        title: "Criação de Grupos Segure",
        description: "Práticas de segurança na criação de grupos",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "13:25",
        releaseAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        attachments: [],
        order: 11,
      },
    ];

    lessons1.forEach((lessonData) => {
      const lessonId = randomUUID();
      this.lessons.set(lessonId, {
        id: lessonId,
        moduleId: module1Id,
        ...lessonData,
        attachments: [],
      });
    });

    // Create module for course 2
    const module2Id = randomUUID();
    const module2: Module = {
      id: module2Id,
      courseId: course2Id,
      title: "Primeiros passos",
      description: "Fundamentos da formação",
      order: 1,
    };
    this.modules.set(module2Id, module2);

    // Create lessons for module 2
    const lessons2 = [
      {
        title: "Introdução à Formação",
        description: "Bem-vindo à formação completa",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "10:00",
        releaseAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        attachments: [],
        order: 1,
      },
      {
        title: "Fundamentos Teóricos",
        description: "Base teórica da Terapia Corporal",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "25:30",
        releaseAt: now,
        attachments: [],
        order: 2,
      },
      {
        title: "Prática Supervisionada",
        description: "Primeiras práticas com supervisão",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "45:00",
        releaseAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        attachments: [],
        order: 3,
      },
    ];

    lessons2.forEach((lessonData) => {
      const lessonId = randomUUID();
      this.lessons.set(lessonId, {
        id: lessonId,
        moduleId: module2Id,
        ...lessonData,
        attachments: [],
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id, 
      ...insertUser,
      isAdmin: insertUser.isAdmin ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).sort((a, b) => a.order - b.order);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseBySlug(slug: string): Promise<CourseWithModules | undefined> {
    const course = Array.from(this.courses.values()).find((c) => c.slug === slug);
    if (!course) return undefined;

    const modules = await this.getModulesByCourse(course.id);
    const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
      modules.map(async (module) => {
        const lessons = await this.getLessonsByModule(module.id);
        return { ...module, lessons };
      })
    );

    return { ...course, modules: modulesWithLessons };
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      id, 
      ...insertCourse,
      order: insertCourse.order ?? 0,
      status: insertCourse.status ?? 'draft',
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updated = { ...course, ...updates };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    this.courses.delete(id);
  }

  // Module methods
  async getAllModules(): Promise<Module[]> {
    return Array.from(this.modules.values());
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = randomUUID();
    const module: Module = { 
      id, 
      ...insertModule,
      order: insertModule.order ?? 0,
      description: insertModule.description ?? null,
    };
    this.modules.set(id, module);
    return module;
  }

  async updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined> {
    const module = this.modules.get(id);
    if (!module) return undefined;
    const updated = { ...module, ...updates };
    this.modules.set(id, updated);
    return updated;
  }

  async deleteModule(id: string): Promise<void> {
    this.modules.delete(id);
  }

  // Lesson methods
  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = { 
      id, 
      ...insertLesson,
      order: insertLesson.order ?? 0,
      description: insertLesson.description ?? null,
      duration: insertLesson.duration ?? null,
      attachments: insertLesson.attachments ?? [],
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    const updated = { ...lesson, ...updates };
    this.lessons.set(id, updated);
    return updated;
  }

  async deleteLesson(id: string): Promise<void> {
    this.lessons.delete(id);
  }

  // Progress methods
  async getUserProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined> {
    return Array.from(this.progress.values()).find(
      (p) => p.userId === userId && p.lessonId === lessonId
    );
  }

  async getAllUserProgress(userId: string): Promise<UserLessonProgress[]> {
    return Array.from(this.progress.values()).filter((p) => p.userId === userId);
  }

  async upsertProgress(insertProgress: InsertUserLessonProgress): Promise<UserLessonProgress> {
    const existing = await this.getUserProgress(insertProgress.userId, insertProgress.lessonId);
    if (existing) {
      const updated = { ...existing, ...insertProgress };
      this.progress.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const progress: UserLessonProgress = { 
      id, 
      ...insertProgress,
      completed: insertProgress.completed ?? false,
      completedAt: insertProgress.completedAt ?? null,
      rating: insertProgress.rating ?? null,
    };
    this.progress.set(id, progress);
    return progress;
  }

  // Comment methods
  async getCommentsByLesson(lessonId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.lessonId === lessonId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { id, ...insertComment, createdAt: new Date() };
    this.comments.set(id, comment);
    return comment;
  }

  // Note methods
  async getUserNote(userId: string, lessonId: string): Promise<Note | undefined> {
    return Array.from(this.notes.values()).find(
      (n) => n.userId === userId && n.lessonId === lessonId
    );
  }

  async upsertNote(insertNote: InsertNote): Promise<Note> {
    const existing = await this.getUserNote(insertNote.userId, insertNote.lessonId);
    if (existing) {
      const updated = { ...existing, ...insertNote, updatedAt: new Date() };
      this.notes.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const note: Note = { id, ...insertNote, updatedAt: new Date() };
    this.notes.set(id, note);
    return note;
  }
}

export const storage = new MemStorage();
