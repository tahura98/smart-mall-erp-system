import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatBDT, formatNumber } from '../../utils/formatters';
import {
  Layers,
  Building,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function AdminDirectory() {
  const [activeTab, setActiveTab] = useState('units'); // 'units' or 'floors'
  const [units, setUnits] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters for units
  const [filterFloor, setFilterFloor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchUnit, setSearchUnit] = useState('');

  // Modals state
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    unit_no: '',
    floor_id: '',
    unit_type: 'Office Suite',
    size_sqft: '',
    base_rent_bdt: '',
    cam_rate_per_sqft: '15.00',
    status: 'Vacant',
  });

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorForm, setFloorForm] = useState({
    level_name: '',
    zone_type: 'Corporate Office',
    block_code: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, floorsRes] = await Promise.all([
        api.get('/units'),
        api.get('/floors'),
      ]);
      setUnits(unitsRes.data?.units?.data || unitsRes.data?.units || []);
      setFloors(floorsRes.data?.floors || []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to load directory records from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show temporary feedback toast
  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ----------------------------------------------------
  // Unit Handlers
  // ----------------------------------------------------
  const handleOpenUnitModal = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        unit_no: unit.unit_no,
        floor_id: unit.floor_id,
        unit_type: unit.unit_type,
        size_sqft: unit.size_sqft,
        base_rent_bdt: unit.base_rent_bdt,
        cam_rate_per_sqft: unit.cam_rate_per_sqft,
        status: unit.status,
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        unit_no: '',
        floor_id: floors[0]?.id || '',
        unit_type: 'Office Suite',
        size_sqft: '',
        base_rent_bdt: '',
        cam_rate_per_sqft: '15.00',
        status: 'Vacant',
      });
    }
    setShowUnitModal(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await api.put(`/units/${editingUnit.id}`, unitForm);
        notify('success', `Unit ${unitForm.unit_no} updated successfully.`);
      } else {
        await api.post('/units', unitForm);
        notify('success', `Unit ${unitForm.unit_no} created successfully.`);
      }
      setShowUnitModal(false);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error saving unit.');
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Are you sure you want to delete Unit ${unit.unit_no}?`)) return;
    try {
      await api.delete(`/units/${unit.id}`);
      notify('success', `Unit ${unit.unit_no} deleted.`);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error deleting unit.');
    }
  };

  // ----------------------------------------------------
  // Floor Handlers
  // ----------------------------------------------------
  const handleOpenFloorModal = (floor = null) => {
    if (floor) {
      setEditingFloor(floor);
      setFloorForm({
        level_name: floor.level_name,
        zone_type: floor.zone_type,
        block_code: floor.block_code || '',
        description: floor.description || '',
      });
    } else {
      setEditingFloor(null);
      setFloorForm({
        level_name: '',
        zone_type: 'Corporate Office',
        block_code: '',
        description: '',
      });
    }
    setShowFloorModal(true);
  };

  const handleSaveFloor = async (e) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        await api.put(`/floors/${editingFloor.id}`, floorForm);
        notify('success', `Floor ${floorForm.level_name} updated successfully.`);
      } else {
        await api.post('/floors', floorForm);
        notify('success', `Floor ${floorForm.level_name} created successfully.`);
      }
      setShowFloorModal(false);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error saving floor.');
    }
  };

  const handleDeleteFloor = async (floor) => {
    if (!window.confirm(`Are you sure you want to delete ${floor.level_name}?`)) return;
    try {
      await api.delete(`/floors/${floor.id}`);
      notify('success', `Floor ${floor.level_name} deleted.`);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error deleting floor.');
    }
  };

  // Filtered units
  const filteredUnits = units.filter((u) => {
    const matchFloor = !filterFloor || String(u.floor_id) === String(filterFloor);
    const matchStatus = !filterStatus || u.status === filterStatus;
    const matchType = !filterType || u.unit_type === filterType;
    const matchSearch =
      !searchUnit || u.unit_no?.toLowerCase().includes(searchUnit.toLowerCase());
    return matchFloor && matchStatus && matchType && matchSearch;
  });

  // Calculate live preview in unit modal
  const previewCam = (Number(unitForm.size_sqft) || 0) * (Number(unitForm.cam_rate_per_sqft) || 0);
  const previewTotal = (Number(unitForm.base_rent_bdt) || 0) + previewCam;

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

      {/* Header and Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Space & Floor Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure architectural floors, blocks, retail shops, and corporate office suites.
          </p>
        </div>

        {/* Tab Switcher & Action Button */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-slate-200 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('units')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'units'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Units & Suites ({units.length})
            </button>
            <button
              onClick={() => setActiveTab('floors')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'floors'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Floors & Zones ({floors.length})
            </button>
          </div>

          {activeTab === 'units' ? (
            <button
              onClick={() => handleOpenUnitModal()}
              disabled={floors.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Unit
            </button>
          ) : (
            <button
              onClick={() => handleOpenFloorModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Floor
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: UNITS & SUITES */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Unit No..."
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Floor Filter */}
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Floors</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.level_name} ({f.zone_type})
                  </option>
                ))}
              </select>

              {/* Unit Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Types</option>
                <option value="Retail Shop">Retail Shop</option>
                <option value="Office Suite">Office Suite</option>
                <option value="Kiosk">Kiosk</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Statuses</option>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredUnits.length}</strong> of {units.length} units
            </div>
          </div>

          {/* Units Table */}
          {filteredUnits.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No Commercial Units Match Your Filters"
              description="Register new retail shops or corporate office suites under your created floors."
              actionText="Add New Unit"
              onAction={() => handleOpenUnitModal()}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Unit No</th>
                      <th className="py-3 px-4">Floor / Zone</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Size (Sq. Ft.)</th>
                      <th className="py-3 px-4 text-right">Base Rent (৳)</th>
                      <th className="py-3 px-4 text-right">CAM Rate (৳)</th>
                      <th className="py-3 px-4 text-right">Est. Monthly (৳)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnits.map((u) => {
                      const camAmt = (Number(u.size_sqft) || 0) * (Number(u.cam_rate_per_sqft) || 0);
                      const estMonthly = (Number(u.base_rent_bdt) || 0) + camAmt;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {u.unit_no}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">
                              {u.floor?.level_name || 'Unassigned'}
                            </div>
                            <div className="text-[10px] text-slate-500">{u.floor?.zone_type}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              {u.unit_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">
                            {formatNumber(u.size_sqft)} sqft
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900">
                            {formatBDT(u.base_rent_bdt)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            ৳ {Number(u.cam_rate_per_sqft || 15).toFixed(2)}/sqft
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-amber-700">
                            {formatBDT(estMonthly)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.status === 'Occupied'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : u.status === 'Maintenance'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenUnitModal(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Edit Unit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLOORS & ZONES */}
      {activeTab === 'floors' && (
        <div className="space-y-4">
          {floors.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Complex Floors Registered"
              description="Define the levels of Total Office Center (e.g. Ground Floor, Level 1, Food Court, Basement Parking)."
              actionText="Add Level / Floor"
              onAction={() => handleOpenFloorModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map((fl) => (
                <div
                  key={fl.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {fl.level_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {fl.zone_type}
                        </span>
                        {fl.block_code && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            {fl.block_code}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenFloorModal(fl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Floor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFloor(fl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Floor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 min-h-[32px]">
                    {fl.description || 'No architectural notes specified for this level.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Total Units: <strong>{fl.units_count || 0}</strong></span>
                    <span className="text-emerald-600">
                      {fl.occupied_units_count || 0} Occupied
                    </span>
                    <span className="text-amber-600">
                      {fl.vacant_units_count || 0} Vacant
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT UNIT */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100">
                {editingUnit ? `Edit Unit ${editingUnit.unit_no}` : 'Register Commercial Unit'}
              </h3>
              <button
                onClick={() => setShowUnitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suite-302 / Shop-G05"
                    value={unitForm.unit_no}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor Level *</label>
                  <select
                    required
                    value={unitForm.floor_id}
                    onChange={(e) => setUnitForm({ ...unitForm, floor_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Select Level</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.level_name} ({f.zone_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Type *</label>
                  <select
                    value={unitForm.unit_type}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Retail Shop">Retail Shop</option>
                    <option value="Office Suite">Office Suite</option>
                    <option value="Kiosk">Kiosk</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Size (Sq. Ft.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 1200"
                    value={unitForm.size_sqft}
                    onChange={(e) => setUnitForm({ ...unitForm, size_sqft: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Monthly Rent (BDT ৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 85000"
                    value={unitForm.base_rent_bdt}
                    onChange={(e) => setUnitForm({ ...unitForm, base_rent_bdt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">CAM Rate (৳ / sqft)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Standard 15.00"
                    value={unitForm.cam_rate_per_sqft}
                    onChange={(e) => setUnitForm({ ...unitForm, cam_rate_per_sqft: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Occupancy Status</label>
                <select
                  value={unitForm.status}
                  onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Dynamic Live Financial Breakdown Preview */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-[11px] text-amber-900">
                <div className="flex justify-between">
                  <span>Calculated Monthly CAM Charge:</span>
                  <strong>{formatBDT(previewCam)}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-amber-200 font-bold">
                  <span>Estimated Total BDT / Month:</span>
                  <span className="text-slate-950 font-black">{formatBDT(previewTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
                >
                  {editingUnit ? 'Save Changes' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FLOOR */}
      {showFloorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100">
                {editingFloor ? `Edit ${editingFloor.level_name}` : 'Add Complex Floor / Level'}
              </h3>
              <button
                onClick={() => setShowFloorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFloor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Level / Floor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor, Level 1, Basement 1"
                  value={floorForm.level_name}
                  onChange={(e) => setFloorForm({ ...floorForm, level_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Zoning Type *</label>
                  <select
                    value={floorForm.zone_type}
                    onChange={(e) => setFloorForm({ ...floorForm, zone_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Shopping Mall">Shopping Mall</option>
                    <option value="Food Court">Food Court</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Basement Parking">Basement Parking</option>
                    <option value="Rooftop Lounge">Rooftop Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Block Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Block-A"
                    value={floorForm.block_code}
                    onChange={(e) => setFloorForm({ ...floorForm, block_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Architectural Notes / Description</label>
                <textarea
                  rows={3}
                  placeholder="Facility features, escalators, emergency exits, etc."
                  value={floorForm.description}
                  onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFloorModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
                >
                  {editingFloor ? 'Save Floor' : 'Create Floor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
