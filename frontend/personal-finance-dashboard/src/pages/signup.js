import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase'; // Correct path as confirmed
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth'; // Import signOut
import useStore from '../app/store/useStore';  // Import Zustand store for theme management

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const { isDarkMode } = useStore(); // Zustand state for dark mode

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
      if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  // Handle Google signup
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, provider);
      // No need to redirect here since useEffect will handle it
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing the sign-in.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled.');
      } else {
        setError('An error occurred during Google sign-in. Please try again.');
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className={`max-w-md w-full p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-300 text-black'}`}>
        <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-md cursor-pointer ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            Sign Up with Email
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className={`w-full cursor-pointer mt-4 py-3 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'} transition-colors border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          Sign Up with Google
        </button>

        <p className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <Link href="/" className="text-blue-500 hover:underline cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
