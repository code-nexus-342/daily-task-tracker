import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  Search,
  Upload,
  Shield,
  AlertCircle,
  ArrowRight,
  Code,
  Database,
  Server,
  Globe,
  Heart
} from 'lucide-react';

export const DOCUMENTATION = {
  title: 'Project Documentation',
  subtitle: 'Comprehensive guide to the task management system',
  sections: [
    {
      title: 'Overview',
      icon: FileText,
      content: {
        description: 'This is a task management system that allows users to submit research tasks and administrators to review and manage them. The system supports file uploads, status tracking, and real-time notifications.',
        features: {
          user: [
            'Submit research tasks with files',
            'Track task status',
            'Receive notifications',
            'View task history',
            'Add comments to tasks'
          ],
          admin: [
            'Review submitted tasks',
            'Approve or reject tasks',
            'Manage user accounts',
            'View all tasks and files',
            'Add comments to tasks'
          ],
          supporter: [
            'View project statistics and progress',
            'Monitor task completion rates',
            'Provide feedback on tasks',
            'Access project documentation',
            'View task details and files'
          ]
        }
      }
    },
    {
      title: 'Task Workflow',
      icon: ArrowRight,
      content: {
        steps: [
          {
            title: 'Task Submission',
            description: 'User submits a research task with optional files. The task is marked as \'pending\'.',
            icon: Clock
          },
          {
            title: 'Admin Review',
            description: 'Admin reviews the task and can either approve or reject it.',
            icon: Search
          },
          {
            title: 'Task Completion',
            description: 'If approved, the task is marked as \'completed\'. If rejected, it goes back to \'review\' status.',
            icon: CheckCircle
          }
        ]
      }
    },
    {
      title: 'File Management',
      icon: Upload,
      content: {
        supportedTypes: {
          images: ['JPG/JPEG', 'PNG', 'GIF', 'WebP'],
          documents: ['PDF', 'Text files', 'Word documents']
        },
        features: [
          'Preview support for images and PDFs',
          'Automatic file type detection',
          'Secure file storage with Cloudinary',
          'File size limits and validation'
        ]
      }
    },
    {
      title: 'User Roles',
      icon: Users,
      content: {
        roles: {
          user: {
            title: 'Regular Users',
            icon: Users,
            capabilities: [
              'Submit research tasks',
              'Upload files',
              'Track task status',
              'Add comments',
              'View own task history'
            ]
          },
          admin: {
            title: 'Administrators',
            icon: Shield,
            capabilities: [
              'All regular user features',
              'Review all tasks',
              'Approve/reject tasks',
              'Manage user accounts',
              'Access admin dashboard'
            ]
          },
          supporter: {
            title: 'Project Supporters',
            icon: Heart,
            capabilities: [
              'View project statistics',
              'Monitor task progress',
              'Provide task feedback',
              'Access documentation',
              'View task details'
            ]
          }
        }
      }
    },
    {
      title: 'Technical Stack',
      icon: Code,
      content: {
        frontend: {
          title: 'Frontend',
          icon: Globe,
          technologies: [
            'React.js',
            'Tailwind CSS',
            'Framer Motion',
            'Axios',
            'React Router'
          ]
        },
        backend: {
          title: 'Backend',
          icon: Server,
          technologies: [
            'Fastify.js',
            'Sequelize ORM',
            'JWT Authentication',
            'Cloudinary Integration',
            'PostgreSQL Database'
          ]
        },
        database: {
          title: 'Database',
          icon: Database,
          features: [
            'PostgreSQL',
            'User Management',
            'Task Tracking',
            'File Metadata',
            'Comments System'
          ]
        }
      }
    },
    {
      title: 'Security',
      icon: Shield,
      content: {
        authentication: {
          title: 'Authentication',
          features: [
            'JWT-based authentication',
            'Role-based access control',
            'Secure password hashing',
            'Session management'
          ]
        },
        dataProtection: {
          title: 'Data Protection',
          features: [
            'File encryption',
            'Secure file storage',
            'Input validation',
            'XSS protection'
          ]
        }
      }
    }
  ]
}; 