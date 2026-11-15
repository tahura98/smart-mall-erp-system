import React, { useState } from 'react';
import { DollarSign, Plus, FileText, Search, Store, Calendar, ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SalesView({ sales, setSales, products, setProducts, shops, currentRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id || 1);
  const [cartItems, setCartItems] = useState([
    { product_id: '', quantity: 1 }
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const shopProducts = products.filter((p) => p.shop_id === parseInt(selectedShopId, 10));

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.shop_name && sale.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleAddCartRow = () => {
    setCartItems([...cartItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveCartRow = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleCartChange = (index, field, value) => {
    const updated = [...cartItems];
    updated[index][field] = value;
    setCartItems(updated);
    setErrorMessage('');
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id === parseInt(item.product_id, 10));
      if (!prod) return acc;
      return acc + parseFloat(prod.price) * parseInt(item.quantity || 1, 10);
    }, 0);
  };

  const handlePOSCheckout = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (cartItems.length === 0 || !cartItems[0].product_id) {
      setErrorMessage('Please select at least one product for checkout.');
      return;
    }

    // Check stock for every item
    const deductions = [];
    for (const item of cartItems) {
      const prodId = parseInt(item.product_id, 10);
      const qty = parseInt(item.quantity, 10);
      const prod = products.find((p) => p.id === prodId);

      if (!prod) {
        setErrorMessage('Selected product was not found.');
        return;
      }

      if (prod.stock < qty) {
        setErrorMessage(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${qty}`);
        return;
      }

      deductions.push({ prodId, qty, unitPrice: prod.price });
    }

    // Deduct stock from products state
    setProducts((prev) =>
      prev.map((prod) => {
        const itemDeduction = deductions.find((d) => d.prodId === prod.id);
        if (itemDeduction) {
          return { ...prod, stock: Math.max(0, prod.stock - itemDeduction.qty) };
        }
        return prod;
      })
    );

    const totalAmount = calculateTotal();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const targetShop = shops.find((s) => s.id === parseInt(selectedShopId, 10));

    const newSale = {
      id: Date.now(),
      shop_id: parseInt(selectedShopId, 10),
      shop_name: targetShop ? targetShop.shop_name : `Shop #${selectedShopId}`,
      total_amount: totalAmount,
      invoice_number: invoiceNumber,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setSales([newSale, ...sales]);
    setShowModal(false);
    setCartItems([{ product_id: '', quantity: 1 }]);
    setSuccessMessage(`POS Sale ${invoiceNumber} completed! Stock automatically deducted.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Submit POS Sale (Stock Deduct)
        </button>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date / Timestamp
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {sale.invoice_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">{sale.shop_name}</div>
                    <div className="text-xs text-slate-400">Shop ID #{sale.shop_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {sale.created_at || 'Recently recorded'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">
                      ${parseFloat(sale.total_amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Checkout Modal with Automatic Stock Deduction */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">POS Checkout Terminal</h3>
                  <p className="text-xs text-slate-500">Stock is automatically deducted upon sale</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handlePOSCheckout} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Store / Shop
                </label>
                <select
                  value={selectedShopId}
                  onChange={(e) => {
                    setSelectedShopId(e.target.value);
                    setCartItems([{ product_id: '', quantity: 1 }]);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_number} - {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Cart Items (Line Items)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCartRow}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => {
                    const selProd = products.find((p) => p.id === parseInt(item.product_id, 10));
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <select
                          required
                          value={item.product_id}
                          onChange={(e) => handleCartChange(index, 'product_id', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none"
                        >
                          <option value="">Select Product...</option>
                          {shopProducts.map((p) => (
                            <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                              {p.name} (${parseFloat(p.price).toFixed(2)}) - [{p.stock} in stock]
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          max={selProd ? selProd.stock : 999}
                          required
                          value={item.quantity}
                          onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1.5 border border-slate-200 rounded text-xs text-center bg-white focus:outline-none"
                          placeholder="Qty"
                        />

                        {cartItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCartRow(index)}
                            className="text-slate-400 hover:text-rose-600 px-1 font-bold text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                  Total Payable Amount:
                </span>
                <span className="text-xl font-black text-indigo-700">
                  ${calculateTotal().toFixed(2)}
                </span>
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete POS Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
