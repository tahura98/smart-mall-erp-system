import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Building,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function AdminMaintenance() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Status Update Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'In Progress',
    resolution_notes: '',
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/tickets');
      setTickets(res.data?.tickets?.data || res.data?.tickets || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Error loading maintenance tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatusForm({
      status: ticket.status,
      resolution_notes: ticket.resolution_notes || '',
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/maintenance/tickets/${selectedTicket.id}/status`, statusForm);
      notify('success', `Ticket ${selectedTicket.ticket_no} updated to '${statusForm.status}'.`);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (ticket) => {
    if (!window.confirm(`Delete ticket ${ticket.ticket_no}?`)) return;
    try {
      await api.delete(`/maintenance/tickets/${ticket.id}`);
      notify('success', `Ticket ${ticket.ticket_no} deleted.`);
      fetchTickets();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error deleting ticket.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchCat = !filterCategory || t.issue_category === filterCategory;
    const matchPri = !filterPriority || t.priority === filterPriority;
    const matchStat = !filterStatus || t.status === filterStatus;
    const matchSearch =
      !search ||
      t.ticket_no?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.unit?.unit_no?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchPri && matchStat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Facilities & Maintenance Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor Central AC, elevators, electrical distributions, and plumbing across Total Office Center.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Ticket, Unit, Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            <option value="Central AC">Central AC</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Elevator">Elevator</option>
            <option value="Security">Security</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredTickets.length}</strong> Tickets listed
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Maintenance Tickets On File"
          description="Zero breakdown or service requests match your selected filters. All building facilities are currently operating normally."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket No</th>
                  <th className="py-3 px-4">Demised Unit</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Logged At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.ticket_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {t.unit ? `Unit ${t.unit.unit_no}` : 'Common Complex Facility'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t.unit?.floor?.level_name || 'Complex Building'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {t.issue_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-800 font-medium line-clamp-2">{t.description}</p>
                      {t.resolution_notes && (
                        <p className="text-[10px] text-emerald-700 mt-1 italic">
                          Resolution: {t.resolution_notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : t.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'Resolved' || t.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {formatDateTime(t.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStatusModal(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Update Status & Notes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE TICKET STATUS */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                Update Ticket #{selectedTicket.ticket_no}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{selectedTicket.issue_category}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{selectedTicket.description}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Workflow Status *</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Engineering / Resolution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail parts replaced, technician assigned, or repair completion notes..."
                  value={statusForm.resolution_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, resolution_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
