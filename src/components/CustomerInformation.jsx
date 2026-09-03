import React from 'react';
import { User, Mail, Phone, Hash } from 'lucide-react';

export default function CustomerInformation({ data, errors, onChange }) {
  const handleChange = (field, value) => {
    onChange('customer', { ...data, [field]: value });
  };

  return (
    <section className="form-card" id="section-customer" aria-labelledby="heading-customer">
      <div className="card-header">
        <div className="card-header-icon">
          <User className="icon-blue" size={20} />
        </div>
        <div>
          <h2 id="heading-customer" className="card-title">Customer Information</h2>
          <p className="card-subtitle">Customer account details associated with this return</p>
        </div>
      </div>

      <div className="form-grid grid-2-col">
        {/* Customer ID */}
        <div className="form-group">
          <label htmlFor="customer_id" className="form-label required">
            Customer ID
          </label>
          <div className="input-wrapper">
            <Hash className="input-icon" size={16} />
            <input
              type="text"
              id="customer_id"
              name="customer_id"
              value={data.customer_id || ''}
              onChange={(e) => handleChange('customer_id', e.target.value)}
              placeholder="e.g. CUS-1024"
              className={`form-input with-icon ${errors['customer.customer_id'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['customer.customer_id']}
              aria-describedby={errors['customer.customer_id'] ? 'customer_id_error' : undefined}
            />
          </div>
          {errors['customer.customer_id'] && (
            <span id="customer_id_error" className="error-message" role="alert">
              {errors['customer.customer_id']}
            </span>
          )}
        </div>

        {/* Customer Name */}
        <div className="form-group">
          <label htmlFor="customer_name" className="form-label required">
            Customer Name
          </label>
          <div className="input-wrapper">
            <User className="input-icon" size={16} />
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. John Smith"
              className={`form-input with-icon ${errors['customer.name'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['customer.name']}
              aria-describedby={errors['customer.name'] ? 'customer_name_error' : undefined}
            />
          </div>
          {errors['customer.name'] && (
            <span id="customer_name_error" className="error-message" role="alert">
              {errors['customer.name']}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="customer_email" className="form-label required">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={16} />
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. john@example.com"
              className={`form-input with-icon ${errors['customer.email'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['customer.email']}
              aria-describedby={errors['customer.email'] ? 'customer_email_error' : undefined}
            />
          </div>
          {errors['customer.email'] && (
            <span id="customer_email_error" className="error-message" role="alert">
              {errors['customer.email']}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="customer_phone" className="form-label required">
            Phone Number
          </label>
          <div className="input-wrapper">
            <Phone className="input-icon" size={16} />
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className={`form-input with-icon ${errors['customer.phone'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['customer.phone']}
              aria-describedby={errors['customer.phone'] ? 'customer_phone_error' : undefined}
            />
          </div>
          {errors['customer.phone'] && (
            <span id="customer_phone_error" className="error-message" role="alert">
              {errors['customer.phone']}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
