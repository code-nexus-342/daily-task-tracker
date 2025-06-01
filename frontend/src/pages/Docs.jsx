import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { DOCUMENTATION } from '../config/docs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Edit2, Save, X } from 'lucide-react';

const Docs = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocs, setEditedDocs] = useState(DOCUMENTATION);
  const [activeSection, setActiveSection] = useState(null);

  const handleEdit = (section) => {
    setActiveSection(section);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/docs/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedDocs)
      });

      if (!response.ok) {
        throw new Error('Failed to update documentation');
      }

      toast.success('Documentation updated successfully');
      setIsEditing(false);
      setActiveSection(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    setEditedDocs(DOCUMENTATION);
    setIsEditing(false);
    setActiveSection(null);
  };

  const handleContentChange = (sectionTitle, field, value) => {
    setEditedDocs(prev => {
      const newDocs = { ...prev };
      const section = newDocs.sections.find(s => s.title === sectionTitle);
      if (section) {
        if (typeof field === 'string') {
          section.content[field] = value;
        } else {
          const [parent, child] = field;
          section.content[parent][child] = value;
        }
      }
      return newDocs;
    });
  };

  const renderEditControls = (section) => {
    if (user?.role !== 'admin') return null;

    return (
      <div className="flex items-center space-x-2">
        {isEditing && activeSection?.title === section.title ? (
          <>
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full"
              title="Save changes"
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Cancel editing"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleEdit(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Edit section"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  const renderContent = (section) => {
    const isSectionEditing = isEditing && activeSection?.title === section.title;
    const content = isSectionEditing ? editedDocs.sections.find(s => s.title === section.title)?.content : section.content;

    switch (section.title) {
      case 'Overview':
        return (
          <div className="space-y-4">
            {isSectionEditing ? (
              <textarea
                value={content.description}
                onChange={(e) => handleContentChange(section.title, 'description', e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            ) : (
              <p>{content.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">User Features</h3>
                {isSectionEditing ? (
                  <textarea
                    value={content.features.user.join('\n')}
                    onChange={(e) => handleContentChange(section.title, ['features', 'user'], e.target.value.split('\n'))}
                    className="w-full p-2 border rounded-md"
                    rows={5}
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    {content.features.user.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Admin Features</h3>
                {isSectionEditing ? (
                  <textarea
                    value={content.features.admin.join('\n')}
                    onChange={(e) => handleContentChange(section.title, ['features', 'admin'], e.target.value.split('\n'))}
                    className="w-full p-2 border rounded-md"
                    rows={5}
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    {content.features.admin.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case 'Task Workflow':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-4">Task Lifecycle</h3>
              <div className="space-y-6">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {React.createElement(step.icon, {
                        className: "h-4 w-4 text-blue-600"
                      })}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'File Management':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-4">Supported File Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Images</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {content.supportedTypes.images.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Documents</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {content.supportedTypes.documents.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">File Features</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {content.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'User Roles':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(content.roles).map(([key, role]) => (
                <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {React.createElement(role.icon, {
                      className: `h-5 w-5 ${key === 'admin' ? 'text-green-600' : 'text-blue-600'}`
                    })}
                    <h3 className="font-medium">{role.title}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {role.capabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Technical Stack':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(content).map(([key, tech]) => (
                <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {React.createElement(tech.icon, {
                      className: "h-5 w-5 text-blue-600"
                    })}
                    <h3 className="font-medium">{tech.title}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {(tech.technologies || tech.features).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-4">Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(content).map(([key, security]) => (
                  <div key={key}>
                    <h4 className="font-medium mb-2">{security.title}</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {security.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            {isEditing && activeSection?.title === 'title' ? (
              <input
                type="text"
                value={editedDocs.title}
                onChange={(e) => setEditedDocs(prev => ({ ...prev, title: e.target.value }))}
                className="text-3xl font-bold text-gray-900 text-center bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{DOCUMENTATION.title}</h1>
            )}
            {isEditing && activeSection?.title === 'subtitle' ? (
              <input
                type="text"
                value={editedDocs.subtitle}
                onChange={(e) => setEditedDocs(prev => ({ ...prev, subtitle: e.target.value }))}
                className="mt-2 text-gray-600 text-center bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-gray-600">{DOCUMENTATION.subtitle}</p>
            )}
          </div>

          <div className="space-y-8">
            {DOCUMENTATION.sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {React.createElement(section.icon, {
                        className: "h-6 w-6 text-primary-600"
                      })}
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    {renderEditControls(section)}
                  </div>
                  {renderContent(section)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Docs; 