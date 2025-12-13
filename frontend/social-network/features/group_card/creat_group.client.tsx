// CreateGroupModal.tsx
'use client'
import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';
import styles from './creategroup.module.css';
import { CreateGroupPayload } from './types'

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGroupPayload) => void;
  onUploadAvatar: (file: File) => Promise<number>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onUploadAvatar 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    avatarId: null as number | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        setImagePreview(reader.result as string);
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
    const payload: CreateGroupPayload = {
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Group</h2>
          <p className={styles.description}>
            Create a new group and invite members to join
          </p>
        </div>

        {/* Close Button */}
        <button onClick={handleClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
          <span className={styles.srOnly}>Close</span>
        </button>

        {/* Form */}
        <div className={styles.form}>
          {/* Group Title */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-title" className={styles.label}>
              Group Title *
            </label>
            <input
              type="text"
              id="group-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter group title"
              className={styles.input}
            />
          </div>

          {/* Description */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-description" className={styles.label}>
              Description *
            </label>
            <textarea
              id="group-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this group about?"
              rows={4}
              className={styles.textarea}
            />
          </div>

          {/* Image Upload */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-image" className={styles.label}>
              Group Image * (max size: 10 MB)
            </label>
            <div className={styles.uploadWrapper}>
              <label htmlFor="group-image" className={styles.uploadArea}>
                {isUploading ? (
                  <div className={styles.uploadContent}>
                    <div className={styles.spinner}></div>
                    <span className={styles.uploadText}>Uploading...</span>
                  </div>
                ) : imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                    <div className={styles.imageOverlay}>
                      <Upload className={styles.uploadIcon} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadContent}>
                    <Image className={styles.imageIcon} />
                    <span className={styles.uploadText}>Click to upload image</span>
                    <span className={styles.uploadSubtext}>PNG, JPG, GIF up to 10MB</span>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="group-image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className={styles.fileInput}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.description.trim() || !formData.avatarId || isUploading}
            className={styles.submitButton}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;