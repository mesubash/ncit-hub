# 🎓 NCIT Hub - College Community Platform

<div align="center">

![NCIT Hub](public/placeholder-logo.png)

**Your central destination for staying connected with campus life, academic updates, and community events at Nepal College of Information Technology (NCIT).**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](https://ncit-hub-58ko.vercel.app) • [Report Bug](https://github.com/NepalTekComm/ncit-hub/issues) • [Request Feature](https://github.com/NepalTekComm/ncit-hub/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Key Features Documentation](#key-features-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [API Routes](#api-routes)
- [Contributing](#contributing)
- [Developer Information](#developer-information)
- [Community](#community)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About The Project

NCIT Hub is a comprehensive digital platform designed to enhance communication and engagement within the Nepal College of Information Technology (NCIT) ecosystem. It serves as the digital heart of the campus community, bringing together students, faculty, staff, and visitors through shared stories, important announcements, and exciting events.

### Our Mission

At NCIT Hub, we believe that staying informed and connected is essential to making the most of your college experience. We're committed to fostering a vibrant, inclusive community where every voice matters and every story has the potential to inspire, inform, and connect us all within Nepal's premier technology institute.

### Core Values

- **Innovation**: Embracing technology and innovation, reflecting NCIT's commitment to advancing Nepal's IT sector
- **Collaboration**: Building stronger tech communities through knowledge sharing
- **Excellence**: Striving for quality in academics and community engagement

---

## ✨ Features

### 🎨 User Features

#### 📝 Blog System
- **Student Blogs**: Share experiences, insights, and knowledge
- **Admin Review System**: Quality control with approval/rejection workflow
- **Rich Text Editor**: Markdown support with live preview
- **Draft Auto-save**: Never lose your work
- **Image Uploads**: Multiple images per blog post
- **Categories & Tags**: Organize content effectively
- **Likes & Comments**: Engage with community content
  - Nested comments (3 levels deep)
  - Comment likes with optimistic updates
  - Real-time comment synchronization
- **Bookmarking**: Save blogs for later reading
  - Dedicated bookmarks page
  - Filter blogs by bookmarked status
  - One-click bookmark/unbookmark

#### 📅 Event Management
- **Event Calendar**: Discover upcoming tech fests, workshops, and seminars
- **Event Registration**: RSVP for events with participant limits
- **Event Categories**: Filter by type (Technical, Cultural, Academic, Sports)
- **Featured Events**: Highlight important campus activities
- **Event Status**: Track upcoming, ongoing, and completed events

#### 👤 User Management
- **Role-Based Access**: Student, Faculty, and Admin roles
- **User Profiles**: Personalized profiles with avatars
- **Department & Program**: Track academic affiliation
- **Change Password**: Secure password management with strength indicator
- **Email Validation**: Username minimum 3 characters validation

#### 📊 Advanced Features
- **Pagination**: Efficient data loading
  - Profile page: 5 blogs at a time
  - Blogs page: 10 blogs at a time
  - Smart pagination reset on filter changes
- **Search & Filter**: Find content quickly
  - Search by title, excerpt, or author
  - Filter by category
  - Filter by bookmark status
- **Real-time Notifications**: Stay updated with important announcements
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Seamless experience across all devices
- **SEO Optimized**: Structured data for better search visibility

### 🛡️ Admin Features

- **Blog Review Dashboard**: Approve or reject student submissions
- **Content Moderation**: Review pending blogs with feedback system
- **Event Management**: Create and manage campus events
- **User Management**: Monitor user activity and roles
- **Analytics Dashboard**: Track platform engagement
- **Category Management**: Create and manage blog categories

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering
- **[Date-fns](https://date-fns.org/)** - Date utility library

### Backend
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for images

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[Vercel](https://vercel.com/)** - Deployment platform

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git**
- A **Supabase** account ([sign up here](https://supabase.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/NepalTekComm/ncit-hub.git
cd ncit-hub
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Set up Supabase**

- Create a new project in [Supabase](https://supabase.com/)
- Navigate to **Settings** → **API** to get your credentials
- Run the database migrations:
  - Copy the contents of `supabase/final_schema.sql`
  - Paste into Supabase SQL Editor and execute

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. **Run the development server**

```bash
pnpm dev
# or
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | ✅ Yes |

---

## 📖 Usage

### For Students

1. **Register an account** with your college email
2. **Complete your profile** with department and program details
3. **Write and submit blogs** for review
4. **Bookmark blogs** you want to read later
5. **Register for events** and stay updated
6. **Engage with content** through likes and comments

### For Faculty

1. **Register with faculty role**
2. **Create and share blogs** (auto-approved)
3. **Organize events** for students
4. **Engage with student content**

### For Admins

1. **Access admin dashboard** at `/admin`
2. **Review pending blogs** at `/admin/review`
3. **Manage blog categories** and events
4. **Monitor platform activity**

---

## 📁 Project Structure

```
ncit-hub/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── auth/              # Auth callbacks
│   ├── blogs/                 # Blog pages
│   │   ├── [id]/             # Individual blog page
│   │   └── page.tsx          # Blog listing
│   ├── bookmarks/            # Bookmarks page
│   ├── events/               # Event pages
│   ├── admin/                # Admin dashboard
│   │   ├── review/           # Blog review system
│   │   ├── blogs/            # Blog management
│   │   └── events/           # Event management
│   ├── profile/              # User profile
│   ├── create-blog/          # Blog creation
│   ├── edit-blog/            # Blog editing
│   └── api/                  # API routes
│       ├── auth/             # Auth endpoints
│       └── notifications/    # Notification API
├── components/               # React components
│   ├── ui/                   # Shadcn/ui components
│   ├── blog-interactions.tsx # Blog likes & comments
│   ├── comments-section.tsx  # Comments UI
│   ├── like-button.tsx       # Reusable like button
│   ├── navigation.tsx        # Main navigation
│   ├── auth-guard.tsx        # Route protection
│   ├── markdown-renderer.tsx # Markdown display
│   └── change-password-dialog.tsx # Password change
├── lib/                      # Utility libraries
│   ├── supabase/            # Supabase clients
│   ├── auth.ts              # Authentication logic
│   ├── blog.ts              # Blog operations
│   ├── bookmarks.ts         # Bookmark operations
│   ├── comments.ts          # Comments & likes
│   ├── events.ts            # Event operations
│   ├── notifications.ts     # Notification system
│   └── seo.ts               # SEO utilities
├── contexts/                # React contexts
│   └── auth-context.tsx     # Auth state management
├── hooks/                   # Custom React hooks
│   └── use-toast.ts         # Toast notifications
├── supabase/                # Database files
│   ├── final_schema.sql     # Complete database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
└── README.md               # This file
```

---

## 🔑 Key Features Documentation

### Likes & Comments System

**Implementation**: Full nested comment system with likes

- **Database Tables**:
  - `blog_likes`: User likes on blogs
  - `comments`: Blog comments with nesting support
  - `comment_likes`: User likes on comments

- **Features**:
  - Real-time comment updates via Supabase subscriptions
  - Optimistic UI updates for instant feedback
  - 3-level nested comments
  - Edit and delete own comments
  - Like/unlike blogs and comments
  - Comment count tracking

- **Files**:
  - `/lib/comments.ts` - Core API
  - `/components/comments-section.tsx` - UI component
  - `/components/like-button.tsx` - Reusable like button
  - `/components/blog-interactions.tsx` - Wrapper component

### Bookmarking System

**Implementation**: Save and organize favorite blogs

- **Database Table**: `bookmarks` with RLS policies
- **Features**:
  - One-click bookmark/unbookmark
  - Dedicated bookmarks page at `/bookmarks`
  - Filter toggle on blogs page
  - Real-time synchronization
  - Bookmark count per blog

- **Files**:
  - `/lib/bookmarks.ts` - Core API
  - `/app/bookmarks/page.tsx` - Bookmarks page
  - `/app/blogs/page.tsx` - Blog listing with bookmarks

### Password Management

**Implementation**: Secure password change functionality

- **Features**:
  - Current password verification
  - Password strength indicator
  - Visual strength meter (red → yellow → green)
  - Real-time validation:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - Show/hide password toggles
  - Security notice about logout after change

- **Files**:
  - `/components/change-password-dialog.tsx` - UI component
  - `/lib/auth.ts` - Password change logic

### Pagination

**Implementation**: Efficient content loading with load more buttons

- **Profile Page**: Shows 5 blogs initially, load 5 more at a time
- **Blogs Page**: Shows 10 blogs initially, load 10 more at a time
- **Smart Reset**: Pagination resets when filters change
- **Features**:
  - "Load More" button with remaining count
  - "Showing X of Y" indicator
  - Smooth UX without page reload

### Email Validation

**Implementation**: Username length validation

- **Rules**: Email username (before @) must be ≥ 3 characters
- **Validation**:
  - Server-side validation on submit
  - Client-side real-time validation
  - Visual feedback (red border on error)
  - Clear error messages

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profiles extending Supabase auth
```sql
- id (UUID, PK, FK to auth.users)
- email (CITEXT, UNIQUE)
- full_name (TEXT)
- avatar_url (TEXT)
- role (TEXT: student, faculty, admin)
- user_type (TEXT: bachelor_student, master_student, faculty)
- department (TEXT)
- program_type (TEXT: bachelor, master)
- semester (INTEGER: 1-8)
- year (INTEGER: 1-2)
- bio (TEXT)
- social_links (JSONB)
```

#### `blogs`
Blog posts with rich metadata
```sql
- id (UUID, PK)
- title (TEXT)
- slug (TEXT, UNIQUE)
- content (TEXT)
- excerpt (TEXT)
- author_id (UUID, FK to profiles)
- category_id (UUID, FK to categories)
- tags (TEXT[])
- images (TEXT[])
- featured_image (TEXT)
- status (TEXT: draft, pending, published, archived)
- views (INTEGER)
- likes (INTEGER)
- rejection_reason (TEXT)
- created_at, updated_at, published_at (TIMESTAMP)
```

#### `comments`
Nested comments with likes
```sql
- id (UUID, PK)
- blog_id (UUID, FK to blogs)
- user_id (UUID, FK to profiles)
- parent_id (UUID, FK to comments, NULL for top-level)
- content (TEXT)
- likes_count (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### `bookmarks`
User bookmarks for blogs
```sql
- id (UUID, PK)
- user_id (UUID, FK to profiles)
- blog_id (UUID, FK to blogs)
- created_at (TIMESTAMP)
- UNIQUE(user_id, blog_id)
```

#### `events`
Campus events and activities
```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- organizer_id (UUID, FK to profiles)
- category_id (UUID, FK to categories)
- event_date, end_date (TIMESTAMP)
- location (TEXT)
- max_participants (INTEGER)
- current_participants (INTEGER)
- status (TEXT: upcoming, ongoing, completed, cancelled)
```

### Relationship Tables

- `blog_likes`: User likes on blogs
- `comment_likes`: User likes on comments
- `event_registrations`: User event RSVPs
- `notifications`: User notifications

### Row Level Security (RLS)

All tables implement RLS policies:
- Users can only modify their own content
- Published content is publicly readable
- Admin role has elevated permissions
- Secure by default

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**: Email-based signup with email verification
2. **Login**: Secure session management via Supabase Auth
3. **Session Persistence**: Automatic token refresh
4. **Logout**: Clean session termination

### Authorization Roles

| Role | Permissions |
|------|------------|
| **Student** | Create blogs (pending review), register for events, comment & like |
| **Faculty** | Create blogs (auto-approved), organize events, all student permissions |
| **Admin** | Review blogs, manage content, manage events, all faculty permissions |

### Protected Routes

- `/profile` - Requires authentication
- `/create-blog` - Requires student/faculty/admin role
- `/edit-blog/[id]` - Requires ownership or admin role
- `/admin/*` - Requires admin role
- `/bookmarks` - Requires authentication

---

## 🌐 API Routes

### Authentication
- `POST /api/auth/session` - Get current session
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Notifications
- `GET /api/notifications` - Fetch user notifications
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications` - Delete notification

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug
2. **Suggest Features**: Share your ideas for new features
3. **Submit Pull Requests**: Fix bugs or add features
4. **Improve Documentation**: Help make docs clearer
5. **Share Feedback**: Tell us how we can improve

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint for code linting
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

---

## 👨‍💻 Developer Information

### Lead Developer

**Subash Singh Dhami**
- BE Software Engineering
- Member of Nepal Tech Community
- Passionate about building innovative solutions for educational institutions
- Committed to fostering tech communities in Nepal

### Technology Choices

**Why Next.js?**
- Server-side rendering for better SEO
- App Router for modern routing patterns
- Built-in optimization features
- Excellent developer experience

**Why Supabase?**
- Open-source alternative to Firebase
- PostgreSQL with powerful querying
- Built-in authentication
- Real-time subscriptions
- Row Level Security for data protection

**Why TypeScript?**
- Type safety reduces bugs
- Better IDE support
- Self-documenting code
- Scales well with large codebases

### Contact

- **Email**: hello@subashsdhami.com.np
- **GitHub**: [@subashdhami](https://github.com/mesubash)
- **LinkedIn**: [Subash Singh Dhami](https://linkedin.com/in/subashsdhami)

---

## 🌟 Community

### Nepal Tech Community

This platform is proudly managed by the **Nepal Tech Community**, a vibrant network of developers, designers, entrepreneurs, and tech enthusiasts working together to advance Nepal's technology sector.

#### Our Mission
To create a thriving tech ecosystem in Nepal by connecting talented individuals, sharing knowledge, and building innovative solutions that address local and global challenges.

#### Community Impact
- 🎓 Supporting student developers
- 🎪 Organizing tech meetups and workshops
- 👨‍🏫 Mentoring emerging talent
- 💻 Promoting open source culture
- 🤝 Building bridges with industry

#### Get Involved

- **GitHub**: [github.com/nepal-tech-community](https://github.com/NepalTekComm)
- **LinkedIn**: [linkedin.com/company/nepal-tech-community](https://www.linkedin.com/company/NepalTekComm/)
- **Email**: tekcommunity@ncit.edu.np
- **Website**: [tekcommunity.ncit.edu.np](https://tekcommunity.ncit.edu.np/)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Special Thanks To

- **Nepal College of Information Technology (NCIT)** for inspiring this project
- **Nepal Tech Community** for support and collaboration
- **Supabase Team** for an amazing backend platform
- **Vercel** for hosting and deployment
- **Shadcn** for the beautiful component library
- **All Contributors** who helped build this platform

### Built With Love ❤️

This platform was built with love for the NCIT community. We hope it serves as a valuable resource for students, faculty, and staff to connect, share, and grow together.

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: support@ncithub.edu.np
- 💬 **GitHub Issues**: [Report a bug](https://github.com/nepal-tech-community/ncit-hub/issues)
- 📖 **Documentation**: [Full docs](https://github.com/nepal-tech-community/ncit-hub/wiki)
- 🌐 **Website**: [ncithub.vercel.app](https://ncit-hub-58ko.vercel.app)

---

<div align="center">

**[⬆ Back to Top](#-ncit-hub---college-community-platform)**

Made with ❤️ by the Nepal Tech Community

⭐ Star us on GitHub — it motivates us a lot!

</div>
