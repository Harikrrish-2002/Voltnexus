import React, { useState, useEffect } from 'react';
import { User, Wrench, FileText, ShoppingCart, CreditCard, Briefcase, Search, Eye, X, Plus, Users, CheckCircle, Trash2, Package } from 'lucide-react';
import api from '../api';

const WorkerDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Mock Data
    const [workerProfile, setWorkerProfile] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: ''
    });

    useEffect(() => {
        const fetchWorkerProfile = async () => {
            try {
                // First try to get from localStorage for immediate display
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    setWorkerProfile(prev => ({
                        ...prev,
                        name: parsedUser.name || '',
                        email: parsedUser.email || '',
                        phone: parsedUser.phone || ''
                    }));
                }

                // Then fetch fresh data from API
                const { data } = await api.get('/auth/me');
                setWorkerProfile(prev => ({
                    ...prev,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    // specialization might be added later to schema
                }));
            } catch (error) {
                console.error("Failed to fetch worker profile", error);
            }
        };

        fetchWorkerProfile();
    }, []);

    // Worker's Admin State
    const [users, setUsers] = useState([]);
    const [allWorkers, setAllWorkers] = useState([]);
    const [approvals, setApprovals] = useState([]);

    // Fetch Admin Data
    useEffect(() => {
        const fetchAdminData = async () => {
            // Only fetch if worker has admin privileges (which they do now based on middleware)
            try {
                const { data } = await api.get('/users');
                const pending = data.filter(u => u.status === 'Pending');
                const activeWorkers = data.filter(u => u.role === 'Worker' && (u.status === 'Active' || u.status === 'Approved'));
                const activeUsers = data.filter(u => u.role === 'User');

                setApprovals(pending);
                setUsers(activeUsers.map(u => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    status: u.status,
                    joined: u.createdAt ? u.createdAt.substring(0, 10) : 'N/A'
                })));
                setAllWorkers(activeWorkers.map(u => ({
                    id: u._id,
                    name: u.name,
                    specialization: 'General',
                    status: u.status,
                    rating: 0,
                    logs: []
                })));
            } catch (error) {
                console.error("Error fetching admin data", error);
            }
        };
        fetchAdminData();
    }, []);

    const handleDeleteDealer = async (id) => {
        if (window.confirm('Are you sure you want to delete this dealer?')) {
            try {
                await api.delete(`/users/${id}`);
                setDealers(dealers.filter(d => d._id !== id));
                alert('Dealer deleted successfully');
            } catch (error) {
                console.error("Failed to delete dealer", error);
                alert(error.response?.data?.message || 'Error deleting dealer');
            }
        }
    };

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(workerProfile);

    const [assignedRepairs, setAssignedRepairs] = useState([]);

    useEffect(() => {
        const fetchRepairs = async () => {
            try {
                const { data } = await api.get('/complaints/all');
                const formattedRepairs = data.map(complaint => ({
                    _id: complaint._id,
                    id: complaint.ticketId,
                    device: `${complaint.deviceType} ${complaint.model}`,
                    user: complaint.user?.name || 'Unknown User',
                    issue: complaint.issue,
                    status: complaint.status,
                    date: new Date(complaint.createdAt).toLocaleDateString()
                }));
                setAssignedRepairs(formattedRepairs);
            } catch (error) {
                console.error("Failed to fetch repairs", error);
            }
        };

        fetchRepairs();
    }, []);

    const [orders, setOrders] = useState([]);
    const [parts, setParts] = useState([]);

    useEffect(() => {
        const fetchPartsAndOrders = async () => {
            try {
                const [partsRes, ordersRes] = await Promise.all([
                    api.get('/parts'),
                    api.get('/orders')
                ]);
                setParts(partsRes.data);
                setOrders(ordersRes.data);
            } catch (error) {
                console.error("Failed to fetch parts and orders", error);
            }
        };

        fetchPartsAndOrders();
    }, []);

    const [dealers, setDealers] = useState([]);

    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const { data } = await api.get('/users/dealers');
                setDealers(data);
            } catch (error) {
                console.error("Failed to fetch dealers", error);
            }
        };

        fetchDealers();
    }, []);

    const [payments, setPayments] = useState([]);

    const [bills, setBills] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const { data } = await api.get('/payments/all');
                const formattedBills = data.map(payment => ({
                    id: payment._id,
                    repairId: payment.complaint?.ticketId || 'N/A',
                    user: payment.user?.name || 'Unknown User',
                    amount: `₹${payment.amount}`,
                    status: payment.status,
                    transactionId: payment.transactionId || 'N/A',
                    paymentMethod: payment.paymentMethod || 'N/A',
                    date: new Date(payment.createdAt).toLocaleDateString()
                }));
                setBills(formattedBills);
                setPayments(formattedBills.filter(b => b.status === 'Completed'));
            } catch (error) {
                console.error("Failed to fetch bills", error);
            }
        };

        fetchBills();
    }, []);

    const [showBillModal, setShowBillModal] = useState(false);
    const [newBill, setNewBill] = useState({
        repairId: '',
        user: '',
        device: '',
        issue: '',
        sparePartsCost: '',
        serviceCharge: '',
        tax: '',
        total: 0,
        selectedParts: []
    });

    const handleStatusChange = async (repair_Id, newStatus) => {
        try {
            await api.put(`/complaints/${repair_Id}/status`, { status: newStatus });

            // Update local state to reflect change immediately
            setAssignedRepairs(prev => prev.map(repair =>
                repair._id === repair_Id ? { ...repair, status: newStatus } : repair
            ));
            alert('Status updated successfully!');
        } catch (error) {
            console.error("Failed to update status", error);
            alert('Failed to update status. Please try again.');
        }
    };

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrderPart, setSelectedOrderPart] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [isOrdering, setIsOrdering] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOrderPart = async (partId, quantity) => {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 1. Create Razorpay order on backend
            const { data } = await api.post('/orders/create-razorpay-order', { partId, quantity });
            
            if (!data || !data.order) {
                alert("Server error. Please try again.");
                return;
            }

            const options = {
                key: "rzp_test_SXIODGUEqFgs9H",
                amount: data.order.amount,
                currency: data.order.currency,
                name: "VoltNexus Parts",
                description: "Spare Part Checkout",
                order_id: data.order.id,
                prefill: {
                    name: workerProfile.name,
                    email: workerProfile.email,
                    contact: workerProfile.phone
                },
                theme: {
                    color: "#06b6d4"
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    {
                                        method: "upi",
                                        flows: ["collect", "qr"]
                                    }
                                ]
                            }
                        },
                        sequence: ["block.upi"],
                        preferences: {
                            show_default_blocks: true,
                        }
                    }
                },
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            partId: data.partId,
                            quantity: data.quantity
                        };
                        const verifyRes = await api.post('/orders/verify-razorpay-payment', verifyData);
                        if (verifyRes.data.success) {
                            alert("Payment Successful! Order placed.");
                            // Refresh parts and orders after successful order
                            const [partsRes, ordersRes] = await Promise.all([
                                api.get('/parts'),
                                api.get('/orders')
                            ]);
                            setParts(partsRes.data);
                            setOrders(ordersRes.data);
                            setShowOrderModal(false);
                            setActiveTab('orders');
                        }
                    } catch (error) {
                         console.error("Payment Verification Failed", error);
                         alert(error.response?.data?.message || "Payment Verification Failed. Please contact support.");
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Failed to initiate payment", error);
            alert("Failed to initiate order checkout: " + (error.response?.data?.message || error.message));
        }
    };

    // Handlers
    const handleProfileEdit = () => {
        if (isEditingProfile) {
            setWorkerProfile(tempProfile);
            setIsEditingProfile(false);
        } else {
            setTempProfile(workerProfile);
            setIsEditingProfile(true);
        }
    };

    const handleProfileChange = (e) => {
        setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    };

    const handleCreateBill = () => {
        setNewBill({
            repairId: '',
            user: '',
            device: '',
            issue: '',
            sparePartsCost: '',
            serviceCharge: '',
            tax: '',
            total: 0,
            selectedParts: []
        });
        setShowBillModal(true);
    };

    const handlePartSelection = (e, part) => {
        const isChecked = e.target.checked;
        setNewBill(prev => {
            const currentParts = prev.selectedParts || [];
            const newSelectedParts = isChecked 
                ? [...currentParts, part._id] 
                : currentParts.filter(id => id !== part._id);
            
            const newSpareCost = parts
                .filter(p => newSelectedParts.includes(p._id))
                .reduce((sum, p) => sum + p.price, 0);

            const serviceCost = Number(prev.serviceCharge) || 0;
            const taxPercent = Number(prev.tax) || 0;

            const subtotal = newSpareCost + serviceCost;
            const taxAmount = (subtotal * taxPercent) / 100;
            const total = subtotal + taxAmount;

            return {
                ...prev,
                selectedParts: newSelectedParts,
                sparePartsCost: newSpareCost,
                total
            };
        });
    };

    const handleBillChange = (e) => {
        const { name, value } = e.target;

        if (name === 'repairId') {
            const selectedRepair = assignedRepairs.find(r => r._id === value);
            if (selectedRepair) {
                // We need the original user's ID to bill them. We stored user as a name, so let's
                // find the matching complaint to get the actual user ID from the backend.
                api.get('/complaints/all').then(res => {
                    const complaintData = res.data.find(c => c._id === value);
                    setNewBill(prev => ({
                        ...prev,
                        repairId: value,
                        user: selectedRepair.user,
                        userId: complaintData?.user?._id, // Save the actual Customer ID
                        device: selectedRepair.device,
                        issue: selectedRepair.issue,
                    }));
                });
            } else {
                setNewBill(prev => ({ ...prev, repairId: value, user: '', userId: '', device: '', issue: '' }));
            }
        } else {
            setNewBill(prev => {
                const newValue = value === '' ? '' : parseFloat(value);
                const updated = { ...prev, [name]: newValue };

                const partCost = Number(updated.sparePartsCost) || 0;
                const serviceCost = Number(updated.serviceCharge) || 0;
                const taxPercent = Number(updated.tax) || 0;

                const subtotal = partCost + serviceCost;
                const taxAmount = (subtotal * taxPercent) / 100;
                const total = subtotal + taxAmount;

                return { ...updated, total };
            });
        }
    };

    const handleBillSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post('/payments', {
                amount: newBill.total,
                description: `Bill for ${newBill.device} - Issue: ${newBill.issue}`,
                complaintId: newBill.repairId,
                userId: newBill.userId // Pass the customer ID so they get the bill
            });

            // Re-fetch all bills to show the newly created one
            const { data } = await api.get('/payments/all');
            const formattedBills = data.map(payment => ({
                id: payment._id,
                repairId: payment.complaint?.ticketId || 'N/A',
                user: payment.user?.name || 'Unknown User',
                amount: `₹${payment.amount}`,
                status: payment.status,
                transactionId: payment.transactionId || 'N/A',
                paymentMethod: payment.paymentMethod || 'N/A',
                date: new Date(payment.createdAt).toLocaleDateString()
            }));
            setBills(formattedBills);
            setPayments(formattedBills.filter(b => b.status === 'Completed'));

            setShowBillModal(false);
            alert('Bill Created Successfully!');

        } catch (error) {
            console.error("Failed to create bill", error);
            alert("Failed to create bill. Please try again.");
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Worker Profile</h2>
                            <button
                                onClick={handleProfileEdit}
                                className={`${isEditingProfile ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                            >
                                {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="space-y-4 max-w-xl">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Name</label>
                                {isEditingProfile ? (
                                    <input name="name" value={tempProfile.name} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{workerProfile.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Email</label>
                                {isEditingProfile ? (
                                    <input name="email" value={tempProfile.email} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{workerProfile.email}</p>}
                            </div>

                        </div>
                    </div>
                );
            case 'repairs':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">My Repairs</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Device</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Issue</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {assignedRepairs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No assigned repairs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        assignedRepairs.map((repair) => (
                                            <tr key={repair.id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{repair.id}</td>
                                                <td className="px-6 py-4 text-white font-medium">{repair.device}</td>
                                                <td className="px-6 py-4">{repair.user}</td>
                                                <td className="px-6 py-4">{repair.issue}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={repair.status}
                                                        onChange={(e) => handleStatusChange(repair._id, e.target.value)}
                                                        className={`bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm outline-none cursor-pointer
                                                            ${repair.status === 'Completed' ? 'text-green-400 border-green-500/30' :
                                                                repair.status === 'In Progress' ? 'text-blue-400 border-blue-500/30' :
                                                                    repair.status === 'Waiting for parts' ? 'text-orange-400 border-orange-500/30' :
                                                                        repair.status === 'Not repairable' ? 'text-red-400 border-red-500/30' :
                                                                            'text-yellow-400 border-yellow-500/30'}`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Waiting for parts">Waiting for parts</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Not repairable">Not repairable</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{repair.date}</td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Parts Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{order._id.substring(order._id.length - 6)}</td>
                                                <td className="px-6 py-4 text-white font-medium">{order.part?.name || 'Unknown Part'} <span className="text-gray-500 text-xs">x{order.quantity}</span></td>
                                                <td className="px-6 py-4">₹{order.totalCost}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                        order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>{order.status}</span></td>
                                                <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'parts':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Available Spare Parts</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Part Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Dealer</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {parts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No spare parts available at the moment.
                                            </td>
                                        </tr>
                                    ) : (
                                        parts.map((part) => (
                                            <tr key={part._id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4 text-white font-medium">{part.name}</td>
                                                <td className="px-6 py-4">{part.category}</td>
                                                <td className="px-6 py-4">{part.dealer?.name || 'Unknown Dealer'}</td>
                                                <td className="px-6 py-4">₹{part.price}</td>
                                                <td className="px-6 py-4">{part.stock}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrderPart(part);
                                                            setOrderQuantity(1);
                                                            setShowOrderModal(true);
                                                        }}
                                                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-sm transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <ShoppingCart className="h-4 w-4" /> Order
                                                    </button>
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'billings':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">My Billings</h3>
                                <button onClick={handleCreateBill} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <Plus className="h-5 w-5" /> Create New Bill
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Bill ID</th>
                                            <th className="px-6 py-4">Repair ID</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {bills.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No bills created yet.</td></tr>
                                        ) : (
                                            bills.map((bill) => (
                                                <tr key={bill.id} className="text-gray-300 hover:bg-slate-800/30">
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{bill.id}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-cyan-400">{bill.repairId}</td>
                                                    <td className="px-6 py-4 text-white font-medium">{bill.user}</td>
                                                    <td className="px-6 py-4">{bill.amount}</td>
                                                    <td className="px-6 py-4 text-sm">{bill.date}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bill Modal */}
                        {showBillModal && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Create New Bill</h3>
                                        <button onClick={() => setShowBillModal(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                                    </div>
                                    <form onSubmit={handleBillSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-1">Select Repair Request</label>
                                            <select name="repairId" value={newBill.repairId} onChange={handleBillChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" required>
                                                <option value="">-- Select Repair --</option>
                                                {assignedRepairs.filter(r => r.status !== 'Completed' || true).map(r => ( // Showing all for demo
                                                    <option key={r._id} value={r._id}>{r.id} - {r.device} ({r.user})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-400 block mb-1">User</label>
                                                <input type="text" value={newBill.user} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-gray-300 cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-400 block mb-1">Device</label>
                                                <input type="text" value={newBill.device} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-gray-300 cursor-not-allowed" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-1">Issue</label>
                                            <input type="text" value={newBill.issue} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-gray-300 cursor-not-allowed" />
                                        </div>

                                        <div className="border-t border-slate-700 pt-4 mt-4">
                                            <h4 className="text-white font-medium mb-3">Replaced Parts</h4>
                                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                                                {parts.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No parts available in inventory.</p>
                                                ) : (
                                                    parts.map(part => (
                                                        <label key={part._id} className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={newBill.selectedParts?.includes(part._id) || false}
                                                                onChange={(e) => handlePartSelection(e, part)}
                                                                className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 h-4 w-4 cursor-pointer"
                                                            />
                                                            <span className="flex-1">{part.name} <span className="text-gray-500 text-xs">({part.category})</span></span>
                                                            <span className="font-medium text-cyan-400">₹{part.price}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-700 pt-4 mt-4">
                                            <h4 className="text-white font-medium mb-3">Cost Details (₹)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-1">Spare Parts</label>
                                                    <input type="number" name="sparePartsCost" value={newBill.sparePartsCost} onChange={handleBillChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" min="0" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-1">Service Charge</label>
                                                    <input type="number" name="serviceCharge" value={newBill.serviceCharge} onChange={handleBillChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" min="0" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-1">Tax (%)</label>
                                                    <input type="number" name="tax" value={newBill.tax} onChange={handleBillChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" min="0" max="100" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <span className="text-lg text-gray-300">Total Amount:</span>
                                            <span className="text-2xl font-bold text-green-400">₹{newBill.total.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button type="button" onClick={() => setShowBillModal(false)} className="text-gray-400 hover:text-white mr-4">Cancel</button>
                                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">Generate Bill</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'dealers':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Dealers List</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {dealers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No dealers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        dealers.map((dealer) => (
                                            <tr key={dealer._id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4 text-white font-medium">{dealer.name}</td>
                                                <td className="px-6 py-4">{dealer.phone || 'N/A'}</td>
                                                <td className="px-6 py-4">{dealer.email}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteDealer(dealer._id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'payments':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Payment Status</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Repair ID</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="text-gray-300 hover:bg-slate-800/30">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.repairId}</td>
                                            <td className="px-6 py-4 text-white font-medium">{payment.user}</td>
                                            <td className="px-6 py-4">{payment.amount}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${payment.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{payment.status}</span></td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.transactionId}</td>
                                            <td className="px-6 py-4">{payment.paymentMethod}</td>
                                            <td className="px-6 py-4 text-sm">{payment.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Registered Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="text-gray-300 hover:bg-slate-800/30">
                                                <td className="px-6 py-4">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">{user.status}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )))}
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
                    <h1 className="text-3xl font-bold text-white">Worker Dashboard</h1>
                    <p className="text-gray-400">Welcome, {workerProfile.name || 'Worker'}!</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-4 space-y-2">
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <User className="h-5 w-5" /> My Profile
                            </button>
                            <button onClick={() => setActiveTab('repairs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'repairs' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Wrench className="h-5 w-5" /> My Repairs
                            </button>
                            <button onClick={() => setActiveTab('billings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'billings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <FileText className="h-5 w-5" /> Billings
                            </button>
                            <button onClick={() => setActiveTab('dealers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dealers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Briefcase className="h-5 w-5" /> Dealers
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Users className="h-5 w-5" /> Users
                            </button>
                            <button onClick={() => setActiveTab('parts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'parts' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Package className="h-5 w-5" /> Spare Parts
                            </button>
                            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <ShoppingCart className="h-5 w-5" /> My Orders
                            </button>
                            <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <CreditCard className="h-5 w-5" /> Payment Gateway
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Order Part Modal */}
            {showOrderModal && selectedOrderPart && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Order Spare Part</h3>
                            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h4 className="text-lg font-semibold text-white mb-2">{selectedOrderPart.name}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                                    <div>Category: <span className="text-white">{selectedOrderPart.category}</span></div>
                                    <div>Dealer: <span className="text-white">{selectedOrderPart.dealer?.name || 'Unknown Dealer'}</span></div>
                                    <div>Price/Unit: <span className="text-cyan-400">₹{selectedOrderPart.price}</span></div>
                                    <div>Stock: <span className="text-white">{selectedOrderPart.stock} units left</span></div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={orderQuantity}
                                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                    min="1"
                                    max={selectedOrderPart.stock}
                                />
                            </div>

                            <div className="border-t border-slate-700 pt-4 mt-4">
                                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <span className="text-lg text-gray-300">Total Payment:</span>
                                    <span className="text-2xl font-bold text-green-400">₹{(selectedOrderPart.price * orderQuantity).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button type="button" onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-white px-4 py-2" disabled={isOrdering}>Cancel</button>
                                <button
                                    onClick={async () => {
                                        setIsOrdering(true);
                                        await handleOrderPart(selectedOrderPart._id, orderQuantity);
                                        setIsOrdering(false);
                                        setShowOrderModal(false);
                                    }}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    disabled={isOrdering || orderQuantity > selectedOrderPart.stock || orderQuantity < 1}
                                >
                                    <CreditCard className="h-5 w-5" />
                                    {isOrdering ? 'Processing...' : 'Pay & Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;
