import React, { useState } from 'react';
import { Package, Plus, Barcode, Search, AlertTriangle, Check, DollarSign, Store } from 'lucide-react';

export default function ProductsView({ products, setProducts, shops, currentRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [shopFilter, setShopFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    shop_id: shops[0]?.id || 1,
    name: '',
    barcode: '',
    price: '',
    stock: '',
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShop = shopFilter === 'all' || product.shop_id === parseInt(shopFilter, 10);
    return matchesSearch && matchesShop;
  });

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.price) return;

    const targetShop = shops.find((s) => s.id === parseInt(formData.shop_id, 10));
    const newProduct = {
      id: Date.now(),
      shop_id: parseInt(formData.shop_id, 10),
      shop_name: targetShop ? targetShop.shop_name : `Shop #${formData.shop_id}`,
      name: formData.name,
      barcode: formData.barcode,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock || 0, 10),
    };

    setProducts([newProduct, ...products]);
    setShowModal(false);
    setFormData({
      shop_id: shops[0]?.id || 1,
      name: '',
      barcode: '',
      price: '',
      stock: '',
    });
  };

  const updateStock = (productId, delta) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.shop_number} - {shop.shop_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shop Owner Store
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Barcode (Unique)
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Retail Price
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quick Adjust
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock < 20;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-400">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{product.shop_name}</div>
                      <div className="text-xs text-slate-400">Shop ID: {product.shop_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 font-mono text-xs text-slate-700 border border-slate-200">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        {product.barcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isLowStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isLowStock ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {product.stock} units
                        </span>
                        {isLowStock && (
                          <span className="text-[10px] text-amber-600 font-medium">Low stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateStock(product.id, -1)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                          title="Decrease stock"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-white text-xs font-bold text-slate-800">
                          {product.stock}
                        </span>
                        <button
                          onClick={() => updateStock(product.id, 1)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                          title="Increase stock"
                        >
                          +
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

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Ergonomic Keyboard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Shop (shop_id)
                </label>
                <select
                  value={formData.shop_id}
                  onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_number} - {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Unique Barcode
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8904567001"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="299.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
