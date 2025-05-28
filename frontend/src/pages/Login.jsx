import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isProfileCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/complete-profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in result:', result); // Debug log
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      console.log('Got Firebase token:', idToken); // Debug log
      
      if (!idToken) {
        throw new Error('No Firebase token received');
      }

      // Store token in localStorage immediately
      localStorage.setItem('token', idToken);
      console.log('Stored token in localStorage:', localStorage.getItem('token')); // Debug log
      
      // Pass the Firebase token to login function
      await login(idToken);
      
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      // Clear token if login fails
      localStorage.removeItem('token');
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Daily Task
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your daily tasks
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="btn btn-primary"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 