import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  X,
  FileImage
} from 'lucide-react';
import { 
  ALLOWED_IMAGE_TYPES, 
  MAX_IMAGE_COUNT, 
  validateImageFile, 
  formatBytes 
} from '../utils/validation';

export default function EvidenceUpload({ evidenceList = [], error, onChange }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const fileInputRef = useRef(null);

  const processFiles = (files) => {
    setUploadError(null);
    if (!files || files.length === 0) return;

    const currentCount = evidenceList.length;
    if (currentCount + files.length > MAX_IMAGE_COUNT) {
      setUploadError(`Maximum ${MAX_IMAGE_COUNT} images allowed in total. You can only add ${MAX_IMAGE_COUNT - currentCount} more.`);
      return;
    }

    const newEvidencePromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileErr = validateImageFile(file);
      if (fileErr) {
        setUploadError(fileErr);
        return;
      }

      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result,
            uploadedAt: new Date().toISOString()
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
        reader.readAsDataURL(file);
      });

      newEvidencePromises.push(promise);
    }

    Promise.all(newEvidencePromises)
      .then((newImages) => {
        onChange([...evidenceList, ...newImages]);
      })
      .catch((err) => {
        setUploadError(err.message || 'Error processing images.');
      });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = ''; // reset so same file can be re-uploaded if removed
    }
  };

  const handleRemove = (idToRemove) => {
    const updated = evidenceList.filter((item) => item.id !== idToRemove);
    onChange(updated);
    setUploadError(null);
  };

  return (
    <section className="form-card" id="section-evidence" aria-labelledby="heading-evidence">
      <div className="card-header">
        <div className="card-header-icon">
          <UploadCloud className="icon-blue" size={20} />
        </div>
        <div className="card-header-flex">
          <div>
            <h2 id="heading-evidence" className="card-title">Damage Evidence Upload</h2>
            <p className="card-subtitle">Upload clear photos showing the damage, tags, and product serial number</p>
          </div>
          <span className="badge-count">
            {evidenceList.length} / {MAX_IMAGE_COUNT} images
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className={`dropzone ${isDragOver ? 'dropzone-active' : ''} ${error ? 'dropzone-error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload damage evidence photos"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          id="evidence-file-input"
        />

        <div className="dropzone-icon-wrap">
          <UploadCloud className="dropzone-icon" size={36} />
        </div>

        <p className="dropzone-primary-text">
          <strong>Drag & drop images here</strong> or <span className="browse-link">Browse Files</span>
        </p>

        <p className="dropzone-hint-text">
          Supports JPG, JPEG, PNG, WEBP &bull; Max 8 images &bull; Max 10 MB per file
        </p>
      </div>

      {/* Upload/Validation Errors */}
      {(uploadError || error) && (
        <div className="upload-error-banner" role="alert">
          <AlertCircle size={16} className="error-banner-icon" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Preview Grid */}
      {evidenceList.length > 0 && (
        <div className="evidence-preview-container">
          <h3 className="evidence-preview-title">
            Attached Evidence ({evidenceList.length})
          </h3>

          <div className="evidence-grid">
            {evidenceList.map((item, index) => (
              <div key={item.id} className="evidence-card">
                <div className="evidence-img-container">
                  <img
                    src={item.dataUrl}
                    alt={`Damage evidence ${index + 1}: ${item.name}`}
                    className="evidence-thumb"
                  />
                  <div className="evidence-overlay">
                    <button
                      type="button"
                      className="btn-icon-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalImg(item);
                      }}
                      title="View larger preview"
                      aria-label={`View larger preview of ${item.name}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-overlay btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      title="Remove image"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="evidence-info">
                  <span className="evidence-name" title={item.name}>
                    {item.name}
                  </span>
                  <span className="evidence-meta">
                    {formatBytes(item.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Large Image Modal */}
      {previewModalImg && (
        <div className="modal-backdrop" onClick={() => setPreviewModalImg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <FileImage size={18} className="modal-icon" />
                <span className="modal-filename">{previewModalImg.name}</span>
                <span className="modal-filesize">({formatBytes(previewModalImg.size)})</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewModalImg(null)}
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <img
                src={previewModalImg.dataUrl}
                alt={previewModalImg.name}
                className="modal-full-img"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
