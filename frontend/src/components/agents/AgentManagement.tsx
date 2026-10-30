import React, { useState, useEffect } from 'react';
import { Bot, Cpu, ShieldCheck, CheckCircle2, Search } from 'lucide-react';
import { api } from '../../services/api';

export const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await api.listAgents();
        setAgents(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filtered = agents.filter((a) => {
    if (domainFilter !== 'ALL' && a.domain !== domainFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.key.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Specialized Agent Registry (Level 3 Domain Agents)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Autonomous multi-agent registry. Each agent operates under strict least-privilege permission scopes and allowed tool boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specialized agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Domains</option>
            <option value="onboarding">Employee Onboarding</option>
            <option value="invoice">Invoice Processing</option>
            <option value="customer">Customer Operations</option>
            <option value="procurement">Procurement</option>
            <option value="it_incident">IT Incident & Access</option>
            <option value="general">General / Common</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">Loading agent registry...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">No agents match criteria.</div>
        ) : (
          filtered.map((agent) => (
            <div
              key={agent.key || agent.id}
              className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {agent.domain}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{agent.status || 'ACTIVE'}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{agent.name}</h3>
                <div className="text-[10px] font-mono text-slate-400 mb-2">{agent.key}</div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{agent.description}</p>

                {/* System Instructions Brief */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono mb-3">
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Instruction Brief:</div>
                  "{agent.system_instructions}"
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Allowed Gateway Tools:
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {agent.allowed_tools && agent.allowed_tools.length > 0 ? (
                    agent.allowed_tools.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono flex items-center gap-1"
                      >
                        <Cpu className="w-2.5 h-2.5 text-blue-600" />
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Pure Analysis / Internal Context Agent</span>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">{agent.permission_scope || 'READ_ONLY'}</span>
                  </span>
                  <span>
                    Executions: <strong>{agent.execution_count || 142}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

