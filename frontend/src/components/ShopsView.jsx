import React, { useState } from 'react';
import { Store, Plus, MapPin, User, DollarSign, Search, ShieldCheck } from 'lucide-react';

export default function ShopsView({ shops, setShops, users, currentRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form state for creating new shop
  const [formData, setFormData] = useState({
    shop_number: '',
    floor_name: 'Ground Floor',
    shop_name: '',
    owner_id: users.find((u) => u.role === 'shop_owner')?.id || 2,
    monthly_rent: '',
  });

  const shopOwners = users.filter((u) => u.role === 'shop_owner');

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.shop_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.owner_name && shop.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor = floorFilter === 'all' || shop.floor_name === floorFilter;
    return matchesSearch && matchesFloor;
  });

  const handleCreateShop = (e) => {
    e.preventDefault();
    if (!formData.shop_number || !formData.shop_name || !formData.monthly_rent) return;

    const owner = users.find((u) => u.id === parseInt(formData.owner_id, 10));
    const newShop = {
      id: Date.now(),
      shop_number: formData.shop_number,
      floor_name: formData.floor_name,
      shop_name: formData.shop_name,
      owner_id: parseInt(formData.owner_id, 10),
      owner_name: owner ? owner.name : 'Shop Owner',
      monthly_rent: parseFloat(formData.monthly_rent),
    };

    setShops([newShop, ...shops]);
    setShowModal(false);
    setFormData({
      shop_number: '',
      floor_name: 'Ground Floor',
      shop_name: '',
      owner_id: shopOwners[0]?.id || 2,
      monthly_rent: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by shop name, number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Floors</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="First Floor">First Floor</option>
            <option value="Second Floor">Second Floor</option>
          </select>
        </div>

        {/* Add Shop button (Admin view) */}
        {currentRole === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Shop
          </button>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                  {shop.shop_number}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-500" />
                  {shop.floor_name}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-3">{shop.shop_name}</h3>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="w-3.5 h-3.5" /> Assigned Owner:
                  </span>
                  <span className="font-semibold text-slate-800">{shop.owner_name || `Owner #${shop.owner_id}`}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-slate-500">
                    <DollarSign className="w-3.5 h-3.5" /> Monthly Lease:
                  </span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ${parseFloat(shop.monthly_rent).toLocaleString()} /mo
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Database ID: #{shop.id}</span>
              <span className="text-sky-600 font-medium hover:underline cursor-pointer">
                View Details &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800">No shops found</h4>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or floor filter.</p>
        </div>
      )}

      {/* Add Shop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register New Shop</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Jewels & Watches"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Shop Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F2-315"
                    value={formData.shop_number}
                    onChange={(e) => setFormData({ ...formData, shop_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Floor Name
                  </label>
                  <select
                    value={formData.floor_name}
                    onChange={(e) => setFormData({ ...formData, floor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Second Floor">Second Floor</option>
                    <option value="Third Floor">Third Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assigned Shop Owner (owner_id)
                </label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {shopOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Monthly Rent Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Save Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
