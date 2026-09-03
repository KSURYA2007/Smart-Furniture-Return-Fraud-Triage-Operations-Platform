import React from 'react';
import { Package, Calendar, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Sofa',
  'Table',
  'Chair',
  'Bed',
  'Wardrobe',
  'Cabinet',
  'Other'
];

export default function OrderInformation({ data, errors, onChange }) {
  const handleChange = (field, value) => {
    onChange('order', { ...data, [field]: value });
  };

  return (
    <section className="form-card" id="section-order" aria-labelledby="heading-order">
      <div className="card-header">
        <div className="card-header-icon">
          <Package className="icon-blue" size={20} />
        </div>
        <div>
          <h2 id="heading-order" className="card-title">Order Information</h2>
          <p className="card-subtitle">Original purchase and item details for the bulky item</p>
        </div>
      </div>

      <div className="form-grid grid-2-col">
        {/* Order ID */}
        <div className="form-group">
          <label htmlFor="order_id" className="form-label required">
            Order ID
          </label>
          <div className="input-wrapper">
            <FileText className="input-icon" size={16} />
            <input
              type="text"
              id="order_id"
              name="order_id"
              value={data.order_id || ''}
              onChange={(e) => handleChange('order_id', e.target.value)}
              placeholder="e.g. ORD-5821"
              className={`form-input with-icon ${errors['order.order_id'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.order_id']}
              aria-describedby={errors['order.order_id'] ? 'order_id_error' : undefined}
            />
          </div>
          {errors['order.order_id'] && (
            <span id="order_id_error" className="error-message" role="alert">
              {errors['order.order_id']}
            </span>
          )}
        </div>

        {/* Product ID */}
        <div className="form-group">
          <label htmlFor="product_id" className="form-label required">
            Product ID / SKU
          </label>
          <div className="input-wrapper">
            <Tag className="input-icon" size={16} />
            <input
              type="text"
              id="product_id"
              name="product_id"
              value={data.product_id || ''}
              onChange={(e) => handleChange('product_id', e.target.value)}
              placeholder="e.g. PRD-SOFA-889"
              className={`form-input with-icon ${errors['order.product_id'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.product_id']}
              aria-describedby={errors['order.product_id'] ? 'product_id_error' : undefined}
            />
          </div>
          {errors['order.product_id'] && (
            <span id="product_id_error" className="error-message" role="alert">
              {errors['order.product_id']}
            </span>
          )}
        </div>

        {/* Product Name */}
        <div className="form-group">
          <label htmlFor="product_name" className="form-label required">
            Product Name
          </label>
          <div className="input-wrapper">
            <Package className="input-icon" size={16} />
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={data.product_name || ''}
              onChange={(e) => handleChange('product_name', e.target.value)}
              placeholder="e.g. 3-Seater Velvet Sofa - Royal Blue"
              className={`form-input with-icon ${errors['order.product_name'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.product_name']}
              aria-describedby={errors['order.product_name'] ? 'product_name_error' : undefined}
            />
          </div>
          {errors['order.product_name'] && (
            <span id="product_name_error" className="error-message" role="alert">
              {errors['order.product_name']}
            </span>
          )}
        </div>

        {/* Product Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label required">
            Product Category
          </label>
          <select
            id="category"
            name="category"
            value={data.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`form-select ${errors['order.category'] ? 'input-error' : ''}`}
            aria-invalid={!!errors['order.category']}
            aria-describedby={errors['order.category'] ? 'category_error' : undefined}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors['order.category'] && (
            <span id="category_error" className="error-message" role="alert">
              {errors['order.category']}
            </span>
          )}
        </div>

        {/* Product Price */}
        <div className="form-group">
          <label htmlFor="price" className="form-label required">
            Product Price ($)
          </label>
          <div className="input-wrapper">
            <span className="currency-prefix">$</span>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={data.price ?? ''}
              onChange={(e) => handleChange('price', e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0.00"
              className={`form-input with-prefix ${errors['order.price'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.price']}
              aria-describedby={errors['order.price'] ? 'price_error' : undefined}
            />
          </div>
          {errors['order.price'] && (
            <span id="price_error" className="error-message" role="alert">
              {errors['order.price']}
            </span>
          )}
        </div>

        {/* Purchase Date */}
        <div className="form-group">
          <label htmlFor="purchase_date" className="form-label required">
            Purchase Date
          </label>
          <div className="input-wrapper">
            <Calendar className="input-icon" size={16} />
            <input
              type="date"
              id="purchase_date"
              name="purchase_date"
              value={data.purchase_date || ''}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
              className={`form-input with-icon ${errors['order.purchase_date'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.purchase_date']}
              aria-describedby={errors['order.purchase_date'] ? 'purchase_date_error' : undefined}
            />
          </div>
          {errors['order.purchase_date'] && (
            <span id="purchase_date_error" className="error-message" role="alert">
              {errors['order.purchase_date']}
            </span>
          )}
        </div>

        {/* Delivery Date */}
        <div className="form-group">
          <label htmlFor="delivery_date" className="form-label required">
            Delivery Date
          </label>
          <div className="input-wrapper">
            <Calendar className="input-icon" size={16} />
            <input
              type="date"
              id="delivery_date"
              name="delivery_date"
              min={data.purchase_date || undefined}
              value={data.delivery_date || ''}
              onChange={(e) => handleChange('delivery_date', e.target.value)}
              className={`form-input with-icon ${errors['order.delivery_date'] ? 'input-error' : ''}`}
              aria-invalid={!!errors['order.delivery_date']}
              aria-describedby={errors['order.delivery_date'] ? 'delivery_date_error' : undefined}
            />
          </div>
          {errors['order.delivery_date'] && (
            <span id="delivery_date_error" className="error-message" role="alert">
              {errors['order.delivery_date']}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
