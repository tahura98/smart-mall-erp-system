import React from 'react';
import { Building2, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Building2,
  title = 'No records found',
  description = 'No data is currently registered in the database.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-amber-400 text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
