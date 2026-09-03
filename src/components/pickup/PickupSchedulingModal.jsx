import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Truck, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  MapPin,
  DollarSign
} from 'lucide-react';
import { PICKUP_CONFIG } from '../../config/pickupRules.js';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function PickupSchedulingModal({
  isOpen,
  caseItem,
  onClose,
  onConfirmSchedule
}) {
  if (!isOpen || !caseItem) return null;

  const defaultDate = caseItem.returnRecord?.pickup?.preferred_date || new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState(PICKUP_CONFIG.mockFleet.timeSlots[0]);
  const [selectedDriverId, setSelectedDriverId] = useState(PICKUP_CONFIG.mockFleet.drivers[0].id);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    caseItem.is_bulky ? PICKUP_CONFIG.mockFleet.vehicles[2].id : PICKUP_CONFIG.mockFleet.vehicles[0].id
  );
  const [specialHandling, setSpecialHandling] = useState(
    caseItem.is_bulky ? ['Bulky item', 'Two-person pickup'] : []
  );

  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driver = PICKUP_CONFIG.mockFleet.drivers.find(d => d.id === selectedDriverId) || PICKUP_CONFIG.mockFleet.drivers[0];
  const vehicle = PICKUP_CONFIG.mockFleet.vehicles.find(v => v.id === selectedVehicleId) || PICKUP_CONFIG.mockFleet.vehicles[0];

  const handleToggleSpecialHandling = (opt) => {
    setSpecialHandling(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setShowConfirmationStep(true);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    const schedulePayload = {
      date: pickupDate,
      timeSlot,
      driver,
      vehicle,
      specialHandling
    };
    onConfirmSchedule(caseItem.return_id, schedulePayload);
    setIsSubmitting(false);
    setShowConfirmationStep(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content scheduling-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-primary-light" />
            <div>
              <h3 className="modal-title font-serif">
                {showConfirmationStep ? 'Confirm Pickup Dispatch' : 'Schedule Return Pickup'}
              </h3>
              <span className="text-xs text-dim">Case ID: {caseItem.return_id}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-4">
          {!showConfirmationStep ? (
            /* STEP 1: FORM INPUTS */
            <form onSubmit={handleProceedToConfirm} className="scheduling-form">
              {/* Target Item Overview */}
              <div className="scheduled-target-preview p-2.5 rounded bg-surface border border-subtle mb-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-dim block">Customer & Product:</span>
                  <span className="font-semibold text-primary">{caseItem.customer_name}</span> &bull; <span>{caseItem.product_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-dim block">Location:</span>
                  <span className="font-medium text-secondary">{caseItem.returnRecord?.pickup?.city || 'Bengaluru'}</span>
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="form-row-2 mb-3">
                <div className="form-group flex-1">
                  <label htmlFor="pickup-date-input" className="form-label text-xs">
                    Pickup Date:
                  </label>
                  <input
                    id="pickup-date-input"
                    type="date"
                    className="form-input text-xs"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="time-slot-select" className="form-label text-xs">
                    Time Window Slot:
                  </label>
                  <select
                    id="time-slot-select"
                    className="form-select text-xs"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {PICKUP_CONFIG.mockFleet.timeSlots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver & Vehicle Selection */}
              <div className="form-row-2 mb-3">
                <div className="form-group flex-1">
                  <label htmlFor="driver-select" className="form-label text-xs">
                    Assigned Field Driver:
                  </label>
                  <select
                    id="driver-select"
                    className="form-select text-xs"
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    {PICKUP_CONFIG.mockFleet.drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.zone})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="vehicle-select" className="form-label text-xs">
                    Fleet Vehicle:
                  </label>
                  <select
                    id="vehicle-select"
                    className="form-select text-xs"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                  >
                    {PICKUP_CONFIG.mockFleet.vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Handling Checkboxes (Section 16) */}
              <div className="special-handling-box mb-4">
                <label className="form-label text-xs block mb-1">Special Logistics Handling Requirements:</label>
                <div className="special-handling-grid">
                  {[
                    'Bulky item',
                    'Heavy item',
                    'Fragile item',
                    'Two-person pickup',
                    'Disassembly required'
                  ].map(opt => {
                    const isChecked = specialHandling.includes(opt);
                    return (
                      <label key={opt} className={`checkbox-option-item text-xs ${isChecked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSpecialHandling(opt)}
                          className="checkbox-native"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="modal-footer flex items-center justify-end gap-2 pt-3 border-top">
                <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5">
                  <span>Review & Confirm Dispatch</span> &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: CONFIRMATION DIALOG (Section 17) */
            <div className="scheduling-confirmation-view text-xs">
              <div className="confirmation-summary-card p-3 rounded bg-surface border border-card mb-3">
                <div className="text-xs uppercase text-dim font-bold mb-2">Dispatch Route Summary</div>
                
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Customer:</span>
                  <span className="font-semibold text-primary">{caseItem.customer_name}</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Product:</span>
                  <span className="font-semibold text-secondary">{caseItem.product_name}</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Scheduled Date & Time:</span>
                  <span className="font-bold text-primary-light">{pickupDate} &bull; {timeSlot}</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Assigned Driver:</span>
                  <span className="font-semibold text-secondary">{driver.name} ({driver.phone})</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Vehicle:</span>
                  <span className="font-semibold text-secondary">{vehicle.name} [{vehicle.type}]</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Estimated Distance:</span>
                  <span className="font-medium text-secondary">{caseItem.estimated_distance_km || 12} km</span>
                </div>
                <div className="summary-line flex justify-between py-1 border-bottom">
                  <span className="text-dim">Estimated Fleet Cost:</span>
                  <span className="font-bold text-amber-300">{formatCurrencyINR(caseItem.estimated_pickup_cost || 450)}</span>
                </div>
                {specialHandling.length > 0 && (
                  <div className="summary-line flex justify-between py-1">
                    <span className="text-dim">Special Handling:</span>
                    <span className="font-medium text-secondary">{specialHandling.join(', ')}</span>
                  </div>
                )}
              </div>

              <p className="text-dim text-2xs mb-3">
                Confirming will set operational status to <strong>SCHEDULED</strong>, notify the field driver, and append to the immutable audit timeline.
              </p>

              <div className="modal-footer flex items-center justify-end gap-2 pt-3 border-top">
                <button 
                  type="button" 
                  className="btn-ghost btn-sm" 
                  onClick={() => setShowConfirmationStep(false)}
                  disabled={isSubmitting}
                >
                  &larr; Back to Edit
                </button>
                <button 
                  type="button" 
                  className="btn-primary btn-sm flex items-center gap-1.5" 
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 size={14} />
                  <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
