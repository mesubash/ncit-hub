import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.log(
    "Middleware: Processing request for path:",
    request.nextUrl.pathname
  );

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Middleware: Missing Supabase environment variables");
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Get the current user and check email verification
    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    
    // Public paths that don't require verification
    const publicPaths = [
      '/',
      '/login',
      '/register',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/about',
      '/contact',
      '/terms',
      '/privacy',
      '/blogs',
      '/events',
      '/auth/callback',
      '/auth/auth-code-error',
    ];

    const isPublicPath = publicPaths.some(p => path === p || path.startsWith(`${p}/`));
    const isApiRoute = path.startsWith('/api/');

    console.log("Middleware: Session refreshed", { 
      hasUser: !!user, 
      path, 
      isPublicPath,
      isApiRoute 
    });

    // If user is authenticated but email not verified
    if (user && !isPublicPath && !isApiRoute) {
      // Check profile for email verification status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Middleware: Error checking email verification:", error);
      }

      if (profile && !profile.email_verified) {
        console.log("Middleware: User email not verified, redirecting to verify-email", {
          userId: user.id,
          email: user.email,
          emailVerified: profile.email_verified
        });
        const url = request.nextUrl.clone();
        url.pathname = '/verify-email';
        url.searchParams.set('email', user.email || '');
        return NextResponse.redirect(url);
      } else if (!profile) {
        // Profile doesn't exist, also redirect to verify-email
        console.log("Middleware: No profile found for user, redirecting to verify-email");
        const url = request.nextUrl.clone();
        url.pathname = '/verify-email';
        url.searchParams.set('email', user.email || '');
        return NextResponse.redirect(url);
      }

      console.log("Middleware: User email is verified", {
        userId: user.id,
        email: user.email,
        emailVerified: profile?.email_verified
      });
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware: Error processing request:", error);
    return supabaseResponse;
  }
}
