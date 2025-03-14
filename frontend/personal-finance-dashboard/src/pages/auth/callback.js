import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createServerClient } from '@supabase/ssr';

export default function Callback({ user, session }) {
  const router = useRouter();

  useEffect(() => {
    console.log('Client-side - User:', user);
    console.log('Client-side - Session:', session);
    if (user || session) {
      router.push('/dashboard');
    }
  }, [user, session, router]);

  return <div>Loading...</div>;
}

export async function getServerSideProps({ req, res, query }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set(name, value, options) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly`);
        },
        remove(name) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0`);
        },
      },
    }
  );

  // Get the code from the query params
  const { code } = query;
  console.log('OAuth Code:', code);

  if (code) {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('Exchange Result - Data:', data);
    console.log('Exchange Error:', error);

    if (data?.session) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    if (error) {
      console.error('Code Exchange Error:', error.message);
    }
  }

  // Fallback: Check session and user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  console.log('Server-side - Session:', session);
  console.log('Session Error:', sessionError);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log('Server-side - User:', user);
  console.log('User Error:', userError);

  if (session || user) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: user ?? null,
      session: session ?? null,
    },
  };
}