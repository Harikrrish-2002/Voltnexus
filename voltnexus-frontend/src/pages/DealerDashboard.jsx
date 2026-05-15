import React, { useState } from 'react';
import { User, Package, ShoppingCart, CreditCard, CheckCircle, Truck, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import api from '../api';

const DealerDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Mock Data
    const [dealerProfile, setDealerProfile] = useState({
        name: '',
        email: '',
        phone: '',
        region: '',
        address: ''
    });

    // Data State
    const [orders, setOrders] = useState([]);
    const [parts, setParts] = useState([]);
    const [payments, setPayments] = useState([]);

    // Fetch Data
    const fetchData = React.useCallback(async () => {
        try {
            const [partsRes, ordersRes] = await Promise.all([
                api.get('/parts'),
                api.get('/orders')
            ]);
            setParts(partsRes.data);
            setOrders(ordersRes.data);
            
            // For Dealer Dashboard, Payments tab should show the payments made by Workers for part orders.
            // All part orders are paid before being created, so we can map orders directly to payments.
            const formattedPayments = ordersRes.data.map(order => ({
                id: order._id, // transaction ID equivalent for dealer dashboard
                workerName: order.worker?.name || 'Unknown Worker',
                partName: order.part?.name || 'Unknown Part',
                amount: `₹${order.totalCost}`,
                status: 'Paid', // Assuming order creation means successful payment
                date: new Date(order.createdAt).toLocaleDateString()
            }));
            setPayments(formattedPayments);
        } catch (error) {
            console.error("Failed to fetch dealer data", error);
        }
    }, []);

    React.useEffect(() => {
        const fetchDealerProfile = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    setDealerProfile(prev => ({
                        ...prev,
                        name: parsedUser.name || '',
                        email: parsedUser.email || '',
                        phone: parsedUser.phone || ''
                    }));
                }

                const { data } = await api.get('/auth/me');
                setDealerProfile(prev => ({
                    ...prev,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                }));
            } catch (error) {
                console.error("Failed to fetch dealer profile", error);
            }
        };

        fetchDealerProfile();
        fetchData();
    }, [fetchData]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(dealerProfile);

    const [showAddPartModal, setShowAddPartModal] = useState(false);
    const [isEditingPart, setIsEditingPart] = useState(false);
    const [currentPartId, setCurrentPartId] = useState(null);
    const [newPart, setNewPart] = useState({
        name: '',
        category: '',
        price: '',
        stock: ''
    });

    // Handlers
    const handleProfileEdit = () => {
        if (isEditingProfile) {
            setDealerProfile(tempProfile);
            setIsEditingProfile(false);
        } else {
            setTempProfile(dealerProfile);
            setIsEditingProfile(true);
        }
    };

    const handleProfileChange = (e) => {
        setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    };

    const handleNewPartChange = (e) => {
        setNewPart({ ...newPart, [e.target.name]: e.target.value });
    };

    const openAddPartModal = () => {
        setNewPart({ name: '', category: '', price: '', stock: '' });
        setIsEditingPart(false);
        setCurrentPartId(null);
        setShowAddPartModal(true);
    };

    const handleEditPart = (part) => {
        setNewPart({
            name: part.name,
            category: part.category,
            price: part.price.toString(),
            stock: part.stock.toString()
        });
        setIsEditingPart(true);
        setCurrentPartId(part._id);
        setShowAddPartModal(true);
    };

    const handleDeletePart = async (id) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await api.delete(`/parts/${id}`);
                setParts(parts.filter(p => p._id !== id));
            } catch (error) {
                console.error("Failed to delete part", error);
                alert("Failed to delete part");
            }
        }
    };

    const handleAddPartSubmit = async (e) => {
        e.preventDefault();
        try {
            const partData = {
                name: newPart.name,
                category: newPart.category,
                price: parseFloat(newPart.price),
                stock: parseInt(newPart.stock)
            };

            if (isEditingPart) {
                const { data } = await api.put(`/parts/${currentPartId}`, partData);
                setParts(parts.map(p => p._id === currentPartId ? data : p));
                alert('Spare Part Updated Successfully!');
            } else {
                const { data } = await api.post('/parts', partData);
                setParts([...parts, data]);
                alert('Spare Part Added Successfully!');
            }
            setShowAddPartModal(false);
        } catch (error) {
            console.error("Failed to save part", error);
            alert("Failed to save part: " + (error.response?.data?.message || error.message));
        }
    };

    const handleOrderStatus = async (id) => {
        const order = orders.find(o => o._id === id);
        if (!order) return;

        const nextStatus = order.status === 'Pending' ? 'Shipped' : order.status === 'Shipped' ? 'Delivered' : 'Delivered';

        try {
            const { data } = await api.put(`/orders/${id}/status`, { status: nextStatus });
            setOrders(orders.map(o => o._id === id ? { ...o, status: data.status } : o));
        } catch (error) {
            console.error("Failed to update order status", error);
            alert("Failed to update order status");
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Dealer Profile</h2>
                            <button
                                onClick={handleProfileEdit}
                                className={`${isEditingProfile ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                            >
                                {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="space-y-4 max-w-xl">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Company Name</label>
                                {isEditingProfile ? (
                                    <input name="name" value={tempProfile.name} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{dealerProfile.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Email</label>
                                {isEditingProfile ? (
                                    <input name="email" value={tempProfile.email} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{dealerProfile.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
                                {isEditingProfile ? (
                                    <input name="phone" value={tempProfile.phone} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{dealerProfile.phone}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Address</label>
                                {isEditingProfile ? (
                                    <textarea name="address" value={tempProfile.address} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{dealerProfile.address}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Received Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Worker</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No orders received.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{order._id.substring(order._id.length - 6)}</td>
                                                <td className="px-6 py-4 text-white font-medium">{order.part?.name || 'Unknown Part'} <span className="text-gray-500 text-xs">x{order.quantity}</span></td>
                                                <td className="px-6 py-4">{order.worker?.name || 'Unknown Worker'}</td>
                                                <td className="px-6 py-4">₹{order.totalCost}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                        order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.status !== 'Delivered' && (
                                                        <button onClick={() => handleOrderStatus(order._id)} className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                                                            <Truck className="h-4 w-4" />
                                                            {order.status === 'Pending' ? 'Ship Order' : 'Mark Delivered'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'parts':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Spare Parts Inventory</h3>
                                <button onClick={openAddPartModal} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Part
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {parts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No spare parts in inventory.
                                                </td>
                                            </tr>
                                        ) : (
                                            parts.map((part) => (
                                                <tr key={part._id} className="text-gray-300 hover:bg-slate-800/30">
                                                    <td className="px-6 py-4 text-white font-medium">{part.name}</td>
                                                    <td className="px-6 py-4">{part.category}</td>
                                                    <td className="px-6 py-4">₹{part.price}</td>
                                                    <td className="px-6 py-4">{part.stock}</td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button onClick={() => handleEditPart(part)} className="text-gray-400 hover:text-white"><Edit2 className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDeletePart(part._id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Add/Edit Part Modal */}
                        {showAddPartModal && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">{isEditingPart ? 'Edit Spare Part' : 'Add New Spare Part'}</h3>
                                        <button onClick={() => setShowAddPartModal(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                                    </div>
                                    <form onSubmit={handleAddPartSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-1">Part Name</label>
                                            <input type="text" name="name" value={newPart.name} onChange={handleNewPartChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" required placeholder="e.g. iPhone 13 Screen" />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-1">Category</label>
                                            <select name="category" value={newPart.category} onChange={handleNewPartChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" required>
                                                <option value="">Select Category</option>
                                                <option value="Screen">Screen</option>
                                                <option value="Battery">Battery</option>
                                                <option value="Motherboard">Motherboard</option>
                                                <option value="Camera">Camera</option>
                                                <option value="Consumable">Consumable</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-400 block mb-1">Price (₹)</label>
                                                <input type="number" name="price" value={newPart.price} onChange={handleNewPartChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" min="0" required placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-400 block mb-1">Stock Qty</label>
                                                <input type="number" name="stock" value={newPart.stock} onChange={handleNewPartChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" min="0" required placeholder="0" />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowAddPartModal(false)} className="text-gray-400 hover:text-white px-4 py-2">Cancel</button>
                                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">{isEditingPart ? 'Update Part' : 'Add Part'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'payments':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Transaction / Order ID</th>
                                        <th className="px-6 py-4">Worker Name</th>
                                        <th className="px-6 py-4">Part Details</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="text-gray-300 hover:bg-slate-800/30">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.id}</td>
                                            <td className="px-6 py-4 text-white font-medium">{payment.workerName}</td>
                                            <td className="px-6 py-4">{payment.partName}</td>
                                            <td className="px-6 py-4">{payment.amount}</td>
                                            <td className="px-6 py-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">{payment.status}</span></td>
                                            <td className="px-6 py-4 text-sm">{payment.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dealer Dashboard</h1>
                    <p className="text-gray-400">Welcome, {dealerProfile.name || 'Dealer'}!</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-4 space-y-2">
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <User className="h-5 w-5" /> My Profile
                            </button>
                            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <ShoppingCart className="h-5 w-5" /> Received Orders
                            </button>
                            <button onClick={() => setActiveTab('parts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'parts' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Package className="h-5 w-5" /> Spare Parts
                            </button>
                            <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <CreditCard className="h-5 w-5" /> Payments
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerDashboard;
