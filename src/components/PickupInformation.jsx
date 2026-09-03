import React from 'react';
import { Truck, MapPin, Building, Navigation, Calendar, MessageSquare } from 'lucide-react';

export default function PickupInformation({ data, errors, onChange }) {
  const handleChange = (field, value) => {
    onChange('pickup', { ...data, [field]: value });
  };

  // Get tomorrow's date string as minimum preferred date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  return (
    <section className="form-card" id="section-pickup" aria-labelledby="heading-pickup">
      <div className="card-header">
        <div className="card-header-icon">
          <Truck className="icon-blue" size={20} />
        </div>
        <div>
          <h2 id="heading-pickup" className="card-title">Bulky Item Pickup Information</h2>
          <p className="card-subtitle">Logistics & address details for heavy item reverse logistics collection</p>
        </div>
      </div>

      <div className="form-stack">
        {/* Pickup Address */}
        <div className="form-group">
          <label htmlFor="pickup_address" className="form-label required">
            Pickup Street Address
          </label>
          <div className="input-wrapper">
            <MapPin className="input-icon" size={16} />
            <input
              type="text"
              id="pickup_address"
              name="pickup_address"
              value={data.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. Flat 4B, Emerald Heights, MG Road"
              className={`form-input with-icon ${errors['pickup.address'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['pickup.address']}
              aria-describedby={errors['pickup.address'] ? 'pickup_address_error' : undefined}
            />
          </div>
          {errors['pickup.address'] && (
            <span id="pickup_address_error" className="error-message" role="alert">
              {errors['pickup.address']}
            </span>
          )}
        </div>

        <div className="form-grid grid-3-col">
          {/* City */}
          <div className="form-group">
            <label htmlFor="pickup_city" className="form-label required">
              City
            </label>
            <div className="input-wrapper">
              <Building className="input-icon" size={16} />
              <input
                type="text"
                id="pickup_city"
                name="pickup_city"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Chennai"
                className={`form-input with-icon ${errors['pickup.city'] ? 'input-error' : ''}`}
                aria-invalid={!!errors['pickup.city']}
                aria-describedby={errors['pickup.city'] ? 'pickup_city_error' : undefined}
              />
            </div>
            {errors['pickup.city'] && (
              <span id="pickup_city_error" className="error-message" role="alert">
                {errors['pickup.city']}
              </span>
            )}
          </div>

          {/* Postal Code */}
          <div className="form-group">
            <label htmlFor="pickup_postal_code" className="form-label required">
              Postal Code
            </label>
            <div className="input-wrapper">
              <Navigation className="input-icon" size={16} />
              <input
                type="text"
                id="pickup_postal_code"
                name="pickup_postal_code"
                value={data.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="e.g. 600001"
                className={`form-input with-icon ${errors['pickup.postal_code'] ? 'input-error' : ''}`}
                aria-invalid={!!errors['pickup.postal_code']}
                aria-describedby={errors['pickup.postal_code'] ? 'pickup_postal_code_error' : undefined}
              />
            </div>
            {errors['pickup.postal_code'] && (
              <span id="pickup_postal_code_error" className="error-message" role="alert">
                {errors['pickup.postal_code']}
              </span>
            )}
          </div>

          {/* Preferred Pickup Date */}
          <div className="form-group">
            <label htmlFor="preferred_date" className="form-label required">
              Preferred Pickup Date
            </label>
            <div className="input-wrapper">
              <Calendar className="input-icon" size={16} />
              <input
                type="date"
                id="preferred_date"
                name="preferred_date"
                min={minDateString}
                value={data.preferred_date || ''}
                onChange={(e) => handleChange('preferred_date', e.target.value)}
                className={`form-input with-icon ${errors['pickup.preferred_date'] ? 'input-error' : ''}`}
                aria-invalid={!!errors['pickup.preferred_date']}
                aria-describedby={errors['pickup.preferred_date'] ? 'preferred_date_error' : undefined}
              />
            </div>
            {errors['pickup.preferred_date'] && (
              <span id="preferred_date_error" className="error-message" role="alert">
                {errors['pickup.preferred_date']}
              </span>
            )}
          </div>
        </div>

        {/* Pickup Instructions */}
        <div className="form-group">
          <label htmlFor="pickup_instructions" className="form-label">
            Pickup Instructions <span className="label-optional">(Optional)</span>
          </label>
          <div className="input-wrapper">
            <MessageSquare className="input-icon textarea-icon" size={16} />
            <textarea
              id="pickup_instructions"
              name="pickup_instructions"
              rows={3}
              value={data.instructions || ''}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="e.g. 3rd floor with freight elevator access, please call 30 mins before arrival..."
              className="form-textarea with-icon-textarea"
            />
          </div>
          <span className="field-hint">
            Include elevator access, gate code, parking restrictions, or dismantling requirements.
          </span>
        </div>
      </div>
    </section>
  );
}
