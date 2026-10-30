import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import { ApprovalMetrics } from '../../services/api';

interface MetricCardsProps {
  metrics: ApprovalMetrics | null;
  loading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, loading }) => {
  const cards = [
    {
      id: 'pending',
      title: 'Pending Approvals',
      value: loading || !metrics ? '...' : metrics.pending_count,
      subtext: 'Awaiting human authorization',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200/80',
    },
    {
      id: 'approved',
      title: 'Approved This Month',
      value: loading || !metrics ? '...' : metrics.approved_this_month,
      subtext: 'Completed & resumed workflows',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
    },
    {
      id: 'due_soon',
      title: 'Due Soon / Overdue',
      value: loading || !metrics ? '...' : metrics.due_soon_count,
      subtext: 'SLA deadline within 24 hours',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200/80',
    },
    {
      id: 'financial_value',
      title: 'Total Pending Financial Value',
      value: loading || !metrics
        ? '...'
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.total_financial_value),
      subtext: 'Treasury & procurement commitment',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 bg-white rounded-xl border ${card.borderColor} shadow-xs hover:shadow-sm transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

