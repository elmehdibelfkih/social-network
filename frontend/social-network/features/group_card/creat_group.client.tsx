// CreateGroupModal.tsx
'use client'
import React, { useState } from 'react';
import { CloseIcon, ImageIcon, UploadIcon } from "@/components/ui/icons"
import styles from './creategroup.module.css';
import { CreateGroupPayload } from './types'
import { GroupService } from "./group_card.services"

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGroupPayload) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    avatarId: null as number | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    setError('');

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10 MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setSelectedFile(file);
      setIsUploading(true);

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError('Failed to read the image file');
        reader.abort();
      };

      reader.onabort = () => {
        setError('Image reading was aborted');
        setImagePreview(null);
        setIsUploading(false);
        return;
      };
      reader.readAsDataURL(file);
    }
    setIsUploading(false);
    setFormData(prev => ({
      ...prev,
      avatarId: -1
    }));

  };

  async function handleSubmit() {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.title.trim().length > 40 || !formData.description.trim()) {
      setError('the title is more than 40');
      return;
    }

    if (formData.description.trim().length > 250) {
      setError('the description is more than 250');
      return;
    }


    if (!selectedFile) {
      const payload: CreateGroupPayload = {
        title: formData.title,
        description: formData.description,
        avatarId: null
      };
      onSubmit(payload);
      handleClose();

    } else {
      setIsUploading(true);
      try {
        const resp = await GroupService.uploadMedia(selectedFile);
        if (!resp) {
          setError('Failed to upload avatar. Please try again.');
          return;
        }
        const payload: CreateGroupPayload = {
          title: formData.title,
          description: formData.description,
          avatarId: resp.mediaId
        };
        onSubmit(payload);

        handleClose();
      } catch (err) {
        setError('Failed to create group. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }


  };

  const handleClose = () => {
    setFormData({ title: '', description: '', avatarId: null });
    setImagePreview(null);
    setIsUploading(false)
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
          <CloseIcon />
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
              maxLength={1024}
              required
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
                      <UploadIcon />
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadContent}>
                    <ImageIcon />
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
            disabled={formData.title.trim() == '' || formData.description.trim() == ''}
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