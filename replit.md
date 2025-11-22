# LMS Priscilla Moreira - Sistema de Ensino Online

## Visão Geral
Sistema LMS (Learning Management System) completo em português do Brasil para cursos de Terapia Analista Corporal. Design inspirado no SendFlow com tema escuro, destaque em amarelo e liberação progressiva de conteúdo (drip content).

## Tecnologias
- **Frontend**: React + TypeScript + Wouter + TanStack Query + Shadcn UI
- **Backend**: Express.js + In-Memory Storage
- **Styling**: Tailwind CSS com tema escuro customizado
- **Validação**: Zod + Drizzle-Zod
- **Date Handling**: date-fns com localização pt-BR

## Estrutura do Projeto

### Entidades Principais
1. **User** - Usuários do sistema (alunos e administradores)
2. **Course** - Cursos disponíveis
3. **Module** - Módulos dentro de cada curso
4. **Lesson** - Aulas individuais com vídeos e anexos
5. **UserLessonProgress** - Progresso do aluno (conclusão, avaliação)
6. **Comment** - Comentários nas aulas
7. **Note** - Anotações pessoais por aula

### Páginas do Aluno
- `/login` - Autenticação
- `/treinamentos` - Grid de cursos disponíveis
- `/curso/[slug]` - Detalhes do curso com timeline de aulas
- `/curso/[slug]/aula/[lessonId]` - Player de vídeo da aula

### Páginas Administrativas
- `/admin` - Dashboard com estatísticas
- `/admin/cursos` - CRUD de cursos
- `/admin/modulos` - CRUD de módulos
- `/admin/aulas` - CRUD de aulas (com campo datetime para liberação)
- `/admin/usuarios` - Gestão de usuários

## Funcionalidades Principais

### Drip Content (Liberação Progressiva)
- Cada aula possui campo `releaseAt` (data/hora de liberação)
- Aulas futuras aparecem com ícone de cadeado
- Sistema verifica automaticamente se `Date.now() >= releaseAt`
- Mensagem mostra quando a aula será liberada

### Sistema de Progresso
- Marcação de aulas como concluídas
- Barra de progresso amarela mostrando % do curso
- Avaliação com estrelas (1-5)
- Botão "Continuar de onde parei"

### Design System
- **Cores Primárias**: Amarelo (#FFD700) para progresso, checks e destaques
- **Cores Secundárias**: Azul para CTAs secundários
- **Background**: Quase preto (#111) com cards em cinza escuro (#1E1E1E)
- **Tipografia**: Inter para corpo, Poppins para títulos display
- **Tema**: Suporte completo a dark/light mode com localStorage

### Componentes Reutilizáveis
- `Header` - Barra superior com busca, tema toggle e avatar
- `Footer` - Rodapé com versão do sistema
- `CourseCard` - Card de curso com hover azul
- `LessonTimeline` - Timeline vertical de aulas com checks amarelos
- `VideoPlayer` - Player responsivo (YouTube, Vimeo ou MP4)
- `ThemeProvider` - Gerenciamento de tema claro/escuro

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Cursos (Aluno)
- `GET /api/courses` - Lista cursos ativos
- `GET /api/courses/:slug` - Detalhes do curso com módulos e aulas

### Aulas (Aluno)
- `GET /api/lessons/:id` - Detalhes da aula

### Progresso
- `POST /api/progress/complete` - Marcar aula como concluída
- `POST /api/progress/rate` - Avaliar aula (1-5 estrelas)

### Comentários e Notas
- `GET /api/comments/:lessonId` - Comentários da aula
- `POST /api/comments` - Adicionar comentário
- `GET /api/notes/:lessonId` - Anotações do aluno
- `POST /api/notes` - Salvar anotação

### Admin CRUD
- `GET/POST /api/admin/courses` - Listar/criar cursos
- `PUT/DELETE /api/admin/courses/:id` - Atualizar/deletar curso
- Endpoints similares para modules, lessons, users

## Seed Data Inicial
Dois cursos pré-cadastrados:
1. **Minicurso Terapeuta Analista Corporal**
2. **Formação Terapeuta Analista Corporal**

Cada curso contém módulo "Primeiros passos" com aulas de exemplo com datas de liberação escalonadas.

Usuários padrão:
- **Admin**: admin@lms.com / admin123
- **Aluno**: aluno@lms.com / aluno123

## Responsividade
- Desktop (1024px+): Layout duas colunas, grid 3 colunas
- Tablet (768-1023px): Layout adaptado, grid 2 colunas
- Mobile (<768px): Coluna única, cards full-width

## Versão
LMS Priscilla Moreira – versão 1.0.0
