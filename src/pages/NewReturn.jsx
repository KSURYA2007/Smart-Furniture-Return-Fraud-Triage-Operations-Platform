import React, { useState, useEffect } from 'react';
import CustomerInformation from '../components/CustomerInformation';
import OrderInformation from '../components/OrderInformation';
import ReturnDetails from '../components/ReturnDetails';
import EvidenceUpload from '../components/EvidenceUpload';
import PickupInformation from '../components/PickupInformation';
import FormProgress from '../components/FormProgress';
import SubmitButton from '../components/SubmitButton';
import { validateReturnForm } from '../utils/validation';
import { generateReturnId } from '../utils/returnId';
import { 
  Package, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

const INITIAL_STATE = {
  customer: {
    customer_id: '',
    name: '',
    email: '',
    phone: ''
  },
  order: {
    order_id: '',
    product_id: '',
    product_name: '',
    category: '',
    price: '',
    purchase_date: '',
    delivery_date: ''
  },
  return: {
    reason: '',
    additional_reason: '',
    condition: '',
    description: ''
  },
  evidence: [],
  pickup: {
    address: '',
    city: '',
    postal_code: '',
    preferred_date: '',
    instructions: ''
  }
};

export default function NewReturn({ onSuccess, greeting }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Update a top-level section of the form data
  const handleSectionChange = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data
    }));

    // Clear associated errors for this section
    setErrors((prevErrors) => {
      const updated = { ...prevErrors };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(section)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  // Determine completed steps dynamically
  const getCompletedSteps = () => {
    const completed = [];
    // Step 1: Return details & customer & order
    const hasCust = formData.customer.customer_id && formData.customer.name && formData.customer.email;
    const hasOrder = formData.order.order_id && formData.order.product_name && formData.order.category;
    const hasReturn = formData.return.reason && formData.return.condition && formData.return.description;
    if (hasCust && hasOrder && hasReturn) completed.push(1);

    // Step 2: Evidence
    if (formData.evidence && formData.evidence.length > 0) completed.push(2);

    // Step 3: Pickup
    if (formData.pickup.address && formData.pickup.city && formData.pickup.postal_code && formData.pickup.preferred_date) {
      completed.push(3);
    }

    return completed;
  };

  // Auto-update active step on scroll (Scrollspy)
  useEffect(() => {
    let isTicking = false;

    const handleScroll = () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          const navbarEl = document.querySelector('.navbar');
          const stepperEl = document.querySelector('.progress-container');
          const navH = navbarEl ? navbarEl.offsetHeight : 76;
          const stepH = stepperEl ? stepperEl.offsetHeight : 64;
          const offset = navH + stepH + 36;

          const sections = [
            { id: 'section-customer', step: 1 },
            { id: 'section-evidence', step: 2 },
            { id: 'section-pickup', step: 3 },
            { id: 'section-review', step: 4 },
          ];

          let currentStep = 1;
          for (let i = 0; i < sections.length; i++) {
            const el = document.getElementById(sections[i].id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= offset) {
                currentStep = sections[i].step;
              }
            }
          }

          // Check if reached very bottom of the page -> set to step 4
          if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
            currentStep = 4;
          }

          setActiveStep(currentStep);
          isTicking = false;
        });
        isTicking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section when clicked from progress or review with offset
  const scrollToSection = (sectionId, stepId) => {
    if (stepId) setActiveStep(stepId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navbarEl = document.querySelector('.navbar');
      const stepperEl = document.querySelector('.progress-container');
      const navH = navbarEl ? navbarEl.offsetHeight : 76;
      const stepH = stepperEl ? stepperEl.offsetHeight : 64;
      const topOffset = navH + stepH + 20;

      const elemPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elemPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all fields in this return request?')) {
      setFormData(INITIAL_STATE);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const validationErrors = validateReturnForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Find first error and scroll to it
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorField = document.querySelector(`[name="${firstErrorKey.split('.').pop()}"]`) ||
                         document.querySelector(`[name="${firstErrorKey}"]`) ||
                         document.getElementById('evidence-file-input');
      if (errorField) {
        errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Generate unique Return ID in RET-YYYY-XXXXXX format
    const returnId = generateReturnId();
    const timestamp = new Date().toISOString();

    const returnRecord = {
      return_id: returnId,
      customer: {
        customer_id: formData.customer.customer_id.trim(),
        name: formData.customer.name.trim(),
        email: formData.customer.email.trim(),
        phone: formData.customer.phone.trim()
      },
      order: {
        order_id: formData.order.order_id.trim(),
        product_id: formData.order.product_id.trim(),
        product_name: formData.order.product_name.trim(),
        category: formData.order.category,
        price: Number(formData.order.price),
        purchase_date: formData.order.purchase_date,
        delivery_date: formData.order.delivery_date
      },
      return: {
        reason: formData.return.reason,
        additional_reason: formData.return.reason === 'Other' ? (formData.return.additional_reason || '').trim() : '',
        condition: formData.return.condition,
        description: formData.return.description.trim()
      },
      evidence: formData.evidence.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        type: item.type,
        dataUrl: item.dataUrl,
        uploadedAt: item.uploadedAt
      })),
      pickup: {
        address: formData.pickup.address.trim(),
        city: formData.pickup.city.trim(),
        postal_code: formData.pickup.postal_code.trim(),
        preferred_date: formData.pickup.preferred_date,
        instructions: (formData.pickup.instructions || '').trim()
      },
      status: 'SUBMITTED',
      created_at: timestamp
    };

    // Save to localStorage under 'return_requests'
    try {
      const existing = localStorage.getItem('return_requests');
      const requests = existing ? JSON.parse(existing) : [];
      requests.unshift(returnRecord);
      localStorage.setItem('return_requests', JSON.stringify(requests));
    } catch (storageErr) {
      console.warn('LocalStorage error, saving single record:', storageErr);
      try {
        localStorage.setItem('return_requests', JSON.stringify([returnRecord]));
      } catch (e) {
        console.error('Failed to write to localStorage', e);
      }
    }

    // Simulate small network delay for realism
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(returnRecord);
      }
    }, 600);
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <header className="page-header">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Layers size={13} /> Module 1: Return Data Collection
            </span>
          </div>
          {greeting && <div className="header-greeting">{greeting}</div>}
          <h1 className="page-title">Create Return Request</h1>
          <p className="page-description">
            Provide the order, product condition, damage details, evidence, and pickup information to create a return request.
          </p>
        </div>

        {/* Form Toolbar */}
        <div className="demo-actions-bar">
          <button
            type="button"
            onClick={handleResetForm}
            className="btn-ghost btn-sm"
            title="Clear all fields"
          >
            <RefreshCw size={14} /> Reset Form
          </button>
        </div>
      </header>

      {/* Form Progress Indicator */}
      <FormProgress
        activeStep={activeStep}
        completedSteps={getCompletedSteps()}
        onStepClick={(step) => scrollToSection(step.targetId, step.id)}
      />

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} noValidate className="return-form">
        {/* Section 1: Customer Information */}
        <CustomerInformation
          data={formData.customer}
          errors={errors}
          onChange={handleSectionChange}
        />

        {/* Section 2: Order Information */}
        <OrderInformation
          data={formData.order}
          errors={errors}
          onChange={handleSectionChange}
        />

        {/* Section 3: Return Details & Product Condition */}
        <ReturnDetails
          data={formData.return}
          errors={errors}
          onChange={handleSectionChange}
        />

        {/* Section 4: Damage Evidence Upload */}
        <EvidenceUpload
          evidenceList={formData.evidence}
          error={errors['evidence']}
          onChange={(newEvidence) => handleSectionChange('evidence', newEvidence)}
        />

        {/* Section 5: Bulky Item Pickup Logistics */}
        <PickupInformation
          data={formData.pickup}
          errors={errors}
          onChange={handleSectionChange}
        />

        {/* Section 6: Review Before Submission */}
        <section className="form-card review-card" id="section-review" aria-labelledby="heading-review">
          <div className="card-header">
            <div className="card-header-icon bg-emerald-light">
              <CheckCircle2 className="icon-emerald" size={20} />
            </div>
            <div>
              <h2 id="heading-review" className="card-title">Review Return Request</h2>
              <p className="card-subtitle">Verify all key return details before final submission</p>
            </div>
          </div>

          <div className="review-grid">
            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Customer</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-customer', 1)}
                  aria-label="Edit customer information"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.customer.name || <span className="text-muted">Not specified</span>}
                {formData.customer.customer_id && ` (${formData.customer.customer_id})`}
              </span>
            </div>

            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Order</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-order', 1)}
                  aria-label="Edit order details"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.order.order_id || <span className="text-muted">Not specified</span>}
              </span>
            </div>

            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Product</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-order', 1)}
                  aria-label="Edit product details"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.order.product_name || <span className="text-muted">Not specified</span>}
                {formData.order.price ? ` ($${Number(formData.order.price).toFixed(2)})` : ''}
              </span>
            </div>

            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Condition</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-return-details', 1)}
                  aria-label="Edit return condition"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.return.condition ? (
                  <span className="badge-condition-pill">{formData.return.condition}</span>
                ) : (
                  <span className="text-muted">Not selected</span>
                )}
              </span>
            </div>

            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Evidence</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-evidence', 2)}
                  aria-label="Edit evidence photos"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.evidence && formData.evidence.length > 0 ? (
                  `${formData.evidence.length} photo${formData.evidence.length > 1 ? 's' : ''}`
                ) : (
                  <span className="text-danger">0 photos uploaded</span>
                )}
              </span>
            </div>

            <div className="review-item">
              <div className="review-label-wrap">
                <span className="review-label">Pickup Date</span>
                <button
                  type="button"
                  className="review-edit-btn"
                  onClick={() => scrollToSection('section-pickup', 3)}
                  aria-label="Edit pickup details"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <span className="review-value">
                {formData.pickup.preferred_date || <span className="text-muted">Not selected</span>}
              </span>
            </div>
          </div>

          {/* Validation Warning Summary if any errors exist */}
          {Object.keys(errors).length > 0 && (
            <div className="form-summary-error-banner" role="alert">
              <AlertCircle size={18} className="error-banner-icon" />
              <div>
                <strong>Please correct {Object.keys(errors).length} issue{Object.keys(errors).length > 1 ? 's' : ''} before submitting:</strong>
                <ul className="error-list-compact">
                  {Object.entries(errors).slice(0, 4).map(([field, msg]) => (
                    <li key={field}>{msg}</li>
                  ))}
                  {Object.keys(errors).length > 4 && (
                    <li>...and {Object.keys(errors).length - 4} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="submit-action-bar">
            <p className="submission-disclaimer">
              By submitting this return request, you confirm that the damage details and evidence provided are accurate.
            </p>
            <SubmitButton isSubmitting={isSubmitting} />
          </div>
        </section>
      </form>
    </div>
  );
}
