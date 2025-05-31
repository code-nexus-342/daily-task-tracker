import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Upload, Trash2 } from 'lucide-react';

const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'application/pdf': true
};

const TaskSubmission = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    research: '',
    challenges: '',
    files: []
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(file => !ALLOWED_FILE_TYPES[file.type]);

    if (invalidFiles.length > 0) {
      toast.error('Only images and PDFs are allowed');
      return;
    }

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/submit`,
        formDataToSend,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Task submitted successfully!');
      setFormData({ research: '', challenges: '', files: [] });
    } catch (error) {
      console.error('Failed to submit task:', {
        message: error.message,
        response: error.response?.data
      });
      toast.error('Failed to submit task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-2xl font-bold mb-6">Submit Daily Task</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="research" className="block text-sm font-medium text-gray-700">
                Research/Findings
              </label>
              <textarea
                id="research"
                required
                className="input mt-1"
                rows="4"
                value={formData.research}
                onChange={(e) => setFormData(prev => ({ ...prev, research: e.target.value }))}
                placeholder="Enter your daily research findings here..."
                aria-label="Research findings"
              />
            </div>

            <div>
              <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
                Challenges Faced (Optional)
              </label>
              <textarea
                id="challenges"
                className="input mt-1"
                rows="3"
                value={formData.challenges}
                onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                placeholder="Describe any challenges you faced..."
                aria-label="Challenges faced"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                        aria-label="Upload files"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB, PDF up to 20MB
                  </p>
                </div>
              </div>
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              aria-label="Submit task"
            >
              {loading ? 'Saving...' : 'Submit Task'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskSubmission; 