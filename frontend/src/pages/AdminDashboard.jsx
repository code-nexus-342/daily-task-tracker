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
  XCircle,
  File,
  Clock
} from 'lucide-react';
import React from 'react';

// Constants
const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REVIEW: 'review'
};

const STATUS_CONFIG = {
  [TASK_STATUS.PENDING]: {
    label: 'Pending',
    icon: Clock,
    color: 'blue'
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'green'
  },
  [TASK_STATUS.REVIEW]: {
    label: 'Under Review',
    icon: Search,
    color: 'yellow'
  }
};

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
  const [previewFile, setPreviewFile] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
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
      let endpoint;
      let method = 'post';

      switch (action) {
        case 'approve':
          endpoint = `${import.meta.env.VITE_API_URL}/tasks/${taskId}/approve`;
          break;
        case 'reject':
          endpoint = `${import.meta.env.VITE_API_URL}/tasks/${taskId}/reject`;
          break;
        case 'delete':
          endpoint = `${import.meta.env.VITE_API_URL}/tasks/${taskId}`;
          method = 'delete';
          break;
        default:
          throw new Error('Invalid action');
      }

      await axios({
        method,
        url: endpoint,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Task ${action}ed successfully`);
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
      const matchesSearch = (
        (task.research?.toLowerCase() || '').includes(searchLower) ||
        (task.userEmail?.toLowerCase() || '').includes(searchLower) ||
        (task.status?.toLowerCase() || '').includes(searchLower) ||
        (new Date(task.submittedAt).toLocaleDateString().toLowerCase() || '').includes(searchLower)
      );
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesStatus;
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

  // Handle file preview
  const handleFilePreview = (file) => {
    const fileType = file.type || file.mimeType;
    const previewUrl = getFilePreviewUrl(file);

    if (fileType?.startsWith('image/')) {
      setPreviewFile({ type: 'image', url: previewUrl, name: file.name });
    } else if (fileType === 'application/pdf') {
      setPreviewFile({ type: 'pdf', url: previewUrl, name: file.name });
    }
  };

  const getFilePreviewUrl = (file) => {
    // If it's a Cloudinary URL, return it as is
    if (file.url.startsWith('http')) {
      return file.url;
    }
    // For local files, construct the URL
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${file.url.startsWith('/uploads/') ? file.url : `/uploads/${file.url}`}`;
  };

  // Handle ESC key for modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && previewFile) {
        setPreviewFile(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [previewFile]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setPreviewFile(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch comments for a task
  const fetchComments = async (taskId) => {
    try {
      setIsLoadingComments(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments/task/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Add comment to a task
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${selectedTask.id}`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Add effect to fetch comments when a task is selected
  useEffect(() => {
    if (selectedTask) {
      fetchComments(selectedTask.id);
    }
  }, [selectedTask]);

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
              {user.role === 'user' && (
                <>
                  <button
                    key="promote-admin"
                    onClick={() => handleUserAction(user.id, 'promote')}
                    className="p-2 text-blue-500 hover:text-blue-700"
                    title="Promote to Admin"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                  <button
                    key="promote-supporter"
                    onClick={() => handleUserAction(user.id, 'promote-supporter')}
                    className="p-2 text-green-500 hover:text-green-700"
                    title="Promote to Supporter"
                  >
                    <UserPlus className="h-5 w-5" />
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
              {user.role === 'supporter' && (
                <>
                  <button
                    key="promote-admin"
                    onClick={() => handleUserAction(user.id, 'promote')}
                    className="p-2 text-blue-500 hover:text-blue-700"
                    title="Promote to Admin"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                  <button
                    key="demote"
                    onClick={() => handleUserAction(user.id, 'demote')}
                    className="p-2 text-yellow-500 hover:text-yellow-700"
                    title="Demote to User"
                  >
                    <UserMinus className="h-5 w-5" />
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
          className={`bg-white p-4 rounded-lg shadow-sm border
            ${task.status === 'completed' ? 'border-green-200' : 
              task.status === 'review' ? 'border-yellow-200' : 
              'border-gray-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{task.userEmail}</h3>
              <p className="text-sm text-gray-500">
                {new Date(task.submittedAt).toLocaleDateString()}
              </p>
              <span
                className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1
                  ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'}`}
              >
                {STATUS_CONFIG[task.status]?.icon && (
                  <span className="h-3 w-3">
                    {React.createElement(STATUS_CONFIG[task.status].icon, {
                      className: "h-3 w-3",
                      "aria-hidden": "true"
                    })}
                  </span>
                )}
                <span>{STATUS_CONFIG[task.status]?.label || task.status}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {task.status !== 'completed' && (
                <>
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
                </>
              )}
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

  // Render file preview
  const renderFilePreview = (file) => {
    const fileType = file.type || file.mimeType;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    const fileUrl = file.url.startsWith('http') 
      ? file.url 
      : `${baseUrl}${file.url.startsWith('/uploads/') ? file.url : `/uploads/${file.url}`}`;

    if (fileType?.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={fileUrl}
            alt={file.name}
            className="h-24 w-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleFilePreview(file)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={() => handleFilePreview(file)}
              className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-80 p-1 rounded-full shadow-lg transition-opacity"
              aria-label="Preview image"
            >
              <Search className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative group">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFilePreview(file);
          }}
          className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {fileType === 'application/pdf' ? (
            <File className="h-4 w-4 mr-2 text-red-500" />
          ) : (
            <File className="h-4 w-4 mr-2 text-gray-500" />
          )}
          {file.name}
        </button>
      </div>
    );
  };

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
                {activeTab === 'tasks' && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
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

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Task details"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Task Details</h2>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                    {new Date(selectedTask.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Research</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.research}</p>
                </div>

                {selectedTask.challenges && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Challenges</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.challenges}</p>
                  </div>
                )}

                {Array.isArray(selectedTask.files) && selectedTask.files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Attachments</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedTask.files.map((file, index) => (
                        <div key={index}>
                          {renderFilePreview(file)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Comments</h3>
                  
                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="flex gap-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                        rows="2"
                      />
                      <button
                        type="submit"
                        className="btn btn-primary self-end"
                        disabled={!newComment.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  {isLoadingComments ? (
                    <div className="space-y-4">
                      {Array(3).fill(null).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{comment.userEmail}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {comment.userEmail === user.email && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete comment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="File preview"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{previewFile.name}</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  className="max-w-full h-auto"
                />
              ) : previewFile.type === 'pdf' ? (
                <div className="w-full h-[80vh]">
                  <iframe
                    src={`${previewFile.url}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  />
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard; 