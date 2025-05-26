import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Upload, FileText, Image } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('research', formData.research);
      formDataToSend.append('challenges', formData.challenges);
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/submit`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Task submitted successfully!');
      setFormData({ research: '', challenges: '', files: [] });
      fetchTasks();
    } catch (error) {
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
          {user?.role === 'core' && (
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

                {formData.files.length > 0 && (
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="ml-2 text-sm text-gray-600">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

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
                      <h3 className="font-medium">{task.user.fullName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(task.submissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">{task.research}</p>
                    {task.challenges && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Challenges:</p>
                        <p className="text-gray-600">{task.challenges}</p>
                      </div>
                    )}
                    {task.files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Attachments:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {task.files.map((file, index) => (
                            <a
                              key={index}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 rounded"
                            >
                              {file.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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