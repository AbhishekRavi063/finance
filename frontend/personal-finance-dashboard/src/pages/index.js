import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import LoginForm from './login';

export default function Home() {
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push('/dashboard'); // Redirect only if user is authenticated
      } else {
        setUser(null); // Ensure state is cleared when not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  if (loading) return <div>Loading...</div>; // Prevents UI flickering

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {user ? (
        <p>Redirecting to Dashboard...</p>
      ) : (
        <LoginForm onGoogleSignIn={handleGoogleSignIn} />
      )}
    </div>
  );
}
