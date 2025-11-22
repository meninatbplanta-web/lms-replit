# Design Guidelines: LMS Priscilla Moreira

## Design Approach
**Reference-Based Design**: Inspired by SendFlow training platform with dark, modern aesthetic emphasizing visual hierarchy and user progress tracking.

## Core Visual Identity

### Color System
- **Background Primary**: Near-black (#111111)
- **Surface/Cards**: Dark gray (#1E1E1E)
- **Primary Accent**: Bright yellow (#FFD700 or similar) for progress bars, checkmarks, active states
- **Secondary Accent**: Blue (#3B82F6 range) for secondary CTAs like "Continuar de onde parei"
- **Text**: White/light gray (#FFFFFF, #E5E5E5) with excellent contrast
- **Success State**: Green (#22C55E) for "Concluído" button
- **Locked State**: Gray with subtle opacity for unreleased content

### Typography
- **Headings**: Bold, sans-serif, large scale (text-3xl to text-5xl for hero elements)
- **Body**: Clean sans-serif, excellent readability (text-base to text-lg)
- **Course Titles**: All caps treatment ("AULAS EM PORTUGUÊS") for emphasis
- **Hierarchy**: 
  - H1: Course titles, page headers (text-4xl, font-bold)
  - H2: Module titles (text-2xl, font-semibold)
  - H3: Lesson titles (text-xl, font-medium)
  - Body: Descriptions, content (text-base)

### Layout System
**Spacing**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistency
- Section padding: py-12 to py-20
- Card padding: p-6 to p-8
- Component gaps: gap-4, gap-6, gap-8

## Component Library

### Navigation Bar
- Dark background with logo left-aligned
- Search icon (magnifying glass) in top right
- User avatar with name display
- Theme toggle (sun/moon icon) next to user
- Sticky positioning on scroll

### Course Cards (Grid View)
- Large cards with grayscale image backgrounds (laptop/phone imagery)
- Dark overlay for text readability
- Bold white course title
- Blue bottom border on hover (4px solid)
- Transition effects for smooth hover states
- Grid: 3 columns desktop, 2 tablet, 1 mobile

### Two-Column Layout (Course Detail Page)
**Left Column (40% width)**:
- Large course card with image
- Back button at top
- Yellow progress bar showing completion %
- Search input for lessons
- Wide blue CTA button "Continuar de onde parei"

**Right Column (60% width)**:
- Module title header
- Vertical timeline of lessons with connecting lines
- Each lesson item includes:
  - Large circle checkpoint (yellow check when completed, empty when pending)
  - Lesson number (01, 02, 03...)
  - Lesson title
  - Lock icon with "Disponível em [data]" for unreleased content

### Video Player Page
**Layout**: 70/30 split (player area / sidebar)

**Main Area**:
- Full-width responsive video player with standard controls
- Lesson title below player (text-3xl, font-bold)
- Tabbed sections: Descrição, Anexos
- Green "Concluído" button (large, prominent)
- 5-star rating system (yellow stars)
- Comments section with input field and thread display

**Sidebar**:
- "Caderno de Anotações" with textarea for notes
- Mini lesson cards (thumbnail + title) for module navigation
- Vertical scroll for long lists

### Admin Interface
- Dark sidebar navigation with icons
- Data tables with hover states
- Form layouts with clear label hierarchy
- Action buttons (Edit/Delete) with color coding
- DateTime picker for release scheduling
- Toast notifications for CRUD actions

## Images
**Hero/Feature Images**: Use grayscale photography of devices (phones, laptops) showing educational content in use. Images should have dark overlays (opacity 40-60%) for text contrast.

**Placement**:
- Course cards: Background images with text overlay
- Course detail page: Featured image in left column card
- Lesson thumbnails: Small preview images in sidebar navigation

## Responsive Behavior
- **Desktop (1024px+)**: Full two-column layouts, 3-column grids
- **Tablet (768-1023px)**: Adjusted columns, 2-column grids
- **Mobile (<768px)**: Single column stack, full-width cards, hamburger menu for admin sidebar

## Theme Toggle
- Prominent sun/moon icon in header
- Light mode: Inverted colors (#FFFFFF background, #F5F5F5 cards, dark text) while maintaining yellow accents
- Smooth transition between themes (transition-colors duration-200)
- Preference persisted via localStorage

## Micro-interactions
- Card hover: Slight scale (scale-105) + blue bottom border
- Button hover: Brightness adjustment, no background blur needed for non-image buttons
- Progress animations: Smooth width transitions for progress bars
- Check animations: Scale bounce when marking lesson complete
- Lock icons: Subtle pulse for locked content

## Footer
Simple, consistent across all pages:
- Text: "LMS Priscilla Moreira – versão 1.0.0"
- Right or center aligned
- Subdued color (#666666)
- Small text (text-sm)

## Critical UX Patterns
- Progress persistence: Always show user's current position
- Visual feedback: Yellow checks, progress bars, completion states
- Date-based access: Clear "available on" messaging for locked content
- Search functionality: Filter lessons by title within course context
- Breadcrumb navigation: Back buttons and clear hierarchy