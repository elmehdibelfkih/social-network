import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, onSubmit, onUploadAvatar }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    avatarId: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setError('');

    if (file) {
      // Validate file size (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10 MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload avatar and get avatarId
      if (onUploadAvatar) {
        setIsUploading(true);
        try {
          const avatarId = await onUploadAvatar(file);
          setFormData(prev => ({
            ...prev,
            avatarId: avatarId
          }));
        } catch (err) {
          setError('Failed to upload avatar. Please try again.');
          setImagePreview(null);
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.avatarId) {
      setError('Please upload a group image');
      return;
    }

    // Create payload matching CreateGroupPayload type
    const payload = {
      title: formData.title,
      description: formData.description,
      avatarId: formData.avatarId
    };

    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', avatarId: null });
    setImagePreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create New Group
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new group and invite members to join
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Form */}
        <div className="space-y-4">
          {/* Group Title */}
          <div>
            <label
              htmlFor="group-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Group Title *
            </label>
            <input
              type="text"
              id="group-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter group title"
              className="w-full h-9 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="group-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description *
            </label>
            <textarea
              id="group-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this group about?"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="group-image"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Group Image * (max size: 10 MB)
            </label>
            <div className="mt-1">
              <label
                htmlFor="group-image"
                className="flex items-center justify-center w-full h-32 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors bg-gray-50 dark:bg-gray-700/50"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <Image className="w-8 h-8 mb-2" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs mt-1">PNG, JPG, GIF up to 10MB</span>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="group-image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.description.trim() || !formData.avatarId || isUploading}
            className="w-full h-9 px-4 py-2 text-sm font-medium text-white bg-[#6b2d8f] hover:bg-[#4a1d63] rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-3 focus:ring-purple-500/50"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);

  // Mock function to simulate avatar upload API call
  const handleUploadAvatar = async (file) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, this would upload to your server and return the avatarId
    // Example:
    // const formData = new FormData();
    // formData.append('avatar', file);
    // const response = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
    // const { avatarId } = await response.json();
    // return avatarId;
    
    // Mock: return a random avatarId
    return Math.floor(Math.random() * 10000);
  };

  const handleCreateGroup = (payload) => {
    // payload matches CreateGroupPayload type: { title, description, avatarId }
    const newGroup = {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    
    setGroups(prev => [...prev, newGroup]);
    console.log('Group created with payload:', payload);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Groups
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6b2d8f] hover:bg-[#4a1d63] rounded-md transition-colors"
          >
            Create New Group
          </button>
        </div>

        {/* Groups List */}
        <div className="grid gap-4">
          {groups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No groups yet. Create your first group!
              </p>
            </div>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Image className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {group.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {group.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Avatar ID: {group.avatarId}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
        onUploadAvatar={handleUploadAvatar}
      />
    </div>
  );
}