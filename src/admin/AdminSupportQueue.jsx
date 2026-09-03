import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  User 
} from 'lucide-react';
import { getAllCustomerSupportTickets, answerSupportTicket } from '../services/customerPortalService.js';
import { subscribeRealtime, REALTIME_EVENTS } from '../utils/realtimeBus.js';

export default function AdminSupportQueue() {
  const [tickets, setTickets] = useState(() => getAllCustomerSupportTickets());
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  React.useEffect(() => {
    const refresh = () => setTickets(getAllCustomerSupportTickets());
    return subscribeRealtime(REALTIME_EVENTS.SUPPORT_UPDATED, refresh);
  }, []);

  const handleSendReply = (ticketId) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    answerSupportTicket(ticketId, text.trim(), 'Surya Prakash (Operations Lead)');
    setTickets(getAllCustomerSupportTickets());
    setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    setActiveReplyId(null);
  };

  return (
    <div className="admin-support-queue space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-secondary">Customer Inquiries & Appeals Queue</h1>
          <p className="text-dim text-2xs">Review customer questions, packaging inquiries, and decision appeals</p>
        </div>
        <span className="badge-prototype-tag font-mono text-3xs font-bold">
          {tickets.filter(t => t.status === 'OPEN').length} Open Tickets
        </span>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-dim bg-surface rounded-xl border border-subtle">
            <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400" />
            <p className="font-bold text-secondary">No customer support tickets pending.</p>
          </div>
        ) : (
          tickets.map(tkt => (
            <div key={tkt.id} className="p-4 rounded-xl bg-surface border border-subtle space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">{tkt.id}</span>
                  <strong className="text-secondary text-sm">{tkt.subject}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xs text-dim">
                    {new Date(tkt.createdAt).toLocaleString()}
                  </span>
                  <span className={`priority-pill font-mono text-3xs font-bold ${
                    tkt.status === 'RESOLVED' ? 'badge-risk-low' : 'badge-risk-medium'
                  }`}>
                    {tkt.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-dim text-3xs font-mono">
                <span>Customer: <strong>{tkt.customerId}</strong></span>
                <span>Return Ref: <strong>{tkt.returnId || 'General'}</strong></span>
              </div>

              <p className="bg-card p-3 rounded-lg border border-subtle text-secondary leading-relaxed">
                &ldquo;{tkt.message}&rdquo;
              </p>

              {tkt.reply ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-emerald-200">
                  <strong className="block text-emerald-400 text-3xs font-bold mb-0.5">Staff Operational Response:</strong>
                  <p>{tkt.reply}</p>
                </div>
              ) : (
                <div>
                  {activeReplyId === tkt.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        className="form-input text-xs w-full min-h-[60px]"
                        placeholder="Type customer-safe response..."
                        value={replyText[tkt.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [tkt.id]: e.target.value })}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn-ghost btn-xs"
                          onClick={() => setActiveReplyId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-primary btn-xs font-bold"
                          onClick={() => handleSendReply(tkt.id)}
                        >
                          Send Reply & Mark Resolved
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary btn-xs flex items-center gap-1 font-bold"
                      onClick={() => setActiveReplyId(tkt.id)}
                    >
                      <MessageSquare size={12} />
                      <span>Reply to Customer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
