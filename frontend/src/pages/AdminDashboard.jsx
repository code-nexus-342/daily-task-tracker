import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Users,
  FileText,
  Upload,
  Trash2,
  Edit,
  Search,
  Download,
  X,
  Shield,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import React from 'react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const modalRef = React.useRef(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const [usersRes, tasksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/tasks/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUsers(usersRes.data.users || []);
      setTasks(tasksRes.data.tasks || []);
      
      // Extract unique files from tasks
      const allFiles = tasksRes.data.tasks.reduce((acc, task) => {
        if (Array.isArray(task.files)) {
          return [...acc, ...task.files];
        }
        return acc;
      }, []);
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle user actions
  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/${userId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`User ${action} successfully`);
      fetchData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast.error(`Failed to ${action} user. Please try again.`);
    }
  };

  // Handle task actions
  const handleTaskAction = async (taskId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`Task ${action} successfully`);
      fetchData();
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
      toast.error(`Failed to ${action} task. Please try again.`);
    }
  };

  // Handle file actions
  const handleFileAction = async (fileId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/files/${fileId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`File ${action} successfully`);
      fetchData();
    } catch (error) {
      console.error(`Failed to ${action} file:`, error);
      toast.error(`Failed to ${action} file. Please try again.`);
    }
  };

  // Filter data based on search term
  const filteredData = {
    users: users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.email?.toLowerCase() || '').includes(searchLower) ||
        (user.name?.toLowerCase() || '').includes(searchLower) ||
        (user.role?.toLowerCase() || '').includes(searchLower)
      );
    }),
    tasks: tasks.filter(task => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (task.research?.toLowerCase() || '').includes(searchLower) ||
        (task.userEmail?.toLowerCase() || '').includes(searchLower) ||
        (task.status?.toLowerCase() || '').includes(searchLower) ||
        (new Date(task.submittedAt).toLocaleDateString().toLowerCase() || '').includes(searchLower)
      );
    }),
    files: files.filter(file => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (file.name?.toLowerCase() || '').includes(searchLower) ||
        (file.type?.toLowerCase() || '').includes(searchLower) ||
        (file.size?.toString() || '').includes(searchLower)
      );
    })
  };

  // Render user list
  const renderUsers = () => (
    <div className="space-y-4">
      {filteredData.users.map(user => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{user.email}</h3>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
            <div className="flex items-center space-x-2">
              {user.role !== 'admin' && (
                <>
                  <button
                    key="promote"
                    onClick={() => handleUserAction(user.id, 'promote')}
                    className="p-2 text-blue-500 hover:text-blue-700"
                    title="Promote to Admin"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                  <button
                    key="delete"
                    onClick={() => handleUserAction(user.id, 'delete')}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Delete User"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Render task list
  const renderTasks = () => (
    <div className="space-y-4">
      {filteredData.tasks.map(task => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{task.userEmail}</h3>
              <p className="text-sm text-gray-500">
                {new Date(task.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                key="approve"
                onClick={() => handleTaskAction(task.id, 'approve')}
                className="p-2 text-green-500 hover:text-green-700"
                title="Approve Task"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <button
                key="reject"
                onClick={() => handleTaskAction(task.id, 'reject')}
                className="p-2 text-red-500 hover:text-red-700"
                title="Reject Task"
              >
                <XCircle className="h-5 w-5" />
              </button>
              <button
                key="delete"
                onClick={() => handleTaskAction(task.id, 'delete')}
                className="p-2 text-red-500 hover:text-red-700"
                title="Delete Task"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-gray-700 whitespace-pre-wrap line-clamp-2">{task.research}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Render file list
  const renderFiles = () => (
    <div className="space-y-4">
      {filteredData.files.map(file => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-500">{file.type}</p>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/download/${file.url.split('/').pop()}`}
                download={file.name}
                className="p-2 text-blue-500 hover:text-blue-700"
                title="Download File"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={() => handleFileAction(file.id, 'delete')}
                className="p-2 text-red-500 hover:text-red-700"
                title="Delete File"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`${
                    activeTab === 'tasks'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Tasks</span>
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`${
                    activeTab === 'files'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Upload className="h-5 w-5" />
                  <span>Files</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array(3).fill(null).map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {activeTab === 'users' && renderUsers()}
                  {activeTab === 'tasks' && renderTasks()}
                  {activeTab === 'files' && renderFiles()}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 