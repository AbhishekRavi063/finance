import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase'; // Correct path as confirmed
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';  // Import signOut


export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if the user signed in with Google
        const isGoogleUser = user.providerData.some(
          (provider) => provider.providerId === 'google.com'
        );
  
        if (isGoogleUser) {
          router.push('/dashboard'); // ✅ Google users go to the dashboard
        } else {
          await signOut(auth); // ✅ Email/Password users are logged out
          router.push('/'); // ✅ Redirect email/password users to login
        }
      }
    });
  
    return () => unsubscribe();
  }, [router]);
  // Handle email/password signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // No need to redirect here since useEffect will handle it
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Google signup
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, provider);
      // No need to redirect here since useEffect will handle it
    } catch (error) {
      setError(error.message);
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign Up with Email
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
        >
          Sign Up with Google
        </button>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}