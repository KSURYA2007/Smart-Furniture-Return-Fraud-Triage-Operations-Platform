import React, { useState } from 'react';
import { 
  Eye, 
  ZoomIn, 
  Download, 
  FileText, 
  Calendar, 
  Maximize2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { formatBytes } from '../../utils/validation';

export default function EvidenceGallery({ 
  evidenceList = [], 
  activeImageIndex = 0, 
  onSelectImage,
  onOpenAnnotation,
  onOpenZoom
}) {
  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="evidence-gallery-empty">
        <ImageIcon size={48} className="text-dim mb-2" />
        <h4>No Evidence Uploaded</h4>
        <p className="text-muted text-sm">No photo attachments were submitted with this return request.</p>
      </div>
    );
  }

  const activeImage = evidenceList[activeImageIndex] || evidenceList[0] || {};
  const isOversized = (activeImage.size || 0) > 10 * 1024 * 1024;
  const isSupported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].some(
    t => (activeImage.type || 'image/jpeg').toLowerCase().includes(t.split('/')[1])
  );

  return (
    <div className="evidence-gallery-card">
      <div className="gallery-main-viewer">
        <div className="gallery-photo-frame">
          <img 
            src={activeImage.dataUrl} 
            alt={activeImage.name || 'Evidence photo'} 
            className="gallery-active-img"
          />
          <div className="gallery-overlay-toolbar">
            <button
              type="button"
              className="gallery-tool-btn"
              onClick={() => onOpenZoom(activeImage.dataUrl)}
              title="Full screen zoom"
            >
              <ZoomIn size={16} /> Zoom
            </button>

            <button
              type="button"
              className="gallery-tool-btn gallery-tool-btn-primary"
              onClick={() => onOpenAnnotation(activeImage, activeImageIndex)}
              title="Annotate damage on this image"
            >
              <Edit3 size={16} /> Annotate Damage
            </button>
          </div>
        </div>

        {/* Active Image Metadata Strip */}
        <div className="gallery-metadata-strip">
          <div className="meta-left">
            <span className="meta-filename" title={activeImage.name}>
              {activeImage.name || `Photo_${activeImageIndex + 1}.jpg`}
            </span>
            <span className="meta-badge-size">{formatBytes(activeImage.size || 1400000)}</span>
            <span className="meta-badge-type">{(activeImage.type || 'image/jpeg').toUpperCase()}</span>
          </div>

          <div className="meta-right">
            {isSupported && !isOversized ? (
              <span className="file-valid-badge">
                <CheckCircle2 size={13} /> Valid Image
              </span>
            ) : (
              <span className="file-warn-badge">
                <AlertTriangle size={13} /> Review Notice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation Strip */}
      {evidenceList.length > 1 && (
        <div className="gallery-thumbnail-strip" role="tablist">
          {evidenceList.map((item, idx) => {
            const isActive = idx === activeImageIndex;
            return (
              <button
                key={item.id || idx}
                type="button"
                className={`gallery-thumb-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectImage(idx)}
                role="tab"
                aria-selected={isActive}
                title={item.name || `Image ${idx + 1}`}
              >
                <img src={item.dataUrl} alt={`Thumbnail ${idx + 1}`} className="gallery-thumb-pic" />
                <span className="thumb-index-num">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
