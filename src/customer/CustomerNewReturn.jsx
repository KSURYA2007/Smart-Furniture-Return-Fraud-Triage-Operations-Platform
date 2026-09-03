import React, { useState } from 'react';
import { 
  Package, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  PlusCircle, 
  Trash2,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';
import { createCustomerReturn } from '../services/customerPortalService.js';

export default function CustomerNewReturn({
  activeCustomer,
  onNavigate,
  onReturnCreated
}) {
  const fileInputRef = React.useRef(null);
  const [orderId, setOrderId] = useState('');
  const [productName, setProductName] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [productCondition, setProductCondition] = useState('Damaged');
  const [description, setDescription] = useState('');
  const [preferredPickupDate, setPreferredPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [pickupAddress, setPickupAddress] = useState(activeCustomer?.address || '');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhotos(prev => [
          ...prev,
          {
            id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            url: evt.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSamplePhoto = () => {
    const newP = {
      id: `p_${Date.now()}`,
      name: `furniture_defect_${photos.length + 1}.jpg`,
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60'
    };
    setPhotos(prev => [...prev, newP]);
  };

  const handleRemovePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim() || !returnReason) {
      setErrorNotice('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      orderId,
      productName,
      returnReason,
      productCondition,
      description,
      preferredPickupDate,
      pickupAddress,
      customerName: activeCustomer.name,
      photos: photos.map(p => p.name)
    };

    setTimeout(() => {
      const res = createCustomerReturn(activeCustomer.id, payload);
      setIsSubmitting(false);

      if (res.success) {
        onReturnCreated(res.returnId);
        onNavigate('status');
      } else {
        setErrorNotice('Unable to submit return claim. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="cnr-root">
      {/* Page Header */}
      <div className="cnr-header">
        <button
          type="button"
          className="cnr-back-btn"
          onClick={() => onNavigate('dashboard')}
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="cnr-title">Start a Return Request</h1>
          <p className="cnr-subtitle">
            Submit your claim details and damage photos for quick review and doorstep pickup.
          </p>
        </div>
      </div>

      {errorNotice && (
        <div className="cnr-error-banner">
          <AlertTriangle size={18} className="cnr-error-icon" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Form Form */}
      <form onSubmit={handleSubmit} className="cnr-form-card">
        {/* Section 1: Order & Item Identification */}
        <div className="cnr-section">
          <div className="cnr-section-header">
            <span className="cnr-section-num">1</span>
            <div>
              <h3 className="cnr-section-title">Order &amp; Product Identification</h3>
              <p className="cnr-section-desc">Specify your purchase reference and item details</p>
            </div>
          </div>

          <div className="cnr-form-grid">
            <div className="cnr-form-group">
              <label className="cnr-label">
                Order Number <span className="cnr-required">*</span>
              </label>
              <input
                type="text"
                className="cnr-input cnr-mono"
                placeholder="e.g. ORD-8821"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
              <span className="cnr-hint">Found in your purchase confirmation email</span>
            </div>

            <div className="cnr-form-group">
              <label className="cnr-label">
                Furniture Item Name <span className="cnr-required">*</span>
              </label>
              <input
                type="text"
                className="cnr-input"
                placeholder="e.g. Ergonomic Velvet Armchair"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <span className="cnr-hint">Exact name or description of the delivered furniture</span>
            </div>
          </div>
        </div>

        {/* Section 2: Reason & Condition */}
        <div className="cnr-section">
          <div className="cnr-section-header">
            <span className="cnr-section-num">2</span>
            <div>
              <h3 className="cnr-section-title">Return Reason &amp; Item Condition</h3>
              <p className="cnr-section-desc">Help us assess the problem and determine restocking eligibility</p>
            </div>
          </div>

          <div className="cnr-form-grid">
            <div className="cnr-form-group">
              <label className="cnr-label">
                Primary Reason for Return <span className="cnr-required">*</span>
              </label>
              <select
                className="cnr-select"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
              >
                <option value="">-- Choose Reason for Return --</option>
                <option value="Damaged on Delivery">Damaged on Delivery</option>
                <option value="Manufacturing Defect">Manufacturing Defect</option>
                <option value="Wrong Product Received">Wrong Product Received</option>
                <option value="Missing Parts">Missing Parts</option>
                <option value="Product Not as Described">Product Not as Described</option>
                <option value="Changed Mind">Changed Mind (Within 30 Days)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="cnr-form-group">
              <label className="cnr-label">
                Current Product Condition <span className="cnr-required">*</span>
              </label>
              <select
                className="cnr-select"
                value={productCondition}
                onChange={(e) => setProductCondition(e.target.value)}
              >
                <option value="Damaged">Damaged / Defective</option>
                <option value="Heavily Damaged">Heavily Damaged in Transit</option>
                <option value="New">New / Unused in Original Box</option>
                <option value="Good">Good Condition</option>
                <option value="Used">Slightly Used</option>
              </select>
            </div>
          </div>

          <div className="cnr-form-group cnr-full-width">
            <label className="cnr-label">
              Please describe the issue in detail <span className="cnr-required">*</span>
            </label>
            <textarea
              className="cnr-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Broken wooden leg, torn fabric on cushion, misaligned assembly holes..."
              rows={3}
              required
            />
          </div>
        </div>

        {/* Section 3: Photos */}
        <div className="cnr-section">
          <div className="cnr-section-header">
            <span className="cnr-section-num">3</span>
            <div>
              <div className="cnr-section-title-wrap">
                <h3 className="cnr-section-title">Verification Photos</h3>
                <span className="cnr-badge-opt">Recommended</span>
              </div>
              <p className="cnr-section-desc">Upload real photos of the delivered product and defect to speed up verification</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <div className="cnr-photo-uploader">
            <div className="cnr-photo-grid">
              {photos.map(p => (
                <div key={p.id} className="cnr-photo-card">
                  <img src={p.url} alt={p.name} className="cnr-photo-img" />
                  <div className="cnr-photo-overlay">
                    <span className="cnr-photo-name truncate">{p.name}</span>
                    <button
                      type="button"
                      className="cnr-photo-delete"
                      onClick={() => handleRemovePhoto(p.id)}
                      title="Remove photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="cnr-photo-add-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Browse and upload images from device"
              >
                <Camera size={22} className="cnr-add-icon" />
                <span className="cnr-add-text">+ Upload Photo</span>
                <span className="cnr-add-sub">Browse JPG, PNG from device</span>
              </button>
            </div>

            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={handleAddSamplePhoto}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
              >
                + Or use demo photo
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Doorstep Retrieval */}
        <div className="cnr-section">
          <div className="cnr-section-header">
            <span className="cnr-section-num">4</span>
            <div>
              <h3 className="cnr-section-title">Doorstep Retrieval Coordinates</h3>
              <p className="cnr-section-desc">Where and when our specialized logistics van should collect the furniture</p>
            </div>
          </div>

          <div className="cnr-form-grid">
            <div className="cnr-form-group">
              <label className="cnr-label">
                Preferred Pickup Date <span className="cnr-required">*</span>
              </label>
              <div className="cnr-input-with-icon">
                <Calendar size={16} className="cnr-field-icon" />
                <input
                  type="date"
                  className="cnr-input cnr-input-padded"
                  value={preferredPickupDate}
                  onChange={(e) => setPreferredPickupDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="cnr-form-group">
              <label className="cnr-label">
                Pickup Address <span className="cnr-required">*</span>
              </label>
              <div className="cnr-input-with-icon">
                <MapPin size={16} className="cnr-field-icon" />
                <input
                  type="text"
                  className="cnr-input cnr-input-padded"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Street, City, Pincode"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="cnr-footer">
          <button
            type="button"
            className="cnr-btn-cancel"
            onClick={() => onNavigate('dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cnr-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="login-spinner" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Submit Return Claim</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
