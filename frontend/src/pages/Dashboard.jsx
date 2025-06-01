import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Calendar,
  Search,
  Image,
  File,
  CheckCircle,
  Clock,
  Search as SearchIcon,
  Download,
  X,
  Trash2,
  Edit
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
    icon: SearchIcon,
    color: 'yellow'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [previewFile, setPreviewFile] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const modalRef = React.useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchMyTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tasks/my-tasks/${user.email}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks. Please try again.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchMyTasks();
    }
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Task status updated successfully');
      fetchMyTasks(); // Refresh the tasks list
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Task deleted successfully');
      fetchMyTasks(); // Refresh the tasks list
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const getFilePreviewUrl = (file) => {
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return file.url.startsWith('http') 
      ? file.url 
      : `${baseUrl}${file.url.startsWith('/uploads/') ? file.url : `/uploads/${file.url}`}`;
  };

  const handleFilePreview = (file) => {
    const fileType = file.type || file.mimeType;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    const fileUrl = file.url.startsWith('http') 
      ? file.url 
      : `${baseUrl}${file.url.startsWith('/uploads/') ? file.url : `/uploads/${file.url}`}`;

    if (fileType?.startsWith('image/')) {
      setPreviewFile({ type: 'image', url: fileUrl, name: file.name });
    } else if (fileType === 'application/pdf') {
      setPreviewFile({ type: 'pdf', url: fileUrl, name: file.name });
    }
  };

  const renderTaskSkeleton = () => (
    <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  const filteredTasks = tasks
      .filter(task => {
        const searchTermLower = debouncedSearch.toLowerCase();
        const researchText = (task.research || '').toLowerCase();
        const challengesText = (task.challenges || '').toLowerCase();
        const status = (task.status || '').toLowerCase();
        const date = new Date(task.submittedAt || 0).toLocaleDateString().toLowerCase();
        const files = (task.files || []).map(file => file.name.toLowerCase()).join(' ');
        
        const matchesSearch = 
          researchText.includes(searchTermLower) ||
          challengesText.includes(searchTermLower) ||
          status.includes(searchTermLower) ||
          date.includes(searchTermLower) ||
          files.includes(searchTermLower);

        const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
        } else if (sortBy === 'oldest') {
          return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
        } else if (sortBy === 'status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        return 0;
      });

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

  const fetchComments = async (taskId) => {
    try {
      setIsLoadingComments(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments/${taskId}`,
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

  // Add notification for task status changes
  useEffect(() => {
    const checkTaskStatus = () => {
      // Get the previous tasks from localStorage
      const previousTasks = JSON.parse(localStorage.getItem('previousTasks') || '[]');
      
      // Find tasks that have changed status
      const changedTasks = tasks.filter(task => {
        const previousTask = previousTasks.find(pt => pt.id === task.id);
        return previousTask && previousTask.status !== task.status;
      });

      // Show notifications only for changed tasks
      changedTasks.forEach(task => {
        if (task.status === 'completed') {
          toast.success(`Your task has been approved! 🎉`);
        } else if (task.status === 'review') {
          toast.info(`Your task needs revision. Please review and resubmit.`);
        }
      });

      // Update localStorage with current tasks
      localStorage.setItem('previousTasks', JSON.stringify(tasks));
    };

    if (tasks.length > 0) {
      checkTaskStatus();
    }
  }, [tasks]);

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
              <h2 className="text-2xl font-bold">My Task Updates</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input
                      type="text"
                    placeholder="Search by content, status, date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 w-64"
                      aria-label="Search tasks"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                    aria-label="Sort tasks"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  <option value="status">By Status</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {isLoadingTasks ? (
                  Array(3).fill(null).map((_, index) => (
                    <div key={index}>{renderTaskSkeleton()}</div>
                  ))
                ) : (
                  filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer
                        ${task.status === 'completed' ? 'border-green-200' : 
                          task.status === 'review' ? 'border-yellow-200' : 
                          'border-gray-200'}`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {task.userEmail || task.user?.email || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
                            {new Date(task.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1
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
                          {task.status === 'review' && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, 'pending');
                                }}
                                className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                                title="Mark as Pending"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {task.status !== 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                      <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{task.research}</p>
                        {task.challenges && (
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                            <strong>Challenges:</strong> {task.challenges}
                          </div>
                        )}
                      </div>
                      {Array.isArray(task.files) && task.files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {task.files.map((file, index) => (
                            <div key={index} onClick={(e) => e.stopPropagation()}>
                              {renderFilePreview(file)}
                            </div>
                          ))}
                        </div>
                        </div>
                      )}
                    </motion.div>
                  ))
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
                    <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
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

export default Dashboard;
