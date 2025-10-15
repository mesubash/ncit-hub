export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "student" | "faculty" | "admin";
          user_type: "bachelor_student" | "master_student" | "faculty" | null;
          department: string | null;
          program_type: "bachelor" | "master" | null;
          semester: number | null;
          year: number | null;
          specialization: string | null;
          bio: string | null;
          social_links: JSON | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "student" | "faculty" | "admin";
          user_type?: "bachelor_student" | "master_student" | "faculty" | null;
          department?: string | null;
          program_type?: "bachelor" | "master" | null;
          semester?: number | null;
          year?: number | null;
          specialization?: string | null;
          bio?: string | null;
          social_links?: JSON | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "student" | "faculty" | "admin";
          user_type?: "bachelor_student" | "master_student" | "faculty" | null;
          department?: string | null;
          program_type?: "bachelor" | "master" | null;
          semester?: number | null;
          year?: number | null;
          specialization?: string | null;
          bio?: string | null;
          social_links?: JSON | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          author_id: string;
          category_id: string | null;
          tags: string[];
          images: string[];
          featured_image: string | null;
          status: "draft" | "published" | "archived" | "pending";
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          rejection_reason: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          author_id: string;
          category_id?: string | null;
          tags?: string[];
          images?: string[];
          featured_image?: string | null;
          status?: "draft" | "published" | "archived" | "pending";
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string;
          category_id?: string | null;
          tags?: string[];
          images?: string[];
          featured_image?: string | null;
          status?: "draft" | "published" | "archived" | "pending";
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          rejection_reason?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          organizer_id: string;
          category_id: string | null;
          event_date: string;
          location: string;
          max_participants: number | null;
          current_participants: number;
          registration_deadline: string | null;
          images: string[];
          featured_image: string | null;
          status: "upcoming" | "ongoing" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          organizer_id: string;
          category_id?: string | null;
          event_date: string;
          location: string;
          max_participants?: number | null;
          current_participants?: number;
          registration_deadline?: string | null;
          images?: string[];
          featured_image?: string | null;
          status?: "upcoming" | "ongoing" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          organizer_id?: string;
          category_id?: string | null;
          event_date?: string;
          location?: string;
          max_participants?: number | null;
          current_participants?: number;
          registration_deadline?: string | null;
          images?: string[];
          featured_image?: string | null;
          status?: "upcoming" | "ongoing" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          blog_id: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          blog_id: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          blog_id?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          blog_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          blog_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          blog_id?: string;
          created_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          registration_date: string;
          status: "registered" | "attended" | "cancelled";
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          registration_date?: string;
          status?: "registered" | "attended" | "cancelled";
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          registration_date?: string;
          status?: "registered" | "attended" | "cancelled";
        };
      };
    };
  };
}
