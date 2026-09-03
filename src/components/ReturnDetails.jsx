import React from 'react';
import { 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Boxes, 
  ShieldAlert 
} from 'lucide-react';

const RETURN_REASONS = [
  'Damaged on delivery',
  'Manufacturing defect',
  'Missing parts',
  'Wrong product delivered',
  'Product condition not as expected',
  'Other'
];

const CONDITIONS = [
  {
    id: 'New / Unused',
    title: 'New / Unused',
    desc: 'Unopened or in brand new state with original packaging',
    icon: Sparkles,
    badgeClass: 'badge-new'
  },
  {
    id: 'Minor Damage',
    title: 'Minor Damage',
    desc: 'Surface scratches, minor scuffs, cosmetic blemish',
    icon: AlertCircle,
    badgeClass: 'badge-minor'
  },
  {
    id: 'Major Damage',
    title: 'Major Damage',
    desc: 'Structural tear, deep dent, broken leg/arm, non-functional',
    icon: AlertTriangle,
    badgeClass: 'badge-major'
  },
  {
    id: 'Used',
    title: 'Used',
    desc: 'Signs of regular wear & tear, customer assembled',
    icon: Clock,
    badgeClass: 'badge-used'
  },
  {
    id: 'Missing Parts',
    title: 'Missing Parts',
    desc: 'Cushions, screws, fittings, or hardware missing',
    icon: Boxes,
    badgeClass: 'badge-missing'
  },
  {
    id: 'Severe Damage',
    title: 'Severe Damage',
    desc: 'Completely destroyed, shattered glass, water/fire damaged',
    icon: Flame,
    badgeClass: 'badge-severe'
  }
];

export default function ReturnDetails({ data, errors, onChange }) {
  const handleChange = (field, value) => {
    onChange('return', { ...data, [field]: value });
  };

  const handleConditionSelect = (conditionId) => {
    handleChange('condition', conditionId);
  };

  const charCount = (data.description || '').length;

  return (
    <section className="form-card" id="section-return-details" aria-labelledby="heading-return-details">
      <div className="card-header">
        <div className="card-header-icon">
          <AlertCircle className="icon-blue" size={20} />
        </div>
        <div>
          <h2 id="heading-return-details" className="card-title">Return Details & Condition</h2>
          <p className="card-subtitle">Specify why the furniture is being returned and its physical state</p>
        </div>
      </div>

      <div className="form-stack">
        {/* Return Reason Dropdown */}
        <div className="form-group">
          <label htmlFor="return_reason" className="form-label required">
            Return Reason
          </label>
          <select
            id="return_reason"
            name="return_reason"
            value={data.reason || ''}
            onChange={(e) => handleChange('reason', e.target.value)}
            className={`form-select ${errors['return.reason'] ? 'input-error' : ''}`}
            aria-invalid={!!errors['return.reason']}
            aria-describedby={errors['return.reason'] ? 'return_reason_error' : undefined}
          >
            <option value="">Select return reason</option>
            {RETURN_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors['return.reason'] && (
            <span id="return_reason_error" className="error-message" role="alert">
              {errors['return.reason']}
            </span>
          )}
        </div>

        {/* Dynamic Additional Reason Input (if 'Other' selected) */}
        {data.reason === 'Other' && (
          <div className="form-group dynamic-reason-block">
            <label htmlFor="additional_reason" className="form-label required">
              Additional Reason Details
            </label>
            <input
              type="text"
              id="additional_reason"
              name="additional_reason"
              value={data.additional_reason || ''}
              onChange={(e) => handleChange('additional_reason', e.target.value)}
              placeholder="Please elaborate on the return reason..."
              className={`form-input ${errors['return.additional_reason'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['return.additional_reason']}
              aria-describedby={errors['return.additional_reason'] ? 'additional_reason_error' : undefined}
            />
            {errors['return.additional_reason'] && (
              <span id="additional_reason_error" className="error-message" role="alert">
                {errors['return.additional_reason']}
              </span>
            )}
          </div>
        )}

        {/* Product Condition Selection Cards */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label required" id="label-product-condition">
              Product Condition
            </label>
            <span className="helper-hint">Select the closest match to current physical state</span>
          </div>

          <div 
            className="condition-grid" 
            role="radiogroup" 
            aria-labelledby="label-product-condition"
            aria-invalid={!!errors['return.condition']}
          >
            {CONDITIONS.map((item) => {
              const isSelected = data.condition === item.id;
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  role="radio"
                  tabIndex={0}
                  aria-checked={isSelected}
                  onClick={() => handleConditionSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleConditionSelect(item.id);
                    }
                  }}
                  className={`condition-card ${isSelected ? 'condition-card-selected' : ''}`}
                >
                  <div className="condition-card-top">
                    <div className={`condition-icon-badge ${item.badgeClass}`}>
                      <IconComp size={18} />
                    </div>
                    <div className="condition-radio-indicator">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                  </div>
                  <div className="condition-card-content">
                    <h3 className="condition-title">{item.title}</h3>
                    <p className="condition-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors['return.condition'] && (
            <span id="condition_error" className="error-message" role="alert">
              {errors['return.condition']}
            </span>
          )}
        </div>

        {/* Damage Description */}
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="damage_description" className="form-label required">
              Describe the damage or issue
            </label>
            <span className={`char-counter ${charCount >= 500 ? 'counter-max' : ''}`} aria-live="polite">
              {charCount} / 500
            </span>
          </div>
          <textarea
            id="damage_description"
            name="damage_description"
            rows={4}
            maxLength={500}
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what is damaged, where the damage is located, and any other relevant details..."
            className={`form-textarea ${errors['return.description'] ? 'input-error' : ''}`}
            aria-invalid={!!errors['return.description']}
            aria-describedby={errors['return.description'] ? 'damage_description_error' : undefined}
          />
          {errors['return.description'] && (
            <span id="damage_description_error" className="error-message" role="alert">
              {errors['return.description']}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
