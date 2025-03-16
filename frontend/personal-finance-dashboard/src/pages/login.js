import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import useStore from '../app/store/useStore';  // Import Zustand store

export default function LoginForm({ onGoogleSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const { isDarkMode, setDarkMode } = useStore(); // Zustand state

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);  // Toggle between true and false
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className={`max-w-md w-full p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-300 text-black'}`}>
        <h1 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`mt-1 w-full px-4 py-3 border rounded-md ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
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
              className={`mt-1 w-full px-4 py-3 border rounded-md ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-900 p-2 rounded-md border border-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} rounded-md cursor-pointer`}
          >
            Login with Email
          </button>
        </form>

        <button
          onClick={onGoogleSignIn}
          className={`w-full flex items-center justify-center gap-2 mt-4 py-3 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'} rounded-md cursor-pointer border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          Login with Google
        </button>

        <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
