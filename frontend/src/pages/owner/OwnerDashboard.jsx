import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { initialData } from '../../data/mockData';
import {
  ShoppingCart,
  Package,
  Plus,
  Search,
  Barcode,
  Printer,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Check,
  Store,
  DollarSign,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'inventory' | 'sales'

  // Determine owner's primary shop
  const ownerShops = initialData.shops.filter((s) => s.owner_id === user?.id) || [];
  const currentShop = ownerShops[0] || initialData.shops[0];

  // Products & Sales state
  const [products, setProducts] = useState(
    initialData.products.filter((p) => p.shop_id === currentShop.id)
  );
  const [sales, setSales] = useState(
    initialData.sales.filter((s) => s.shop_id === currentShop.id)
  );

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Invoice Modal State
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Inventory Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    price: '',
    stock: '',
  });

  // Fetch live products for owner from backend
  useEffect(() => {
    api.get('/owner/products')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {});

    api.get('/owner/sales')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setSales(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // POS Product Filter
  const filteredPOSProducts = products.filter((p) => {
    const q = posSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) return;

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= product.stock) {
        alert(`Cannot add more. Available stock for ${product.name} is ${product.stock}.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, newQty) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > prod.stock) {
      alert(`Only ${prod.stock} units available in stock.`);
      return;
    }

    setCart(
      cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.price) * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Submit POS Sale & Trigger Invoice
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    // Verify stock availability
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        alert(`Stock issue with ${item.product.name}. Available: ${item.product.stock}`);
        return;
      }
    }

    // 1. Deduct stock in local state immediately
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
        }
        return prod;
      })
    );

    // 2. Prepare Invoice record
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceDate = new Date().toLocaleString();

    const invoiceData = {
      invoice_number: invoiceNumber,
      date: invoiceDate,
      shop_name: currentShop.shop_name,
      shop_number: currentShop.shop_number,
      floor_name: currentShop.floor_name,
      cashier: user?.name || 'Store Cashier',
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        barcode: item.product.barcode,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
        subtotal: parseFloat(item.product.price) * item.quantity,
      })),
      subtotal,
      discount: discountAmount,
      total: grandTotal,
    };

    // 3. Try sending to backend API
    try {
      await api.post('/owner/sales/pos', {
        shop_id: currentShop.id,
        invoice_number: invoiceNumber,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });
    } catch {
      // Offline fallback
    }

    // 4. Update sales list
    const newSale = {
      id: Date.now(),
      shop_id: currentShop.id,
      shop_name: currentShop.shop_name,
      total_amount: grandTotal,
      invoice_number: invoiceNumber,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setSales([newSale, ...sales]);

    // 5. Open printable invoice modal & reset cart
    setActiveInvoice(invoiceData);
    setShowInvoiceModal(true);
    setCart([]);
  };

  // Add Product to Inventory
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProd = {
      id: Date.now(),
      shop_id: currentShop.id,
      shop_name: currentShop.shop_name,
      name: productForm.name,
      barcode: productForm.barcode,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock, 10),
    };

    try {
      const res = await api.post('/owner/products', {
        ...productForm,
        shop_id: currentShop.id,
      });
      if (res.data?.data) {
        setProducts([res.data.data, ...products]);
      } else {
        setProducts([newProd, ...products]);
      }
    } catch {
      setProducts([newProd, ...products]);
    }

    setShowAddProductModal(false);
    setProductForm({ name: '', barcode: '', price: '', stock: '' });
  };

  // Quick adjust stock in inventory table
  const quickAdjustStock = (prodId, delta) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === prodId) {
          const updatedStock = Math.max(0, p.stock + delta);
          api.put(`/owner/products/${prodId}`, { stock: updatedStock }).catch(() => {});
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );
  };

  const navTabs = [
    { id: 'pos', label: 'POS Billing Terminal', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Catalog', icon: Package },
    { id: 'sales', label: 'Sales Invoices', icon: Receipt },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navTabs={navTabs}
        subtitle={`${currentShop.shop_name} • ${currentShop.shop_number} (${currentShop.floor_name})`}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= VIEW 1: SPLIT-SCREEN POS BILLING ================= */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Product Catalog Grid (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* POS Search Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product name or scan barcode..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg hidden sm:inline">
                  {filteredPOSProducts.length} items
                </span>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[680px] overflow-y-auto pr-1">
                {filteredPOSProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLow = product.stock < 15;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-44 relative group cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-white hover:border-indigo-400 hover:shadow-md border-slate-200/90'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-semibold truncate">
                            {product.barcode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isOutOfStock ? 'Sold Out' : `${product.stock} in stock`}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          +
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: Live Cart & Invoice Generation (5 Cols on desktop) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Sale Cart</h3>
                    <p className="text-xs text-slate-400">{cart.length} distinct item(s)</p>
                  </div>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">Your cart is empty</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click products on the left to add items</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {item.product.name}
                        </h5>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ${parseFloat(item.product.price).toFixed(2)} each
                        </div>
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900 w-16 text-right font-mono">
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Calculations */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> Apply Discount (%):
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          discountPercent === pct
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Savings</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Total Payable:</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* POS Sale Action Button */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Complete POS Sale & Print Invoice
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: INVENTORY MANAGEMENT ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name or barcode..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Product to Catalog
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Product Item
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Barcode
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Retail Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Live Stock Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Quick Stock Adjust
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {products
                      .filter((p) =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.barcode.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((product) => {
                        const isLow = product.stock < 20;
                        return (
                          <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-400">ID #{product.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                                {product.barcode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-slate-900">
                                ${parseFloat(product.price).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isLow
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isLow ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                {product.stock} units
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                                <button
                                  onClick={() => quickAdjustStock(product.id, -1)}
                                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                                  title="Deduct 1 unit"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 bg-white text-xs font-bold text-slate-800">
                                  {product.stock}
                                </span>
                                <button
                                  onClick={() => quickAdjustStock(product.id, 1)}
                                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                                  title="Add 1 unit"
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
          </div>
        )}

        {/* ================= VIEW 3: SALES HISTORY ================= */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Point of Sale Transaction Invoices</h3>
                <span className="text-xs font-bold text-slate-500">{sales.length} verified sales</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Receipt Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-slate-900">
                          {sale.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {sale.created_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-emerald-600">
                          ${parseFloat(sale.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: PRINTABLE INVOICE ================= */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Printable Receipt Container */}
            <div id="printable-receipt" className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 space-y-4">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  {activeInvoice.shop_name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shop {activeInvoice.shop_number} &bull; {activeInvoice.floor_name}
                </p>
                <p className="text-[11px] text-slate-400">Smart Mall Commercial Complex</p>
              </div>

              {/* Receipt Meta */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-bold text-slate-900">{activeInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{activeInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{activeInvoice.cashier}</span>
                </div>
              </div>

              {/* Itemized Lines */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                  <span>Item & Qty</span>
                  <span>Total</span>
                </div>
                {activeInvoice.items.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div className="pr-2">
                      <div className="font-bold text-slate-800">{line.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {line.quantity} x ${line.price.toFixed(2)} [{line.barcode}]
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 font-mono">
                      ${line.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${activeInvoice.subtotal.toFixed(2)}</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-${activeInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>TOTAL PAID:</span>
                  <span>${activeInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Barcode Simulation & Footer */}
              <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1 text-[10px] text-slate-400">
                <div className="tracking-widest font-mono text-slate-800 text-xs font-bold">
                  ||||| |||| |||||| ||||| |||||
                </div>
                <p>Thank you for visiting Smart Mall!</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PRODUCT ================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Product to Store</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Cotton Polo"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Barcode (Scan or Type)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8905678001"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1499.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="40"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm"
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
