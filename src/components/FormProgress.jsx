import React from 'react';
import { ClipboardList, Image, Truck, CheckCheck, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Return Details', icon: ClipboardList, targetId: 'section-customer' },
  { id: 2, label: 'Evidence', icon: Image, targetId: 'section-evidence' },
  { id: 3, label: 'Pickup Info', icon: Truck, targetId: 'section-pickup' },
  { id: 4, label: 'Review & Submit', icon: CheckCheck, targetId: 'section-review' }
];

export default function FormProgress({ activeStep = 1, completedSteps = [], onStepClick }) {
  return (
    <nav className="progress-container" aria-label="Return form progress">
      <div className="progress-track">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const IconComponent = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <button
                type="button"
                className={`progress-step-btn ${isActive ? 'step-active' : ''} ${isCompleted ? 'step-completed' : ''}`}
                onClick={() => onStepClick?.(step)}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="step-circle">
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.5} className="step-check-icon" />
                  ) : (
                    <span className="step-number">{step.id}</span>
                  )}
                </div>
                <div className="step-text-wrap">
                  <span className="step-title">{step.label}</span>
                </div>
              </button>

              {/* Connecting line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={`progress-line ${isCompleted ? 'progress-line-filled' : ''}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
