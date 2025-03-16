import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import LoginForm from './login';
import { CircularProgress } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.replace('/dashboard'); // Use replace to prevent going back to Home after redirect
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <CircularProgress size={50} />
        <p className="mt-4 text-gray-700 font-medium">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {user ? (
        <p>Redirecting to Dashboard...</p>
      ) : (
        <LoginForm onGoogleSignIn={() => signInWithPopup(auth, provider)} />
      )}
    </div>
  );
}
