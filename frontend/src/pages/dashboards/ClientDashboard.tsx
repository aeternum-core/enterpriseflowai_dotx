import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Headphones,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  Search,
  ThumbsUp
} from 'lucide-react';

interface ClientDashboardProps {
  onNavigate: (path: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('Apex Financial Technologies');
  const [ticketNumber, setTicketNumber] = useState('TKT-84910');
  const [customerTier, setCustomerTier] = useState('Enterprise Tier 1 ($240k ARR)');
  const [inquiryText, setInquiryText] = useState(
    'Our automated end-of-month settlement webhook is failing with 429 Too Many Requests. We need urgent quota adjustment.'
  );

  const fetchClientData = async () => {
    try {
      const res = await fetch('/api/workflows?type=CUSTOMER_REQUEST_RESOLUTION');
      if (res.ok) {
        const d = await res.json();
        setWorkflows(Array.isArray(d) ? d : d.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClientData();
    const interval = setInterval(fetchClientData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Customer Resolution - ${customerName} (${ticketNumber})`,
          type: 'CUSTOMER_REQUEST_RESOLUTION',
          submittedByUserId: user?.id || 'usr-client-04',
          submittedByName: user?.name || 'Sophia Chen',
          submittedByRole: 'CLIENT_MANAGER',
          priority: 'HIGH',
          metadata: {
            customerName,
            ticketNumber,
            customerTier,
            inquiryText
          }
        })
      });

      if (res.ok) {
        const createdWf = await res.json();
        setShowSubmitModal(false);
        await fetchClientData();
        onNavigate(`/workflows/${createdWf.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreset = (type: 'apex' | 'quantum' | 'fintech') => {
    if (type === 'apex') {
      setCustomerName('Apex Financial Technologies');
      setTicketNumber('TKT-84910');
      setCustomerTier('Enterprise Tier 1 ($240k ARR)');
      setInquiryText('Our automated end-of-month settlement webhook is failing with 429 Too Many Requests. We need urgent burst quota adjustment.');
    } else if (type === 'quantum') {
      setCustomerName('Quantum Health Systems');
      setTicketNumber('TKT-99214');
      setCustomerTier('Healthcare SLA Gold');
      setInquiryText('HL7 FHIR batch ingestion pipeline is returning 504 Gateway Timeout during nocturnal backup synchronization.');
    } else {
      setCustomerName('FinEdge Capital Partners');
      setTicketNumber('TKT-77310');
      setCustomerTier('Pro Subscription');
      setInquiryText('How do we configure IP whitelisting for OAuth callback redirect endpoints?');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200">
              Customer Success & Experience
            </span>
            <span className="text-xs text-slate-400">Workflow C: Customer Request Resolution</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Autonomous Customer Support & Resolution Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            6 specialized agents: Classification, Knowledge Retrieval, Customer Info, Resolution Synthesis (Gemini LLM), Communication, and Escalation.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Submit Customer Ticket</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Inquiries</div>
          <div className="text-2xl font-black text-slate-900">{workflows.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Classified and enriched</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Resolution Time</div>
          <div className="text-2xl font-black text-pink-600">2.1 mins</div>
          <div className="text-[11px] text-slate-500 mt-1">SLA guarantee: &lt; 15 mins</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">AI Confidence Score</div>
          <div className="text-2xl font-black text-emerald-600">97.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Gemini reasoning verification</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">CSAT Rating</div>
          <div className="text-2xl font-black text-teal-600">4.9 / 5.0</div>
          <div className="text-[11px] text-slate-500 mt-1">Enterprise client feedback</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-pink-600" />
              Customer Requests & Resolution Progress
            </h2>
            <p className="text-xs text-slate-500">Autonomous synthesis, SLA tracking, and omnichannel delivery</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {workflows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No customer inquiries submitted yet. Click "Submit Customer Ticket" to start.
            </div>
          ) : (
            workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => onNavigate(`/workflows/${wf.id}`)}
                className="py-4 px-2 hover:bg-slate-50 rounded-xl cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{wf.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      wf.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      'bg-pink-100 text-pink-800 border-pink-200 animate-pulse'
                    }`}>
                      {(wf.status || 'PENDING').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-pink-700 font-bold">
                      {wf.metadata?.customerName || 'Customer'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {wf.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Tier: <strong>{wf.metadata?.customerTier || 'Enterprise'}</strong></span>
                    <span>•</span>
                    <span>Current Agent: <strong className="text-pink-600">{wf.currentAgentName || 'Resolution Agent'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-32 text-right">
                    <div className="text-xs font-bold text-slate-700 mb-1">{wf.progress}% Resolved</div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${wf.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-semibold flex items-center gap-1 transition">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Submit Customer Ticket */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Enterprise Customer Request</h3>
                <p className="text-slate-500">Autonomous AI classification, knowledge vector search, and solution generation</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="mt-4 p-3 bg-pink-50/70 border border-pink-100 rounded-xl">
              <span className="text-[11px] font-bold text-pink-900 block mb-1.5">
                ⚡ Sample Tickets (1-Click Fill):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePreset('apex')}
                  className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-lg text-xs font-semibold hover:bg-pink-100 transition"
                >
                  Apex Financial (API Rate Limit 429)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('quantum')}
                  className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-lg text-xs font-semibold hover:bg-pink-100 transition"
                >
                  Quantum Health (HL7 504 Timeout)
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 mt-4">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Account Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ticket / Case Ref #</label>
                  <input
                    type="text"
                    required
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SLA Subscription Tier</label>
                  <input
                    type="text"
                    required
                    value={customerTier}
                    onChange={(e) => setCustomerTier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Query / Technical Issue</label>
                <textarea
                  rows={3}
                  required
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Synthesizing...' : 'Dispatch to Agent Swarm'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
