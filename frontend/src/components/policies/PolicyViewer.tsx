import React, { useState, useEffect } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

export const PolicyViewer: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.listPolicies();
      setPolicies(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.togglePolicy(id);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Enterprise Policies & Risk Guardrails Engine
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Decoupled, backend-enforced rule definitions. Dictates when operations require human approval, assigns required reviewer roles, and configures SLA deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((p) => (
          <div
            key={p.id}
            className={`p-5 bg-white rounded-xl border transition-all ${
              p.is_active ? 'border-slate-200 shadow-2xs' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.risk_level === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : p.risk_level === 'HIGH'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {p.risk_level} RISK
              </span>

              <button
                onClick={() => handleToggle(p.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {p.is_active ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                )}
                <span>{p.is_active ? 'Active' : 'Disabled'}</span>
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h3>
            <div className="text-[11px] font-mono text-slate-400 mb-3">Operation: {p.operation_type}</div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Required Approver</span>
                <div className="font-semibold text-blue-600">{p.required_role}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Financial Threshold</span>
                <div className="font-bold text-slate-800">
                  {p.min_financial_threshold > 0
                    ? `> $${p.min_financial_threshold.toLocaleString()}`
                    : 'All Invocations'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">SLA Deadline</span>
                <div className="font-medium text-slate-700">{p.sla_hours} Hours</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Evidence Required</span>
                <div className="font-medium text-slate-700">{p.requires_evidence ? 'YES' : 'NO'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

