import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TaskSubmission from './pages/TaskSubmission';
import AllTasks from './pages/AllTasks';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import Docs from './pages/Docs';
import SupporterDashboard from './pages/SupporterDashboard';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Add AdminRoute component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return children;
};

// Protected routes
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/submit-task"
                element={
                  <PrivateRoute>
                    <TaskSubmission />
                  </PrivateRoute>
                }
              />
              <Route
                path="/all-tasks"
                element={
                  <PrivateRoute>
                    <AllTasks />
                  </PrivateRoute>
                }
              />
              <Route path="/docs" element={<Docs />} />
              <Route
                path="/supporter-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'supporter']}>
                    <SupporterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 