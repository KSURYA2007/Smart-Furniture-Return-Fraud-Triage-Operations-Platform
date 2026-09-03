import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  getCustomerSupportTickets, 
  submitCustomerSupportTicket, 
  getCustomerReturns 
} from '../services/customerPortalService.js';
import { subscribeRealtime, REALTIME_EVENTS } from '../utils/realtimeBus.js';

export default function CustomerSupport({ activeCustomer, initialReturnId = null }) {
  const [userReturns, setUserReturns] = useState(() => getCustomerReturns(activeCustomer.id));
  const [tickets, setTickets] = useState(() => getCustomerSupportTickets(activeCustomer.id));
  const [subjectCategory, setSubjectCategory] = useState('Return question');
  const [selectedReturnId, setSelectedReturnId] = useState(initialReturnId || '');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState(null);

  React.useEffect(() => {
    const refresh = () => {
      setTickets(getCustomerSupportTickets(activeCustomer.id));
      setUserReturns(getCustomerReturns(activeCustomer.id));
    };
    refresh();
    return subscribeRealtime('*', refresh);
  }, [activeCustomer.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const res = submitCustomerSupportTicket({
      customerId: activeCustomer.id,
      returnId: selectedReturnId,
      subject: subjectCategory,
      message
    });

    if (res.success) {
      setTickets(getCustomerSupportTickets(activeCustomer.id));
      setMessage('');
      setNotice('Your inquiry has been routed to our customer operations team. We reply within 4 hours.');
      setTimeout(() => setNotice(null), 4500);
    }
  };

  return (
    <div className="csup-root">
      {/* Header */}
      <div className="csup-header">
        <div>
          <h1 className="csup-title">Customer Care &amp; Support</h1>
          <p className="csup-subtitle">
            Have questions about your return, evidence submission, or doorstep pickup? We're here to help.
          </p>
        </div>
      </div>

      {notice && (
        <div className="csup-notice-banner">
          <CheckCircle2 size={18} className="csup-notice-icon" />
          <span>{notice}</span>
        </div>
      )}

      {/* Support Ticket Submission Card */}
      <div className="csup-card">
        <div className="csup-card-header">
          <div>
            <h3 className="csup-card-title">Submit Support Inquiry</h3>
            <p className="csup-card-sub">Send a message directly to our claims and logistics desk</p>
          </div>
          <span className="csup-badge-sla">
            <Clock size={12} /> Response within 4 hours
          </span>
        </div>

        <form onSubmit={handleSubmit} className="csup-form">
          <div className="csup-form-grid">
            <div className="csup-form-group">
              <label className="csup-label">Inquiry Topic</label>
              <select
                className="csup-select"
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
              >
                <option value="Return question">Return question or policy</option>
                <option value="Pickup issue">Doorstep pickup timing or rescheduling</option>
                <option value="Evidence question">Photo evidence clarification</option>
                <option value="Decision appeal">Review decision inquiry</option>
                <option value="Other">Other question</option>
              </select>
            </div>

            <div className="csup-form-group">
              <label className="csup-label">Related Return (Optional)</label>
              <select
                className="csup-select csup-mono"
                value={selectedReturnId}
                onChange={(e) => setSelectedReturnId(e.target.value)}
              >
                <option value="">None / General Inquiry</option>
                {userReturns.map(r => (
                  <option key={r.returnId} value={r.returnId}>
                    {r.returnId} - {r.productName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="csup-form-group">
            <label className="csup-label">Your Message</label>
            <textarea
              className="csup-textarea"
              placeholder="Please detail your question, claim reference, or pickup instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="csup-form-footer">
            <span className="csup-footer-note">A claims coordinator will review your case notes</span>
            <button type="submit" className="csup-btn-submit">
              <Send size={15} />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>

      {/* Previous Inquiries Section */}
      <div className="csup-card">
        <div className="csup-card-header">
          <div>
            <h3 className="csup-card-title">My Support Inquiries ({tickets.length})</h3>
            <p className="csup-card-sub">Track active and resolved conversations with our support team</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="csup-empty">
            <MessageSquare size={36} className="csup-empty-icon" />
            <h4 className="csup-empty-title">No previous support inquiries recorded</h4>
            <p className="csup-empty-desc">When you submit an inquiry above, our response will appear here.</p>
          </div>
        ) : (
          <div className="csup-tickets-list">
            {tickets.map(tkt => (
              <div key={tkt.id} className="csup-ticket-item">
                {/* Ticket Top bar */}
                <div className="csup-ticket-top">
                  <div className="csup-ticket-ident">
                    <span className="csup-ticket-id">{tkt.id}</span>
                    <strong className="csup-ticket-subject">{tkt.subject}</strong>
                  </div>
                  <span className={`csup-status-badge ${tkt.status === 'RESOLVED' ? 'csup-badge-resolved' : 'csup-badge-open'}`}>
                    {tkt.status}
                  </span>
                </div>

                {/* Customer question message */}
                <div className="csup-msg-box">
                  <span className="csup-msg-label">Your Question:</span>
                  <p className="csup-msg-content">&ldquo;{tkt.message}&rdquo;</p>
                </div>

                {/* Care team response */}
                {tkt.reply && (
                  <div className="csup-reply-box">
                    <div className="csup-reply-header">
                      <Sparkles size={14} className="csup-sparkle-icon" />
                      <strong>Care Team Response:</strong>
                    </div>
                    <p className="csup-reply-content">{tkt.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
