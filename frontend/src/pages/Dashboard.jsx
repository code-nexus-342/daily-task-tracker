import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Upload, FileText, Image } from 'lucide-react';

const Dashboard = () => {
  const { user, checkAuthStatus } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    research: '',
    challenges: '',
    files: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      if (!user?.email) {
        console.log('No user email found');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tasks/my-tasks/${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Tasks response:', response.data); // Debug log
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Fetch tasks error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) {
        toast.error('User not authenticated');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('research', formData.research);
      formDataToSend.append('challenges', formData.challenges);
      formDataToSend.append('userEmail', user.email);
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/submit`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Submit response:', response.data); // Debug log
      toast.success('Task submitted successfully!');
      setFormData({ research: '', challenges: '', files: [] });
      fetchTasks();
    } catch (error) {
      console.error('Submit task error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error('Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Submission Form */}
          {user && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6">Submit Daily Task</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Research/Findings
                  </label>
                  <textarea
                    required
                    className="input mt-1"
                    rows="4"
                    value={formData.research}
                    onChange={(e) => setFormData(prev => ({ ...prev, research: e.target.value }))}
                    placeholder="Enter your daily research findings here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Challenges Faced (Optional)
                  </label>
                  <textarea
                    className="input mt-1"
                    rows="3"
                    value={formData.challenges}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                    placeholder="Describe any challenges you faced..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attachments
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload files</span>
                          <input
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Task'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Progress Board */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold mb-6">Progress Board</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.user?.fullName || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(task.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{task.research}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
