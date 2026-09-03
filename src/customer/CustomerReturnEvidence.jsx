import React, { useState } from 'react';
import { 
  Camera, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  Check,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { getCustomerReturnDetail } from '../services/customerPortalService.js';

export default function CustomerReturnEvidence({
  activeCustomer,
  returnId,
  onNavigate
}) {
  const returnDetail = getCustomerReturnDetail(activeCustomer.id, returnId);

  const [photos, setPhotos] = useState([
    { id: '1', name: 'main_product.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60' },
    { id: '2', name: 'defect_closeup.jpg', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60' }
  ]);
  const [saveNotice, setSaveNotice] = useState(null);

  const handleAddSample = () => {
    const p = {
      id: String(Date.now()),
      name: `defect_photo_${photos.length + 1}.jpg`,
      url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=60'
    };
    setPhotos(prev => [...prev, p]);
    setSaveNotice('New verification photo uploaded successfully.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleRemove = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="cre-root">
      {/* Header */}
      <div className="cre-header">
        <button
          type="button"
          className="cre-back-btn"
          onClick={() => onNavigate('status')}
          title="Back to Status Timeline"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="cre-title">Upload Verification Photos</h1>
          <p className="cre-subtitle">
            Return Ref: <span className="cre-mono">{returnId}</span> &bull; {returnDetail?.productName || 'Furniture Item'}
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="cre-notice">
          <CheckCircle2 size={16} className="cre-notice-icon" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="cre-card">
        <div className="cre-card-header">
          <h3 className="cre-card-title">Photo Submission Guidelines</h3>
          <span className="cre-badge-info">Speeds Up Review</span>
        </div>
        <div className="cre-guidelines-grid">
          <div className="cre-guide-item">
            <div className="cre-guide-check"><Check size={14} /></div>
            <div>
              <strong className="cre-guide-name">Full Piece Photo:</strong>
              <span className="cre-guide-desc">Shows overall furniture item in clear ambient lighting.</span>
            </div>
          </div>
          <div className="cre-guide-item">
            <div className="cre-guide-check"><Check size={14} /></div>
            <div>
              <strong className="cre-guide-name">Defect Close-Up:</strong>
              <span className="cre-guide-desc">Clear angle on cracks, tears, chips, or broken joints.</span>
            </div>
          </div>
          <div className="cre-guide-item">
            <div className="cre-guide-check"><Check size={14} /></div>
            <div>
              <strong className="cre-guide-name">Manufacturer Tag:</strong>
              <span className="cre-guide-desc">Barcode or serial label on the base or underside.</span>
            </div>
          </div>
          <div className="cre-guide-item">
            <div className="cre-guide-check"><Check size={14} /></div>
            <div>
              <strong className="cre-guide-name">Shipping Box:</strong>
              <span className="cre-guide-desc">If transit packaging was punctured or damaged upon arrival.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Gallery Card */}
      <div className="cre-card">
        <div className="cre-card-header">
          <div>
            <h3 className="cre-card-title">Attached Evidence Photos ({photos.length})</h3>
            <p className="cre-card-sub">Review or attach new photos for claims specialist examination</p>
          </div>
          <span className="cre-badge-verified">
            <CheckCircle2 size={12} /> Evidence Online
          </span>
        </div>

        <div className="cre-gallery-grid">
          {photos.map(p => (
            <div key={p.id} className="cre-photo-card">
              <img src={p.url} alt={p.name} className="cre-photo-img" />
              <div className="cre-photo-overlay">
                <span className="cre-photo-name truncate">{p.name}</span>
                <button
                  type="button"
                  className="cre-photo-del"
                  onClick={() => handleRemove(p.id)}
                  title="Remove photo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="cre-photo-add-card"
            onClick={handleAddSample}
          >
            <Camera size={24} className="cre-add-icon" />
            <span className="cre-add-text">+ Add Photo</span>
            <span className="cre-add-sub">JPG, PNG, WEBP</span>
          </button>
        </div>

        <div className="cre-card-footer">
          <div className="cre-encrypted-note">
            <ShieldCheck size={14} className="cre-lock-icon" />
            <span>All media files are protected and watermarked for verification only.</span>
          </div>
          <button
            type="button"
            className="cre-btn-save"
            onClick={() => onNavigate('status')}
          >
            Save &amp; Return to Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
