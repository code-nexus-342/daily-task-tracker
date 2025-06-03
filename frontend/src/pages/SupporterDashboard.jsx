import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const SupporterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    reviewTasks: 0,
    activeUsers: 0,
    totalComments: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/tasks/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data && response.data.stats) {
          setStats(response.data.stats);
          setRecentTasks(response.data.recentTasks || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Completed', value: stats?.completedTasks || 0 },
    { name: 'Pending', value: stats?.pendingTasks || 0 },
    { name: 'Review', value: stats?.reviewTasks || 0 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Project Statistics</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks || 0}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Total Comments"
            value={stats?.totalComments || 0}
            icon={<MessageSquare className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Task Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <div className="space-y-4">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{task.research}</h3>
                      <p className="text-sm text-gray-500">
                        Submitted by: {task.userEmail || 'Unknown'}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {task.challenges}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent tasks found</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800'
    },
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    review: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span className="ml-1 capitalize">{status}</span>
    </span>
  );
};

export default SupporterDashboard; 